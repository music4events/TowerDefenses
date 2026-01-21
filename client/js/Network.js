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
        this.onLeaderboard = null;
        this.onGameOver = null;
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
        // Auto-detect server URL (works locally and on Railway)
        const url = serverUrl || window.location.origin;
        console.log('Connecting to server:', url);

        // Configure Socket.IO with reconnection settings
        this.socket = io(url, {
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 60000,
            transports: ['websocket', 'polling']
        });

        this.socket.on('connect', () => {
            this.connected = true;
            console.log('Connected to server');

            // If we were in a room before disconnect, try to rejoin
            if (this.roomCode && this._wasDisconnected && this._playerName) {
                console.log('Attempting to rejoin room', this.roomCode, 'after reconnection...');
                this.socket.emit('rejoinRoom', {
                    code: this.roomCode,
                    name: this._playerName
                });
            }
            this._wasDisconnected = false;
        });

        this.socket.on('disconnect', (reason) => {
            this.connected = false;
            this._wasDisconnected = true;
            console.log('Disconnected from server:', reason);

            // Show user-friendly message
            if (reason === 'io server disconnect') {
                console.warn('Server forcibly disconnected the client');
            } else if (reason === 'transport close') {
                console.warn('Connection lost - will attempt to reconnect...');
            } else if (reason === 'ping timeout') {
                console.warn('Ping timeout - server not responding');
            }
        });

        this.socket.on('connect_error', (error) => {
            console.warn('Connection error:', error.message);
        });

        this.socket.on('reconnect', (attemptNumber) => {
            console.log('Reconnected after', attemptNumber, 'attempts');
        });

        this.socket.on('reconnect_attempt', (attemptNumber) => {
            console.log('Reconnection attempt', attemptNumber);
        });

        // Handle rejoin success
        this.socket.on('rejoinSuccess', (data) => {
            console.log('Successfully rejoined room', data.code);
            this.roomCode = data.code;
            this.playerId = data.playerId;
            this.players = data.players;

            // If game was started, restore state by calling the game state handler
            if (data.started && data.gameState) {
                this.handleGameStateUpdate({ state: data.gameState });
            }
        });

        this.socket.on('rejoinError', (data) => {
            console.warn('Failed to rejoin room:', data.message);
            this.roomCode = null;
            this._wasDisconnected = false;
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
            if (this.game) {
                this.game.gameOver = true;
                this.game.ui.showGameOver();
            }
            if (this.onGameOver) this.onGameOver(data);
        });

        this.socket.on('leaderboard', (data) => {
            if (this.onLeaderboard) this.onLeaderboard(data);
        });

        this.socket.on('gameSpeedChanged', (data) => {
            this.game.gameSpeed = data.speed;
            this.updateSpeedButtons(data.speed);
        });
    }

    updateSpeedButtons(speed) {
        document.querySelectorAll('.speed-btn').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.speed) === speed);
        });
    }

    setGameSpeed(speed) {
        if (this.socket) {
            this.socket.emit('setGameSpeed', { speed });
        }
    }

    createRoom(playerName) {
        if (this.socket) {
            this._playerName = playerName; // Store for reconnection
            this.socket.emit('createRoom', { name: playerName });
        }
    }

    joinRoom(roomCode, playerName) {
        if (this.socket) {
            this._playerName = playerName; // Store for reconnection
            this.socket.emit('joinRoom', { code: roomCode, name: playerName });
        }
    }

    startGame() {
        if (this.socket && this.isHost) {
            this.socket.emit('startGame', { gameMode: 'endless' });
        }
    }

    placeBuilding(gridX, gridY, buildingType) {
        if (this.socket) {
            this.socket.emit('placeBuilding', { gridX, gridY, buildingType });
        }
    }

    sellBuilding(gridX, gridY) {
        if (this.socket) {
            this.socket.emit('sellBuilding', { gridX, gridY });
        }
    }

    upgradeBuilding(gridX, gridY) {
        if (this.socket) {
            this.socket.emit('upgradeBuilding', { gridX, gridY });
        }
    }

    sendChatMessage(message) {
        if (this.socket) {
            this.socket.emit('chatMessage', { message });
        }
    }

    requestLeaderboard(mode) {
        if (this.socket) {
            this.socket.emit('getLeaderboard', { mode });
        }
    }

    handleGameStateUpdate(data) {
        try {
            // Skip if no valid data
            if (!data || !data.state) {
                return;
            }

            const state = data.state;

            // Only update if state has valid data
            if (state.resources) {
                this.game.resources = state.resources;
            }
            if (state.nexusHealth !== undefined && this.game.nexus) {
                this.game.nexus.health = state.nexusHealth;
            }
            if (state.waveNumber !== undefined) {
                this.game.waveNumber = state.waveNumber;
            }
            if (state.totalKills !== undefined) {
                this.game.totalKills = state.totalKills;
            }
            if (state.totalScore !== undefined) {
                this.game.totalScore = state.totalScore;
            }
            // Sync endless difficulty from server
            if (state.endlessDifficulty !== undefined && this.game.waveManager) {
                this.game.waveManager.endlessDifficulty = state.endlessDifficulty;
            }

            // Sync grid if provided
            if (state.grid && this.game.grid) {
                this.game.grid.cells = state.grid;
            }

            // Sync main paths for visualization
            if (state.mainPaths && this.game.grid) {
                this.game.grid.mainPaths = state.mainPaths;
            }

            // Sync enemies only if server provides them
            if (state.enemies) {
                this.syncEnemies(state.enemies);
            }

            // Sync turrets
            if (state.turrets && Array.isArray(state.turrets)) {
                this.syncTurrets(state.turrets);
            }

            // Sync walls
            if (state.walls && Array.isArray(state.walls)) {
                this.syncWalls(state.walls);
            }

            // Sync extractors
            if (state.extractors && Array.isArray(state.extractors)) {
                this.syncExtractors(state.extractors);
            }

            // Sync projectiles
            if (state.projectiles && Array.isArray(state.projectiles)) {
                this.syncProjectiles(state.projectiles);
            }

            // Process effects (explosions, deaths)
            if (state.effects && Array.isArray(state.effects)) {
                this.processEffects(state.effects);
            }
        } catch (error) {
            console.error('Error handling game state update:', error);
        }
    }

    syncProjectiles(serverProjectiles) {
        // Update existing projectiles with interpolation, add new ones
        const serverIds = new Set(serverProjectiles.map(p => p.id));

        // Remove projectiles that no longer exist on server
        this.game.projectiles = this.game.projectiles.filter(p => serverIds.has(p.id));

        for (const sp of serverProjectiles) {
            let localProj = this.game.projectiles.find(p => p.id === sp.id);

            if (!localProj) {
                // New projectile - check if it's a missile type that needs trail
                const isMissileType = sp.type === 'missile' || sp.type === 'rocket' ||
                                      sp.type === 'battery-missile' || sp.type === 'nuclear';

                this.game.projectiles.push({
                    id: sp.id,
                    type: sp.type || 'bullet',
                    x: sp.x,
                    y: sp.y,
                    startX: sp.startX,
                    startY: sp.startY,
                    aoeRadius: sp.aoeRadius || 0,
                    life: sp.life,
                    vx: sp.vx || 0,
                    vy: sp.vy || 0,
                    damage: sp.damage,
                    radius: sp.radius,
                    // Color properties for rendering
                    color: sp.color,
                    trailColor: sp.trailColor,
                    beamWidth: sp.beamWidth,
                    glowColor: sp.glowColor,
                    size: sp.size,
                    startSize: sp.startSize,
                    // Homing properties
                    homingStrength: sp.homingStrength,
                    targetId: sp.targetId,
                    maxSpeed: sp.maxSpeed,
                    targetX: sp.targetX,
                    targetY: sp.targetY,
                    delay: sp.delay,
                    // Trail for missile rendering
                    trail: isMissileType ? [] : undefined,
                    particles: sp.type === 'nuclear' ? [] : undefined
                });
            } else {
                // Update existing - interpolate position for moving projectiles
                if (sp.vx || sp.vy) {
                    // Moving projectile - use velocity for smooth movement
                    localProj.vx = sp.vx || 0;
                    localProj.vy = sp.vy || 0;
                    // Lerp scales with game speed for faster catch-up at high speeds
                    const gameSpeed = this.game.gameSpeed || 1;
                    const lerpFactor = Math.min(0.9, 0.5 * gameSpeed);
                    localProj.x += (sp.x - localProj.x) * lerpFactor;
                    localProj.y += (sp.y - localProj.y) * lerpFactor;
                } else {
                    // Static beam - just update position
                    localProj.x = sp.x;
                    localProj.y = sp.y;
                }
                localProj.startX = sp.startX;
                localProj.startY = sp.startY;
                localProj.life = sp.life;
                localProj.targetX = sp.targetX;
                localProj.targetY = sp.targetY;
                localProj.radius = sp.radius || localProj.radius;
                localProj.size = sp.size || localProj.size;
                localProj.startSize = sp.startSize || localProj.startSize;
                // Sync color properties
                if (sp.color) localProj.color = sp.color;
                if (sp.trailColor) localProj.trailColor = sp.trailColor;
                if (sp.beamWidth) localProj.beamWidth = sp.beamWidth;
                if (sp.glowColor) localProj.glowColor = sp.glowColor;

                // Add trail particles for rendering (client-side only)
                if (localProj.trail && (localProj.vx || localProj.vy)) {
                    localProj.trail.push({
                        x: localProj.x + (Math.random() - 0.5) * 6,
                        y: localProj.y + (Math.random() - 0.5) * 6,
                        life: 1,
                        size: 4 + Math.random() * 4
                    });
                    if (localProj.trail.length > 15) localProj.trail.shift();
                }
            }
        }
    }

    processEffects(effects) {
        if (!effects || !Array.isArray(effects)) return;

        for (const effect of effects) {
            if (effect.type === 'explosion') {
                this.game.renderer.addExplosion(effect.x, effect.y, effect.radius, effect.color);
            } else if (effect.type === 'death') {
                this.game.renderer.addDeathEffect(effect.x, effect.y, effect.color);
            } else if (effect.type === 'shockwave') {
                this.game.renderer.addShockwave(effect.x, effect.y, effect.radius, effect.color);
            } else if (effect.type === 'nuclear-explosion') {
                this.game.renderer.addNuclearExplosion(effect.x, effect.y, effect.radius);
            } else if (effect.type === 'missile-explosion') {
                this.game.renderer.addMissileExplosion(effect.x, effect.y, effect.radius, effect.color);
            } else if (effect.type === 'flak-explosion') {
                this.game.renderer.addFlakExplosion(effect.x, effect.y, effect.radius);
            } else if (effect.type === 'boss-death') {
                this.game.renderer.addBossDeathEffect(effect.x, effect.y, effect.size, effect.color);
            } else if (effect.type === 'orbital-beam') {
                this.game.renderer.addOrbitalBeam(effect.x, effect.y, effect.radius);
            } else if (effect.type === 'muzzle-flash') {
                this.game.renderer.addMuzzleFlash(effect.x, effect.y, effect.angle, effect.color, effect.size);
            } else if (effect.type === 'shotgun-blast') {
                this.game.renderer.addShotgunBlast(effect.x, effect.y, effect.angle, effect.spread, effect.color);
            } else if (effect.type === 'cannon-fire') {
                this.game.renderer.addCannonFire(effect.x, effect.y, effect.angle, effect.color);
            } else if (effect.type === 'laser-pulse') {
                this.game.renderer.addLaserPulse(effect.x, effect.y, effect.color);
            } else if (effect.type === 'electric-spark') {
                this.game.renderer.addElectricSpark(effect.x, effect.y, effect.color);
            }
        }
    }

    syncTurrets(serverTurrets) {
        // Update existing turrets and add new ones
        for (const serverTurret of serverTurrets) {
            let localTurret = this.game.turrets.find(t => t.id === serverTurret.id);

            if (!localTurret) {
                // Turret doesn't exist locally, create it
                const { Turret } = window.TurretModule || {};
                if (Turret) {
                    localTurret = new Turret(serverTurret.gridX, serverTurret.gridY, serverTurret.type, this.game.grid);
                    localTurret.id = serverTurret.id;
                    localTurret.level = serverTurret.level || 1;
                    localTurret.maxLevel = serverTurret.maxLevel || 100;
                    localTurret.health = serverTurret.health;
                    localTurret.maxHealth = serverTurret.maxHealth || 100;
                    this.game.turrets.push(localTurret);
                }
            } else {
                // Update existing turret
                localTurret.angle = serverTurret.angle;
                localTurret.level = serverTurret.level || localTurret.level;
                localTurret.maxLevel = serverTurret.maxLevel || localTurret.maxLevel || 100;
                localTurret.health = serverTurret.health;
                localTurret.maxHealth = serverTurret.maxHealth || localTurret.maxHealth;
            }

            // Sync upgraded stats if turret exists and has config
            if (localTurret && localTurret.config) {
                if (serverTurret.damage !== undefined) localTurret.config.damage = serverTurret.damage;
                if (serverTurret.range !== undefined) localTurret.config.range = serverTurret.range;
                if (serverTurret.fireRate !== undefined) localTurret.config.fireRate = serverTurret.fireRate;
                if (serverTurret.aoeRange !== undefined) localTurret.config.aoeRange = serverTurret.aoeRange;
            }

            // Sync drone position and boost states
            if (localTurret) {
                localTurret.x = serverTurret.x;
                localTurret.y = serverTurret.y;
                if (serverTurret.homeX !== undefined) {
                    localTurret.homeX = serverTurret.homeX;
                    localTurret.homeY = serverTurret.homeY;
                }
                // Sync boost states (flags for visual display)
                localTurret.speedBoosted = serverTurret.speedBoosted || false;
                localTurret.damageBoosted = serverTurret.damageBoosted || false;
                localTurret.rangeBoosted = serverTurret.rangeBoosted || false;
                // Sync boost amounts (for stats calculation)
                localTurret.speedBoostAmount = serverTurret.speedBoostAmount || 0;
                localTurret.damageBoostAmount = serverTurret.damageBoostAmount || 0;
                localTurret.rangeBoostAmount = serverTurret.rangeBoostAmount || 0;
            }
        }

        // Remove turrets that no longer exist on server
        const serverIds = new Set(serverTurrets.map(t => t.id));
        const removedTurrets = this.game.turrets.filter(t => !serverIds.has(t.id));

        // Free grid cells for removed turrets
        for (const turret of removedTurrets) {
            if (this.game.grid && turret.gridX !== undefined && turret.gridY !== undefined) {
                this.game.grid.removeBuilding(turret.gridX, turret.gridY);
            }
        }

        this.game.turrets = this.game.turrets.filter(t => serverIds.has(t.id));

        // Ensure grid cells are marked for all server turrets
        for (const serverTurret of serverTurrets) {
            if (this.game.grid && this.game.grid.cells) {
                const y = serverTurret.gridY;
                const x = serverTurret.gridX;
                if (y >= 0 && y < this.game.grid.rows && x >= 0 && x < this.game.grid.cols) {
                    this.game.grid.cells[y][x] = 1; // Mark as occupied
                }
            }
        }
    }

    syncWalls(serverWalls) {
        // Update existing walls and add new ones
        for (const serverWall of serverWalls) {
            let localWall = this.game.walls.find(w => w.id === serverWall.id);

            if (!localWall) {
                // Wall doesn't exist locally, create it
                const { Wall } = window.WallModule || {};
                if (Wall) {
                    const wallType = serverWall.type || 'wall';
                    localWall = new Wall(serverWall.gridX, serverWall.gridY, wallType, this.game.grid);
                    localWall.id = serverWall.id;
                    localWall.health = serverWall.health;
                    localWall.maxHealth = serverWall.maxHealth || serverWall.health;
                    localWall.level = serverWall.level || 0;
                    this.game.walls.push(localWall);
                }
            } else {
                // Update existing wall properties
                localWall.health = serverWall.health;
                localWall.maxHealth = serverWall.maxHealth || localWall.maxHealth;
                localWall.level = serverWall.level || 0;
            }
        }

        // Remove walls that no longer exist on server
        const serverIds = new Set(serverWalls.map(w => w.id));
        const removedWalls = this.game.walls.filter(w => !serverIds.has(w.id));

        // Free grid cells for removed walls
        for (const wall of removedWalls) {
            if (this.game.grid && wall.gridX !== undefined && wall.gridY !== undefined) {
                this.game.grid.removeBuilding(wall.gridX, wall.gridY);
            }
        }

        this.game.walls = this.game.walls.filter(w => serverIds.has(w.id));

        // Ensure grid cells are marked for all server walls
        for (const serverWall of serverWalls) {
            if (this.game.grid && this.game.grid.cells) {
                const y = serverWall.gridY;
                const x = serverWall.gridX;
                if (y >= 0 && y < this.game.grid.rows && x >= 0 && x < this.game.grid.cols) {
                    this.game.grid.cells[y][x] = 1;
                }
            }
        }
    }

    syncExtractors(serverExtractors) {
        // Update existing extractors and add new ones
        for (const serverExtractor of serverExtractors) {
            let localExtractor = this.game.extractors.find(e => e.id === serverExtractor.id);

            if (!localExtractor) {
                // Extractor doesn't exist locally, create it
                const { Extractor } = window.ExtractorModule || {};
                if (Extractor) {
                    localExtractor = new Extractor(serverExtractor.gridX, serverExtractor.gridY, serverExtractor.resourceType, this.game.grid);
                    localExtractor.id = serverExtractor.id;
                    localExtractor.level = serverExtractor.level || 1;
                    localExtractor.extractionRate = serverExtractor.extractionRate || 1;
                    this.game.extractors.push(localExtractor);
                }
            } else {
                // Update existing extractor
                localExtractor.level = serverExtractor.level || 1;
                localExtractor.extractionRate = serverExtractor.extractionRate || 1;
            }
        }

        // Remove extractors that no longer exist on server
        const serverIds = new Set(serverExtractors.map(e => e.id));
        const removedExtractors = this.game.extractors.filter(e => !serverIds.has(e.id));

        // Free grid cells for removed extractors
        for (const extractor of removedExtractors) {
            if (this.game.grid && extractor.gridX !== undefined && extractor.gridY !== undefined) {
                this.game.grid.removeBuilding(extractor.gridX, extractor.gridY);
            }
        }

        this.game.extractors = this.game.extractors.filter(e => serverIds.has(e.id));

        // Ensure grid cells are marked for all server extractors
        for (const serverExtractor of serverExtractors) {
            if (this.game.grid && this.game.grid.cells) {
                const y = serverExtractor.gridY;
                const x = serverExtractor.gridX;
                if (y >= 0 && y < this.game.grid.rows && x >= 0 && x < this.game.grid.cols) {
                    this.game.grid.cells[y][x] = 1;
                }
            }
        }
    }

    syncEnemies(serverEnemies) {
        try {
            // Skip sync if server data is invalid - let local game handle enemies
            if (!serverEnemies || !Array.isArray(serverEnemies)) {
                return;
            }

            // Only sync if server is actually managing enemies (has sent some)
            // Otherwise, let local game handle everything
            if (serverEnemies.length === 0 && this.game.enemies.length > 0) {
                // Server has no enemies but we have local ones - don't delete them
                return;
            }

            // Update existing enemies
            for (const serverEnemy of serverEnemies) {
                let localEnemy = this.game.enemies.find(e => e.id === serverEnemy.id);

                if (!localEnemy) {
                    // Enemy doesn't exist locally, create it
                    const config = this.game.getEnemyConfig(serverEnemy.type);
                    if (!config) {
                        console.warn(`Unknown enemy type: ${serverEnemy.type}`);
                        continue;
                    }
                    localEnemy = {
                        id: serverEnemy.id,
                        type: serverEnemy.type,
                        x: serverEnemy.x,
                        y: serverEnemy.y,
                        health: serverEnemy.health,
                        maxHealth: serverEnemy.maxHealth,
                        config: config,
                        angle: serverEnemy.angle || 0,
                        burning: serverEnemy.burning,
                        ignoreWalls: serverEnemy.ignoreWalls || false,
                        dead: false,
                        age: 1 // Mark as not new to prevent instant removal
                    };
                    this.game.enemies.push(localEnemy);
                } else {
                    // Interpolate position - adjust lerp based on game speed and distance
                    const gameSpeed = this.game.gameSpeed || 1;
                    const dx = serverEnemy.x - localEnemy.x;
                    const dy = serverEnemy.y - localEnemy.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    // Base lerp factor scales with game speed
                    // At higher speeds, snap more aggressively to prevent lag
                    let lerpFactor = Math.min(0.8, 0.3 * gameSpeed);

                    // If too far behind, snap directly to server position
                    const snapThreshold = 50 * gameSpeed; // Snap if > 50 pixels behind (scaled by speed)
                    if (distance > snapThreshold) {
                        // Snap directly to prevent rubberbanding
                        localEnemy.x = serverEnemy.x;
                        localEnemy.y = serverEnemy.y;
                    } else {
                        localEnemy.x += dx * lerpFactor;
                        localEnemy.y += dy * lerpFactor;
                    }

                    localEnemy.health = serverEnemy.health;
                    localEnemy.angle = serverEnemy.angle || localEnemy.angle;
                    localEnemy.burning = serverEnemy.burning;
                    localEnemy.frosted = serverEnemy.frosted;
                    localEnemy.slowMultiplier = serverEnemy.slowMultiplier || 1;
                    localEnemy.isAttackingTurret = serverEnemy.isAttackingTurret;
                    localEnemy.isAttackingWall = serverEnemy.isAttackingWall || false;
                    localEnemy.ignoreWalls = serverEnemy.ignoreWalls || false;
                }
            }

            // Only remove enemies if server is actively managing them
            if (serverEnemies.length > 0) {
                const serverIds = new Set(serverEnemies.map(e => e.id));
                this.game.enemies = this.game.enemies.filter(e => serverIds.has(e.id) || !e.id);
            }
        } catch (error) {
            console.error('Error syncing enemies:', error);
        }
    }

    isMultiplayer() {
        return this.connected && this.roomCode !== null;
    }
}
