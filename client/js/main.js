import { Game } from './Game.js';
import { Network } from './Network.js';
import { Turret } from './entities/Turret.js';
import { Wall } from './entities/Wall.js';
import { Extractor } from './entities/Extractor.js';

// Expose entity classes globally for Network.js sync
window.TurretModule = { Turret };
window.WallModule = { Wall };
window.ExtractorModule = { Extractor };

class App {
    constructor() {
        this.game = null;
        this.network = null;
        this.isMultiplayer = false;
        this.selectedGameMode = 'waves'; // 'waves' or 'endless'

        this.setupLobby();
    }

    setupLobby() {
        // Mode selection
        document.getElementById('btn-solo').addEventListener('click', () => {
            document.getElementById('game-mode-panel').classList.remove('hidden');
            document.getElementById('multiplayer-panel').classList.add('hidden');
        });

        document.getElementById('btn-multiplayer').addEventListener('click', () => {
            document.getElementById('multiplayer-panel').classList.remove('hidden');
            document.getElementById('game-mode-panel').classList.add('hidden');
        });

        // Game mode selection buttons (solo)
        document.querySelectorAll('#game-mode-panel .mode-select-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('#game-mode-panel .mode-select-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.selectedGameMode = btn.dataset.mode;
            });
        });

        // Game mode selection buttons (multiplayer)
        document.querySelectorAll('.mp-mode').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mp-mode').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.selectedGameMode = btn.dataset.mode;
            });
        });

        // Start solo game button
        document.getElementById('btn-start-solo').addEventListener('click', () => {
            this.startSoloGame();
        });

        // Create room
        document.getElementById('btn-create-room').addEventListener('click', async () => {
            const playerName = document.getElementById('player-name').value.trim() || 'Host';
            await this.initNetwork();
            this.network.createRoom(playerName);
        });

        // Join room
        document.getElementById('btn-join-room').addEventListener('click', async () => {
            const playerName = document.getElementById('player-name').value.trim() || 'Player';
            const roomCode = document.getElementById('room-code-input').value.trim().toUpperCase();

            if (roomCode.length !== 6) {
                this.showError('Le code doit faire 6 caracteres');
                return;
            }

            await this.initNetwork();
            this.network.joinRoom(roomCode, playerName);
        });

        // Start game (host only)
        document.getElementById('btn-start-game').addEventListener('click', () => {
            if (this.network && this.network.isHost) {
                this.network.startGame(this.selectedGameMode);
            }
        });
    }

    async initNetwork() {
        if (this.network) return;

        this.network = new Network(null);

        this.network.onRoomCreated = (data) => {
            this.showRoomPanel(data, true);
        };

        this.network.onRoomJoined = (data) => {
            this.showRoomPanel(data, false);
        };

        this.network.onPlayerJoined = (data) => {
            this.updatePlayerList(data.players);
        };

        this.network.onPlayerLeft = (data) => {
            this.updatePlayerList(data.players);
        };

        this.network.onGameStarted = (data) => {
            this.startMultiplayerGame(data.gameState);
        };

        this.network.onChatMessage = (data) => {
            this.addChatMessage(data);
        };

        this.network.onError = (message) => {
            this.showError(message);
        };

        await this.network.connect();
    }

    showRoomPanel(data, isHost) {
        document.getElementById('multiplayer-panel').classList.add('hidden');
        document.getElementById('room-panel').classList.remove('hidden');
        document.getElementById('room-code-display').textContent = data.code;

        this.updatePlayerList(data.players);

        if (isHost) {
            document.getElementById('btn-start-game').classList.remove('hidden');
            document.getElementById('waiting-msg').classList.add('hidden');
            document.getElementById('mp-game-mode').classList.remove('hidden');
        } else {
            document.getElementById('btn-start-game').classList.add('hidden');
            document.getElementById('waiting-msg').classList.remove('hidden');
            document.getElementById('mp-game-mode').classList.add('hidden');
        }
    }

    updatePlayerList(players) {
        const list = document.getElementById('player-list');
        list.innerHTML = '';

        players.forEach((player, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="player-color" style="background: ${player.color}"></span>
                <span>${player.name}</span>
                ${index === 0 ? '<span class="player-host">HOST</span>' : ''}
            `;
            list.appendChild(li);
        });

        // Enable start button only if 1+ players
        const startBtn = document.getElementById('btn-start-game');
        if (this.network && this.network.isHost) {
            startBtn.disabled = players.length < 1;
        }
    }

    showError(message) {
        const errorDiv = document.getElementById('lobby-error');
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');

        setTimeout(() => {
            errorDiv.classList.add('hidden');
        }, 3000);
    }

    startSoloGame() {
        this.isMultiplayer = false;
        document.getElementById('lobby-screen').classList.add('hidden');
        document.getElementById('game-container').classList.remove('hidden');

        const canvas = document.getElementById('gameCanvas');
        this.game = new Game(canvas, false, null, null, this.selectedGameMode);

        console.log(`Tower Defense - Mode Solo (${this.selectedGameMode})`);
        console.log('Raccourcis: 1-8 pour selectionner, clic gauche pour placer, clic droit pour annuler');
    }

    startMultiplayerGame(initialState) {
        this.isMultiplayer = true;
        document.getElementById('lobby-screen').classList.add('hidden');
        document.getElementById('game-container').classList.remove('hidden');
        document.getElementById('chat-container').classList.remove('hidden');

        const canvas = document.getElementById('gameCanvas');
        // Use game mode from initialState if provided, otherwise use selected mode
        const gameMode = initialState?.gameMode || this.selectedGameMode;
        this.game = new Game(canvas, true, this.network, initialState, gameMode);
        this.network.game = this.game;

        // Setup chat
        this.setupChat();

        console.log('Tower Defense - Mode Multijoueur');
        console.log('Code de la partie:', this.network.roomCode);
    }

    setupChat() {
        const input = document.getElementById('chat-input');
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && input.value.trim()) {
                this.network.sendChatMessage(input.value.trim());
                input.value = '';
            }
        });
    }

    addChatMessage(data) {
        const messagesDiv = document.getElementById('chat-messages');
        const msgDiv = document.createElement('div');
        msgDiv.className = 'chat-message';
        msgDiv.innerHTML = `
            <span class="player-name" style="color: ${data.playerColor}">${data.playerName}:</span>
            <span class="message-text">${this.escapeHtml(data.message)}</span>
        `;
        messagesDiv.appendChild(msgDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
