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
        this.isMultiplayer = true; // Always multiplayer now
        this.selectedGameMode = 'endless'; // Only endless mode
        this.currentLeaderboardMode = 'endless';

        this.setupLobby();
    }

    setupLobby() {
        // Play button - show multiplayer panel
        document.getElementById('btn-play').addEventListener('click', () => {
            document.getElementById('multiplayer-panel').classList.remove('hidden');
            document.getElementById('leaderboard-panel').classList.add('hidden');
        });

        // Leaderboard button
        document.getElementById('btn-leaderboard').addEventListener('click', () => {
            document.getElementById('leaderboard-panel').classList.remove('hidden');
            document.getElementById('multiplayer-panel').classList.add('hidden');
            document.getElementById('room-panel').classList.add('hidden');
            this.loadLeaderboard('endless');
        });

        // Back from leaderboard
        document.getElementById('btn-back-lobby').addEventListener('click', () => {
            document.getElementById('leaderboard-panel').classList.add('hidden');
        });

        // Leaderboard tabs
        document.querySelectorAll('.lb-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.lb-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.loadLeaderboard(tab.dataset.mode);
            });
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

        // Start game (host only) - endless mode only
        document.getElementById('btn-start-game').addEventListener('click', () => {
            if (this.network && this.network.isHost) {
                this.network.startGame('endless');
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

        this.network.onLeaderboard = (data) => {
            this.displayLeaderboard(data);
        };

        this.network.onGameOver = (data) => {
            this.handleGameOver(data);
        };

        await this.network.connect();
    }

    async loadLeaderboard(mode) {
        this.currentLeaderboardMode = mode;
        const listEl = document.getElementById('leaderboard-list');
        listEl.innerHTML = '<div class="lb-loading">Chargement...</div>';

        // Make sure network is initialized
        await this.initNetwork();
        this.network.requestLeaderboard(mode);
    }

    displayLeaderboard(data) {
        const listEl = document.getElementById('leaderboard-list');
        const entries = data.entries || [];

        if (entries.length === 0) {
            listEl.innerHTML = '<div class="lb-empty">Aucun score pour le moment</div>';
            return;
        }

        listEl.innerHTML = entries.map((entry, index) => `
            <div class="lb-entry ${index < 3 ? 'lb-top-' + (index + 1) : ''}">
                <span class="lb-rank">${index + 1}</span>
                <span class="lb-name">${this.escapeHtml(entry.name)}</span>
                <span class="lb-wave">${entry.wave}</span>
                <span class="lb-kills">${entry.kills.toLocaleString()}</span>
                <span class="lb-score">${entry.score.toLocaleString()}</span>
            </div>
        `).join('');
    }

    handleGameOver(data) {
        // Show game over screen with score
        const playerName = document.getElementById('player-name').value.trim() || 'Player';
        console.log(`Game Over! Wave: ${data.wave}, Kills: ${data.kills}, Score: ${data.score}`);

        // The score is automatically submitted by the server
        // Show a notification or game over screen here if desired
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

    startMultiplayerGame(initialState) {
        this.isMultiplayer = true;
        document.getElementById('lobby-screen').classList.add('hidden');
        document.getElementById('game-container').classList.remove('hidden');
        document.getElementById('chat-container').classList.remove('hidden');

        const canvas = document.getElementById('gameCanvas');
        this.game = new Game(canvas, this.network, initialState);
        this.network.game = this.game;

        // Setup chat and speed buttons
        this.setupChat();
        this.setupSpeedButtons();

        console.log('Tower Defense - Mode Multijoueur');
        console.log('Code de la partie:', this.network.roomCode);
    }

    setupSpeedButtons() {
        document.querySelectorAll('.speed-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const speed = parseInt(btn.dataset.speed);
                if (this.game) {
                    this.game.setGameSpeed(speed);
                }
            });
        });

        // Path visualization toggle button
        const pathBtn = document.getElementById('btn-show-paths');
        if (pathBtn) {
            pathBtn.addEventListener('click', () => {
                if (this.game) {
                    const isShowing = this.game.togglePathVisualization();
                    pathBtn.classList.toggle('active', isShowing);
                }
            });
        }

        // Effects toggle button
        const effectsBtn = document.getElementById('btn-toggle-effects');
        if (effectsBtn) {
            effectsBtn.addEventListener('click', () => {
                const isActive = effectsBtn.classList.toggle('active');
                effectsBtn.textContent = isActive ? '✨ Effets ON' : '❌ Effets OFF';
                if (this.game && this.game.renderer) {
                    this.game.renderer.setEffectsEnabled(isActive);
                }
            });
        }
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
