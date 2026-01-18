import { ENEMY_TYPES } from './data/enemies.js';

export class WaveManager {
    constructor(game, gameMode = 'waves') {
        this.game = game;
        this.gameMode = gameMode; // 'waves' or 'endless'
        this.waveNumber = 0;
        this.waveTimer = 0;
        this.spawnTimer = 0;
        this.enemiesToSpawn = [];
        this.active = false;

        this.timeBetweenWaves = 60; // 60 seconds between waves
        this.pauseTime = 15; // 15 seconds of reduced spawning

        // Endless mode settings
        this.endlessSpawnRate = 2; // Spawn every 2 seconds
        this.endlessDifficulty = 1;
        this.endlessTimer = 0;
        this.difficultyTimer = 0;

        this.spawnPoints = [];
        this.generateSpawnPoints();
    }

    generateSpawnPoints() {
        const grid = this.game.grid;

        // Spawn from edges
        // Top edge
        for (let x = 0; x < grid.cols; x += 5) {
            this.spawnPoints.push({ x, y: 0 });
        }
        // Bottom edge
        for (let x = 0; x < grid.cols; x += 5) {
            this.spawnPoints.push({ x, y: grid.rows - 1 });
        }
        // Left edge
        for (let y = 0; y < grid.rows; y += 5) {
            this.spawnPoints.push({ x: 0, y });
        }
        // Right edge
        for (let y = 0; y < grid.rows; y += 5) {
            this.spawnPoints.push({ x: grid.cols - 1, y });
        }
    }

    startWave() {
        this.waveNumber++;
        this.game.waveNumber = this.waveNumber;
        this.active = true;
        this.spawnTimer = 0; // Reset spawn timer for new wave
        this.waveTimer = this.timeBetweenWaves;

        // Generate enemies for this wave
        this.generateWaveEnemies();
    }

    generateWaveEnemies() {
        this.enemiesToSpawn = [];

        // Base enemy count scales with wave
        const baseCount = 5 + this.waveNumber * 2;
        const healthMultiplier = 1 + (this.waveNumber - 1) * 0.1;

        // Grunt wave composition
        for (let i = 0; i < baseCount; i++) {
            this.enemiesToSpawn.push({
                type: 'grunt',
                healthMultiplier,
                delay: i * 0.5
            });
        }

        // Add runners starting wave 2
        if (this.waveNumber >= 2) {
            const runnerCount = Math.floor(baseCount * 0.3);
            for (let i = 0; i < runnerCount; i++) {
                this.enemiesToSpawn.push({
                    type: 'runner',
                    healthMultiplier,
                    delay: 2 + i * 0.3
                });
            }
        }

        // Add tanks starting wave 3
        if (this.waveNumber >= 3) {
            const tankCount = Math.floor(this.waveNumber / 3);
            for (let i = 0; i < tankCount; i++) {
                this.enemiesToSpawn.push({
                    type: 'tank',
                    healthMultiplier,
                    delay: 5 + i * 2
                });
            }
        }

        // Add kamikazes starting wave 4
        if (this.waveNumber >= 4) {
            const kamikazeCount = Math.floor(this.waveNumber / 2);
            for (let i = 0; i < kamikazeCount; i++) {
                this.enemiesToSpawn.push({
                    type: 'kamikaze',
                    healthMultiplier,
                    delay: 8 + i * 1.5
                });
            }
        }

        // Add healers starting wave 5
        if (this.waveNumber >= 5) {
            const healerCount = Math.floor(this.waveNumber / 5);
            for (let i = 0; i < healerCount; i++) {
                this.enemiesToSpawn.push({
                    type: 'healer',
                    healthMultiplier,
                    delay: 3 + i * 4
                });
            }
        }

        // Add splitters starting wave 6
        if (this.waveNumber >= 6) {
            const splitterCount = Math.floor(this.waveNumber / 4);
            for (let i = 0; i < splitterCount; i++) {
                this.enemiesToSpawn.push({
                    type: 'splitter',
                    healthMultiplier,
                    delay: 4 + i * 3
                });
            }
        }

        // Add flying starting wave 7
        if (this.waveNumber >= 7) {
            const flyingCount = Math.floor(this.waveNumber / 3);
            for (let i = 0; i < flyingCount; i++) {
                this.enemiesToSpawn.push({
                    type: 'flying',
                    healthMultiplier,
                    delay: 6 + i * 2
                });
            }
        }

        // Add armored-front starting wave 8
        if (this.waveNumber >= 8) {
            const armoredCount = Math.floor(this.waveNumber / 5);
            for (let i = 0; i < armoredCount; i++) {
                this.enemiesToSpawn.push({
                    type: 'armored-front',
                    healthMultiplier,
                    delay: 7 + i * 3
                });
            }
        }

        // Add flying-swarm starting wave 9
        if (this.waveNumber >= 9) {
            const swarmCount = Math.floor(this.waveNumber / 2);
            for (let i = 0; i < swarmCount; i++) {
                this.enemiesToSpawn.push({
                    type: 'flying-swarm',
                    healthMultiplier,
                    delay: 5 + i * 1
                });
            }
        }

        // Add kamikaze-spawner starting wave 10
        if (this.waveNumber >= 10) {
            const spawnerCount = Math.floor(this.waveNumber / 6);
            for (let i = 0; i < spawnerCount; i++) {
                this.enemiesToSpawn.push({
                    type: 'kamikaze-spawner',
                    healthMultiplier,
                    delay: 9 + i * 4
                });
            }
        }

        // Add flying-bomber starting wave 12
        if (this.waveNumber >= 12) {
            const bomberCount = Math.floor(this.waveNumber / 5);
            for (let i = 0; i < bomberCount; i++) {
                this.enemiesToSpawn.push({
                    type: 'flying-bomber',
                    healthMultiplier,
                    delay: 8 + i * 3
                });
            }
        }

        // Add transport starting wave 15
        if (this.waveNumber >= 15) {
            const transportCount = Math.floor(this.waveNumber / 8);
            for (let i = 0; i < transportCount; i++) {
                this.enemiesToSpawn.push({
                    type: 'transport',
                    healthMultiplier,
                    delay: 10 + i * 5
                });
            }
        }

        // Add transport-elite starting wave 20
        if (this.waveNumber >= 20) {
            const eliteCount = Math.floor(this.waveNumber / 12);
            for (let i = 0; i < eliteCount; i++) {
                this.enemiesToSpawn.push({
                    type: 'transport-elite',
                    healthMultiplier,
                    delay: 12 + i * 6
                });
            }
        }

        // Boss every 10 waves
        if (this.waveNumber % 10 === 0) {
            this.enemiesToSpawn.push({
                type: 'boss',
                healthMultiplier,
                delay: 10
            });
        }

        // Flying boss every 15 waves (starting wave 15)
        if (this.waveNumber >= 15 && this.waveNumber % 15 === 0) {
            this.enemiesToSpawn.push({
                type: 'flying-boss',
                healthMultiplier,
                delay: 12
            });
        }

        // Carrier boss every 25 waves (starting wave 25)
        if (this.waveNumber >= 25 && this.waveNumber % 25 === 0) {
            this.enemiesToSpawn.push({
                type: 'carrier-boss',
                healthMultiplier,
                delay: 15
            });
        }

        // Mega boss every 50 waves (starting wave 50)
        if (this.waveNumber >= 50 && this.waveNumber % 50 === 0) {
            this.enemiesToSpawn.push({
                type: 'mega-boss',
                healthMultiplier,
                delay: 20
            });
        }

        // Sort by delay
        this.enemiesToSpawn.sort((a, b) => a.delay - b.delay);
    }

