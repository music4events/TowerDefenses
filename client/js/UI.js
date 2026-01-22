import { TURRET_TYPES } from './data/turrets.js';
import { BUILDING_TYPES } from './data/buildings.js';

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
        this.populateBuildStats();
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

    populateBuildStats() {
        document.querySelectorAll('.build-btn').forEach(btn => {
            const buildingType = btn.dataset.building;
            let config = null;

            if (buildingType.startsWith('turret-')) {
                config = TURRET_TYPES[buildingType];
            } else if (buildingType === 'extractor') {
                config = BUILDING_TYPES[buildingType];
            } else if (buildingType === 'wall') {
                config = BUILDING_TYPES[buildingType];
            }

            if (!config) return;

            // Create stats element
            const statsEl = document.createElement('span');
            statsEl.className = 'btn-stats';

            if (buildingType.startsWith('turret-')) {
                // Turret stats
                const damage = config.damage || 0;
                const range = config.range || 0;
                const fireRate = config.fireRate ? (1 / config.fireRate).toFixed(1) : 0;

                // Special turret indicators
                let special = '';
                if (config.isHealer) special = 'Heal';
                else if (config.isSlowdown) special = 'Slow';
                else if (config.isSpeedBooster) special = 'Spd+';
                else if (config.isDamageBooster) special = 'Dmg+';
                else if (config.isRangeBooster) special = 'Rng+';
                else if (config.chainTargets) special = `x${config.chainTargets}`;
                else if (config.laserCount) special = `x${config.laserCount}`;
                else if (config.pelletCount) special = `x${config.pelletCount}`;
                else if (config.missileCount) special = `x${config.missileCount}`;
                else if (config.rocketCount) special = `x${config.rocketCount}`;
                else if (config.flakCount) special = `x${config.flakCount}`;
                else if (config.aoeRadius) special = `AoE`;

                if (damage > 0) {
                    statsEl.innerHTML = `<span class="stat-dmg">${damage}</span><span class="stat-rng">${range}</span><span class="stat-rate">${fireRate}/s</span>${special ? `<span class="stat-special">${special}</span>` : ''}`;
                } else if (special) {
                    statsEl.innerHTML = `<span class="stat-rng">${range}</span><span class="stat-special">${special}</span>`;
                }
            } else if (buildingType === 'extractor') {
                statsEl.innerHTML = `<span class="stat-special">1/s</span>`;
            } else if (buildingType === 'wall') {
                statsEl.innerHTML = `<span class="stat-hp">${config.health || 200} HP</span>`;
            }

            // Insert stats after cost
            const costEl = btn.querySelector('.btn-cost');
            if (costEl && statsEl.innerHTML) {
                costEl.after(statsEl);
            }
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

        // Update wave info (endless mode)
        if (this.waveNumber) {
            this.waveNumber.textContent = `Difficulte ${this.game.waveNumber || 1}`;
        }

        // Update kill counter and score
        if (this.killCounter) {
            const kills = this.game.totalKills || 0;
            const score = this.game.totalScore || 0;
            this.killCounter.textContent = `Kills: ${kills.toLocaleString()} | Score: ${score.toLocaleString()}`;
        }

        // Endless mode - show enemy count and difficulty
        if (this.waveTimer) {
            const difficulty = this.game.endlessDifficulty || 1;
            this.waveTimer.textContent = `Ennemis: ${this.game.enemies.length} | x${difficulty.toFixed(1)}`;

            // Hide skip button in endless mode
            if (this.skipWaveBtn) {
                this.skipWaveBtn.classList.add('hidden');
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
        const extractor = this.game.selectedExtractor || this.game.getHoveredExtractor();
        const isNexus = this.game.selectedNexus || this.game.isHoveringNexus();

        // Show nexus info if selected/hovered
        if (isNexus && this.game.nexus && this.selectionInfo) {
            this.selectionInfo.classList.remove('hidden');
            this.showNexusInfo(this.game.nexus);
            return;
        }

        // Show extractor info if selected/hovered
        if (extractor && this.selectionInfo) {
            this.selectionInfo.classList.remove('hidden');
            this.showExtractorInfo(extractor);
            return;
        }

        // Show turret info if selected/hovered
        if (!turret || !this.selectionInfo) {
            if (this.selectionInfo) {
                this.selectionInfo.classList.add('hidden');
            }
            return;
        }

        this.selectionInfo.classList.remove('hidden');
        this.showTurretInfo(turret);
    }

    showExtractorInfo(extractor) {
        const stats = extractor.getStats();
        const sellValue = extractor.getSellValue();
        const upgradeCost = extractor.getUpgradeCost();

        // Build sell value HTML
        let sellHtml = '';
        for (const [resource, amount] of Object.entries(sellValue)) {
            sellHtml += `<span class="cost-${resource}">${amount}</span> `;
        }

        // Build upgrade cost HTML
        let upgradeHtml = '';
        if (upgradeCost) {
            for (const [resource, amount] of Object.entries(upgradeCost)) {
                upgradeHtml += `<span class="cost-${resource}">${amount}</span> `;
            }
        }

        // Resource type color
        const resourceColors = {
            iron: '#a0a0a0',
            copper: '#cd7f32',
            coal: '#333333',
            gold: '#ffd700'
        };
        const resColor = resourceColors[stats.resourceType] || '#ffffff';

        this.selectionDetails.innerHTML = `
            <div class="stat"><span class="stat-label">Nom</span><span style="color:${resColor}">${stats.name}</span></div>
            <div class="stat"><span class="stat-label">Niveau</span><span>${stats.level}/${stats.maxLevel}</span></div>
            <div class="stat"><span class="stat-label">Vie</span><span>${Math.ceil(stats.health)}/${stats.maxHealth}</span></div>
            <div class="stat"><span class="stat-label">Production</span><span>${stats.extractionRate}/s</span></div>
            <div class="stat"><span class="stat-label">Stock</span><span>${stats.stored}/${stats.maxStorage}</span></div>
            <div class="upgrade-cost">
                <div class="stat"><span class="stat-label">Vente</span><span>${sellHtml}</span></div>
                ${upgradeCost ? `<div class="stat"><span class="stat-label">Upgrade</span><span>${upgradeHtml}</span></div>` : '<div class="stat max-level"><span class="stat-label">MAX LEVEL</span></div>'}
            </div>
        `;
    }

    showNexusInfo(nexus) {
        const stats = nexus.getStats();
        const upgradeCost = nexus.getUpgradeCost();

        // Build upgrade cost HTML
        let upgradeHtml = '';
        if (upgradeCost) {
            for (const [resource, amount] of Object.entries(upgradeCost)) {
                upgradeHtml += `<span class="cost-${resource}">${amount}</span> `;
            }
        }

        this.selectionDetails.innerHTML = `
            <div class="stat"><span class="stat-label">Nom</span><span style="color:#e94560">${stats.name}</span></div>
            <div class="stat"><span class="stat-label">Niveau</span><span>${stats.level}/${stats.maxLevel}</span></div>
            <div class="stat"><span class="stat-label">Vie</span><span>${Math.ceil(stats.health)}/${stats.maxHealth}</span></div>
            <div class="stat nexus-bonus"><span class="stat-label">Bonus Degats</span><span class="boosted">+${stats.damageBonus}%</span></div>
            <div class="stat nexus-bonus"><span class="stat-label">Bonus Portee</span><span class="boosted">+${stats.rangeBonus}%</span></div>
            <div class="stat nexus-bonus"><span class="stat-label">Bonus Cadence</span><span class="boosted">+${stats.fireRateBonus}%</span></div>
            <div class="stat nexus-bonus"><span class="stat-label">Bonus Mines</span><span class="boosted">+${stats.mineBonus}%</span></div>
            <div class="upgrade-cost">
                ${upgradeCost ? `<div class="stat"><span class="stat-label">Upgrade</span><span>${upgradeHtml}</span></div>` : '<div class="stat max-level"><span class="stat-label">MAX LEVEL</span></div>'}
            </div>
        `;
    }

    showTurretInfo(turret) {
        const stats = turret.getStats();
        const sellValue = turret.getSellValue();
        const upgradeCost = turret.getUpgradeCost();

        // Build sell value HTML
        let sellHtml = '';
        for (const [resource, amount] of Object.entries(sellValue)) {
            sellHtml += `<span class="cost-${resource}">${amount}</span> `;
        }

        // Build upgrade cost HTML
        let upgradeHtml = '';
        if (upgradeCost) {
            for (const [resource, amount] of Object.entries(upgradeCost)) {
                upgradeHtml += `<span class="cost-${resource}">${amount}</span> `;
            }
        }

        // Build boost indicators
        let boostHtml = '';
        if (stats.speedBoosted || stats.damageBoosted || stats.rangeBoosted) {
            boostHtml = '<div class="stat boosts">';
            if (stats.speedBoosted) boostHtml += '<span class="boost-speed">SPD</span>';
            if (stats.damageBoosted) boostHtml += '<span class="boost-damage">DMG</span>';
            if (stats.rangeBoosted) boostHtml += '<span class="boost-range">RNG</span>';
            boostHtml += '</div>';
        }

        // Damage display with boost
        const damageDisplay = stats.damageBoosted
            ? `${stats.damage} <span class="boosted">(${stats.boostedDamage})</span>`
            : `${stats.damage}`;

        // Range display with boost
        const rangeDisplay = stats.rangeBoosted
            ? `${stats.range} <span class="boosted">(${stats.boostedRange})</span>`
            : `${stats.range}`;

        // Fire rate display with boost
        const fireRateDisplay = stats.speedBoosted
            ? `${stats.fireRate} <span class="boosted">(${stats.boostedFireRate})</span>`
            : `${stats.fireRate}`;

        this.selectionDetails.innerHTML = `
            <div class="stat"><span class="stat-label">Nom</span><span>${stats.name}</span></div>
            <div class="stat"><span class="stat-label">Niveau</span><span>${stats.level}/${stats.maxLevel}</span></div>
            <div class="stat"><span class="stat-label">Vie</span><span>${Math.ceil(stats.health)}/${stats.maxHealth}</span></div>
            <div class="stat"><span class="stat-label">Degats</span><span>${damageDisplay}</span></div>
            <div class="stat"><span class="stat-label">Portee</span><span>${rangeDisplay}</span></div>
            <div class="stat"><span class="stat-label">Cadence</span><span>${fireRateDisplay}</span></div>
            ${boostHtml}
            <div class="upgrade-cost">
                <div class="stat"><span class="stat-label">Vente</span><span>${sellHtml}</span></div>
                ${upgradeCost ? `<div class="stat"><span class="stat-label">Upgrade</span><span>${upgradeHtml}</span></div>` : '<div class="stat max-level"><span class="stat-label">MAX LEVEL</span></div>'}
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
