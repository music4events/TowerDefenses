export class UI {
    constructor(game) {
        this.game = game;

        this.resourceElements = {
            iron: document.querySelector('#res-iron .res-value'),
            copper: document.querySelector('#res-copper .res-value'),
            coal: document.querySelector('#res-coal .res-value'),
            gold: document.querySelector('#res-gold .res-value')
        };

        this.waveNumber = document.getElementById('wave-number');
        this.killCounter = document.getElementById('kill-counter');
        this.waveTimer = document.getElementById('wave-timer');
        this.skipWaveBtn = document.getElementById('btn-skip-wave');
        this.nexusHealthFill = document.getElementById('nexus-health-fill');
        this.nexusHealthText = document.getElementById('nexus-health-text');

        this.sellModeBtn = document.getElementById('btn-sell-mode');
        this.upgradeModeBtn = document.getElementById('btn-upgrade-mode');
        this.selectionInfo = document.getElementById('selection-info');
        this.selectionDetails = document.getElementById('selection-details');

        this.setupBuildButtons();
        this.setupSkipButton();
        this.setupActionModes();
    }

    setupSkipButton() {
        if (this.skipWaveBtn) {
            this.skipWaveBtn.addEventListener('click', () => {
                if (this.game.waveManager && !this.game.waveManager.isActive()) {
                    this.game.waveManager.skipWait();
                }
            });
        }
    }

    setupBuildButtons() {
        document.querySelectorAll('.build-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const building = btn.dataset.building;
                this.game.setActionMode(null); // Clear action mode
                this.game.inputHandler.setSelectedBuilding(building);
                this.updateActionModeButtons();
            });
        });
    }

    setupActionModes() {
        if (this.sellModeBtn) {
            this.sellModeBtn.addEventListener('click', () => {
                this.game.setActionMode('sell');
                this.game.inputHandler.setSelectedBuilding(null);
                this.updateActionModeButtons();
            });
        }

        if (this.upgradeModeBtn) {
            this.upgradeModeBtn.addEventListener('click', () => {
                this.game.setActionMode('upgrade');
                this.game.inputHandler.setSelectedBuilding(null);
                this.updateActionModeButtons();
            });
        }
    }

    updateActionModeButtons() {
        if (this.sellModeBtn) {
            this.sellModeBtn.classList.toggle('active', this.game.actionMode === 'sell');
        }
        if (this.upgradeModeBtn) {
            this.upgradeModeBtn.classList.toggle('active', this.game.actionMode === 'upgrade');
        }
    }

    update() {
        // Update resources
        const resources = this.game.resources;
        for (const [type, element] of Object.entries(this.resourceElements)) {
            if (element) {
                element.textContent = Math.floor(resources[type] || 0);
            }
        }

        // Update wave info
        if (this.waveNumber) {
            if (this.game.gameMode === 'endless') {
                this.waveNumber.textContent = `Difficulte ${this.game.waveNumber + 1}`;
            } else {
                this.waveNumber.textContent = `Vague ${this.game.waveNumber}`;
            }
        }

        // Update kill counter and score
        if (this.killCounter) {
            const kills = this.game.totalKills || 0;
            const score = this.game.totalScore || 0;
            this.killCounter.textContent = `Kills: ${kills.toLocaleString()} | Score: ${score.toLocaleString()}`;
        }

        if (this.waveTimer && this.game.waveManager) {
            if (this.game.gameMode === 'endless') {
                // Endless mode - show enemy count and difficulty
                const difficulty = this.game.waveManager.endlessDifficulty;
                this.waveTimer.textContent = `Ennemis: ${this.game.enemies.length} | x${difficulty.toFixed(1)}`;

                // Hide skip button in endless mode
                if (this.skipWaveBtn) {
                    this.skipWaveBtn.classList.add('hidden');
                }
            } else {
                // Wave mode
                const timeLeft = Math.ceil(this.game.waveManager.getTimeToNextWave());
                const isWaiting = timeLeft > 0 && !this.game.waveManager.isActive();

                if (isWaiting) {
                    this.waveTimer.textContent = `Prochaine vague: ${timeLeft}s`;
                } else {
                    this.waveTimer.textContent = `Ennemis restants: ${this.game.enemies.length}`;
                }

                // Show/hide skip button
                if (this.skipWaveBtn) {
                    this.skipWaveBtn.classList.toggle('hidden', !isWaiting);
                }
            }
        }

        // Update Nexus health
        if (this.game.nexus && this.nexusHealthFill) {
            const healthPercent = this.game.nexus.getHealthPercent() * 100;
            this.nexusHealthFill.style.width = `${healthPercent}%`;

            if (this.nexusHealthText) {
                this.nexusHealthText.textContent =
                    `${Math.ceil(this.game.nexus.health)} / ${this.game.nexus.maxHealth}`;
            }
        }

        // Update build button availability
        this.updateBuildButtonStates();

        // Update selection info
        this.updateSelectionInfo();
    }

    updateBuildButtonStates() {
        const resources = this.game.resources;

        document.querySelectorAll('.build-btn').forEach(btn => {
            const building = btn.dataset.building;
            const cost = this.game.getBuildingCost(building);

            let canAfford = true;
            for (const [resource, amount] of Object.entries(cost)) {
                if ((resources[resource] || 0) < amount) {
                    canAfford = false;
                    break;
                }
            }

            btn.classList.toggle('disabled', !canAfford);
        });
    }

    updateSelectionInfo() {
        const turret = this.game.selectedTurret || this.game.getHoveredTurret();

        if (!turret || !this.selectionInfo) {
            if (this.selectionInfo) {
                this.selectionInfo.classList.add('hidden');
            }
            return;
        }

        this.selectionInfo.classList.remove('hidden');

        const stats = turret.getStats();
        const sellValue = turret.getSellValue();
        const upgradeCost = turret.getUpgradeCost();

        let starsHtml = '';
        for (let i = 0; i < turret.level - 1; i++) {
            starsHtml += '★';
        }
        for (let i = turret.level - 1; i < turret.maxLevel - 1; i++) {
            starsHtml += '☆';
        }

        let sellHtml = '';
        for (const [resource, amount] of Object.entries(sellValue)) {
            sellHtml += `<span class="cost-${resource}">${amount}</span> `;
        }

        let upgradeHtml = '';
        if (upgradeCost) {
            for (const [resource, amount] of Object.entries(upgradeCost)) {
                upgradeHtml += `<span class="cost-${resource}">${amount}</span> `;
            }
        }

        this.selectionDetails.innerHTML = `
            <div class="stat"><span class="stat-label">Nom</span><span>${stats.name}</span></div>
            <div class="stat"><span class="stat-label">Niveau</span><span>${stats.level}/${turret.maxLevel}</span></div>
            <div class="stat"><span class="stat-label">Degats</span><span>${stats.damage}</span></div>
            <div class="stat"><span class="stat-label">Portee</span><span>${stats.range}</span></div>
            <div class="stat"><span class="stat-label">Cadence</span><span>${stats.fireRate}</span></div>
            <div class="stars">${starsHtml}</div>
            <div class="upgrade-cost">
                <div class="stat"><span class="stat-label">Vente</span><span>${sellHtml}</span></div>
                ${upgradeCost ? `<div class="stat"><span class="stat-label">Upgrade</span><span>${upgradeHtml}</span></div>` : '<div class="stat"><span class="stat-label">MAX</span></div>'}
            </div>
        `;
    }

    showGameOver() {
        const overlay = document.createElement('div');
        overlay.id = 'game-over';
        overlay.innerHTML = `
            <div class="game-over-content">
                <h1>GAME OVER</h1>
                <p>Vague atteinte: ${this.game.waveNumber}</p>
                <button onclick="location.reload()">Rejouer</button>
            </div>
        `;
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;
        overlay.querySelector('.game-over-content').style.cssText = `
            text-align: center;
            color: #e94560;
        `;
        overlay.querySelector('button').style.cssText = `
            margin-top: 20px;
            padding: 10px 30px;
            font-size: 18px;
            background: #e94560;
            color: white;
            border: none;
            cursor: pointer;
            border-radius: 4px;
        `;
        document.body.appendChild(overlay);
    }
}
