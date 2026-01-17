export class Network {
    constructor(game) {
        this.game = game;
        this.socket = null;
        this.connected = false;
        this.roomCode = null;
        this.playerId = null;
        this.players = [];
        this.isHost = false;

        this.onRoomCreated = null;
        this.onRoomJoined = null;
        this.onGameStarted = null;
        this.onPlayerJoined = null;
        this.onPlayerLeft = null;
        this.onChatMessage = null;
        this.onError = null;
    }

    connect(serverUrl = '') {
        return new Promise((resolve, reject) => {
            // Use Socket.io from CDN
            if (!window.io) {
                const script = document.createElement('script');
                script.src = 'https://cdn.socket.io/4.7.2/socket.io.min.js';
                script.onload = () => {
                    this.initSocket(serverUrl);
                    resolve();
                };
                script.onerror = reject;
                document.head.appendChild(script);
            } else {
                this.initSocket(serverUrl);
                resolve();
            }
        });
    }

    initSocket(serverUrl) {
        this.socket = io(serverUrl || window.location.origin);

        this.socket.on('connect', () => {
            this.connected = true;
            console.log('Connected to server');
        });

        this.socket.on('disconnect', () => {
            this.connected = false;
            console.log('Disconnected from server');
        });

        this.socket.on('roomCreated', (data) => {
            this.roomCode = data.code;
            this.playerId = data.playerId;
            this.players = data.players;
            this.isHost = true;
            if (this.onRoomCreated) this.onRoomCreated(data);
        });

        this.socket.on('roomJoined', (data) => {
            this.roomCode = data.code;
            this.playerId = data.playerId;
            this.players = data.players;
            this.isHost = false;
            if (this.onRoomJoined) this.onRoomJoined(data);
        });

        this.socket.on('joinError', (data) => {
            if (this.onError) this.onError(data.message);
        });

        this.socket.on('playerJoined', (data) => {
            this.players = data.players;
            if (this.onPlayerJoined) this.onPlayerJoined(data);
        });

        this.socket.on('playerLeft', (data) => {
            this.players = data.players;
            if (this.onPlayerLeft) this.onPlayerLeft(data);
        });

        this.socket.on('hostChanged', (data) => {
            this.isHost = data.hostId === this.playerId;
        });

        this.socket.on('gameStarted', (data) => {
            if (this.onGameStarted) this.onGameStarted(data);
        });

        this.socket.on('gameState', (data) => {
            this.handleGameStateUpdate(data);
        });

        this.socket.on('buildingPlaced', (data) => {
            // Update local resources
            this.game.resources = data.resources;
        });

        this.socket.on('buildingFailed', (data) => {
            console.warn('Building failed:', data.message);
        });

        this.socket.on('chatMessage', (data) => {
            if (this.onChatMessage) this.onChatMessage(data);
        });

        this.socket.on('gameOver', (data) => {
            this.game.gameOver = true;
            this.game.ui.showGameOver();
        });
    }

    createRoom(playerName) {
        if (this.socket) {
            this.socket.emit('createRoom', { name: playerName });
        }
    }

    joinRoom(roomCode, playerName) {
        if (this.socket) {
            this.socket.emit('joinRoom', { code: roomCode, name: playerName });
        }
    }

    startGame(gameMode = 'waves') {
        if (this.socket && this.isHost) {
            this.socket.emit('startGame', { gameMode });
        }
    }

    placeBuilding(gridX, gridY, buildingType) {
        if (this.socket) {
            this.socket.emit('placeBuilding', { gridX, gridY, buildingType });
        }
    }

    sendChatMessage(message) {
        if (this.socket) {
            this.socket.emit('chatMessage', { message });
        }
    }

    handleGameStateUpdate(data) {
        const state = data.state;

        // Update game state from server
        this.game.resources = state.resources;
        this.game.nexus.health = state.nexusHealth;
        this.game.waveNumber = state.waveNumber;

        // Sync enemies
        this.syncEnemies(state.enemies);

        // Sync turret angles
        for (const serverTurret of state.turrets) {
            const localTurret = this.game.turrets.find(t => t.id === serverTurret.id);
            if (localTurret) {
                localTurret.angle = serverTurret.angle;
            }
        }
    }

    syncEnemies(serverEnemies) {
        // Update existing enemies
        for (const serverEnemy of serverEnemies) {
            let localEnemy = this.game.enemies.find(e => e.id === serverEnemy.id);

            if (!localEnemy) {
                // Enemy doesn't exist locally, create it
                localEnemy = {
                    id: serverEnemy.id,
                    type: serverEnemy.type,
                    x: serverEnemy.x,
                    y: serverEnemy.y,
                    health: serverEnemy.health,
                    maxHealth: serverEnemy.maxHealth,
                    config: this.game.getEnemyConfig(serverEnemy.type),
                    angle: serverEnemy.angle || 0,
                    burning: serverEnemy.burning,
                    dead: false
                };
                this.game.enemies.push(localEnemy);
            } else {
                // Interpolate position
                const lerpFactor = 0.3;
                localEnemy.x += (serverEnemy.x - localEnemy.x) * lerpFactor;
                localEnemy.y += (serverEnemy.y - localEnemy.y) * lerpFactor;
                localEnemy.health = serverEnemy.health;
                localEnemy.angle = serverEnemy.angle || localEnemy.angle;
                localEnemy.burning = serverEnemy.burning;
            }
        }

        // Remove enemies that don't exist on server
        const serverIds = new Set(serverEnemies.map(e => e.id));
        this.game.enemies = this.game.enemies.filter(e => serverIds.has(e.id));
    }

    isMultiplayer() {
        return this.connected && this.roomCode !== null;
    }
}