    update(deltaTime) {
        if (this.gameMode === 'endless') {
            this.updateEndless(deltaTime);
        } else {
            this.updateWaves(deltaTime);
        }
    }

    updateWaves(deltaTime) {
        if (!this.active && this.waveTimer <= 0) {
            this.startWave();
        }

        if (this.active) {
            this.spawnTimer += deltaTime;

            // Spawn enemies
            while (this.enemiesToSpawn.length > 0 &&
                   this.spawnTimer >= this.enemiesToSpawn[0].delay) {
                const enemyData = this.enemiesToSpawn.shift();
                this.spawnEnemy(enemyData);
            }

            // Wave complete check
            if (this.enemiesToSpawn.length === 0 && this.game.enemies.length === 0) {
                this.active = false;
                this.waveTimer = this.timeBetweenWaves;
                this.spawnTimer = 0;
            }
        } else {
            this.waveTimer -= deltaTime;
        }
    }

    updateEndless(deltaTime) {
        this.active = true; // Always active in endless

        // Initialize wave number on first frame
        if (this.waveNumber === 0) {
            this.waveNumber = 1;
            this.endlessDifficulty = 1;
            this.game.waveNumber = 1;
        }

        this.endlessTimer += deltaTime;
        this.difficultyTimer += deltaTime;

        // Increase wave every 30 seconds, difficulty = wave number
        if (this.difficultyTimer >= 30) {
            this.difficultyTimer = 0;
            this.waveNumber++;
            this.endlessDifficulty = this.waveNumber; // Difficulty matches wave number
            this.endlessSpawnRate = Math.max(0.3, 2 - this.waveNumber * 0.02); // Faster spawn over time
            this.game.waveNumber = this.waveNumber;
        }

        // Spawn enemies continuously
        if (this.endlessTimer >= this.endlessSpawnRate) {
            this.endlessTimer = 0;
            this.spawnEndlessEnemy();
        }
    }

    spawnEndlessEnemy() {
        // Make sure we have spawn points
        if (!this.spawnPoints || this.spawnPoints.length === 0) {
            this.generateSpawnPoints();
            return;
        }

        // Progressive boss spawn rate: +1% every 10 waves
        const bossSpawnBonus = Math.floor(this.waveNumber / 10) * 0.01;
        const wave = this.waveNumber;

        // Choose enemy type based on wave number (difficulty = wave)
        const types = ['grunt'];
        if (wave >= 2) types.push('runner');
        if (wave >= 3) types.push('flying');
        if (wave >= 4) types.push('tank');
        if (wave >= 5) types.push('flying-swarm');
        if (wave >= 6) types.push('kamikaze');
        if (wave >= 7) types.push('healer');
        if (wave >= 7) types.push('splitter');
        if (wave >= 8) types.push('flying-bomber');
        if (wave >= 10) types.push('kamikaze-spawner');
        if (wave >= 10) types.push('armored-front');
        if (wave >= 12) types.push('transport');
        if (wave >= 15 && Math.random() < 0.05 + bossSpawnBonus) types.push('boss');
        if (wave >= 18) types.push('transport-elite');
        if (wave >= 20 && Math.random() < 0.04 + bossSpawnBonus) types.push('flying-boss');
        if (wave >= 25 && Math.random() < 0.03 + bossSpawnBonus) types.push('carrier-boss');
        if (wave >= 30 && Math.random() < 0.02 + bossSpawnBonus) types.push('mega-boss');
        // === MEGA BOSS Tier 2 ===
        if (wave >= 40 && Math.random() < 0.015 + bossSpawnBonus) types.push('titan');
        if (wave >= 45 && Math.random() < 0.015 + bossSpawnBonus) types.push('leviathan');
        if (wave >= 50 && Math.random() < 0.012 + bossSpawnBonus) types.push('swarm-mother');
        if (wave >= 55 && Math.random() < 0.012 + bossSpawnBonus) types.push('devastator');
        // === MEGA BOSS Tier 3 ===
        if (wave >= 70 && Math.random() < 0.01 + bossSpawnBonus) types.push('overlord');
        if (wave >= 80 && Math.random() < 0.008 + bossSpawnBonus) types.push('colossus');
        if (wave >= 90 && Math.random() < 0.008 + bossSpawnBonus) types.push('hive-queen');
        // === MEGA BOSS Tier 4 ===
        if (wave >= 120 && Math.random() < 0.005 + bossSpawnBonus) types.push('juggernaut');
        if (wave >= 150 && Math.random() < 0.004 + bossSpawnBonus) types.push('apocalypse');
        // === MEGA BOSS Tier 5 (Ultimate) ===
        if (wave >= 200 && Math.random() < 0.002 + bossSpawnBonus) types.push('world-ender');

        const type = types[Math.floor(Math.random() * types.length)];
        const spawn = this.spawnPoints[Math.floor(Math.random() * this.spawnPoints.length)];

        const enemy = this.game.spawnEnemy(spawn.x, spawn.y, type);
        if (enemy) {
            // Scale all stats based on difficulty
            // Use logarithmic scaling for speed/damage to prevent extreme values
            const healthMult = this.endlessDifficulty; // HP scales linearly
            const speedMult = Math.min(5, 1 + Math.log10(this.endlessDifficulty) * 1.5); // Max 5x speed
            const damageMult = Math.min(10, 1 + Math.log10(this.endlessDifficulty) * 3); // Max 10x damage

            enemy.maxHealth *= healthMult;
            enemy.health = enemy.maxHealth;
            enemy.speed *= speedMult;
            enemy.damage *= damageMult;
        }
    }

    spawnEnemy(enemyData) {
        // Pick random spawn point
        const spawn = this.spawnPoints[Math.floor(Math.random() * this.spawnPoints.length)];

        const enemy = this.game.spawnEnemy(spawn.x, spawn.y, enemyData.type);
        if (enemy && enemyData.healthMultiplier) {
            // Scale HP +10% per wave, speed +3% per wave, damage +5% per wave
            const healthMult = enemyData.healthMultiplier;
            const speedMult = 1 + (this.waveNumber - 1) * 0.03;
            const damageMult = 1 + (this.waveNumber - 1) * 0.05;

            enemy.maxHealth *= healthMult;
            enemy.health = enemy.maxHealth;
            enemy.speed *= speedMult;
            enemy.damage *= damageMult;
        }
    }

    getTimeToNextWave() {
        return Math.max(0, this.waveTimer);
    }

    isActive() {
        return this.active;
    }

    getCurrentWave() {
        return this.waveNumber;
    }

    skipWait() {
        if (!this.active && this.waveTimer > 0) {
            this.waveTimer = 0;
        }
    }
}
