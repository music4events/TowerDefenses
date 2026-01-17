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

        // Boss every 10 waves
        if (this.waveNumber % 10 === 0) {
            this.enemiesToSpawn.push({
                type: 'boss',
                healthMultiplier,
                delay: 10
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
            this.game.waveNumber = 1;
        }

        this.endlessTimer += deltaTime;
        this.difficultyTimer += deltaTime;

        // Increase difficulty every 30 seconds
        if (this.difficultyTimer >= 30) {
            this.difficultyTimer = 0;
            this.endlessDifficulty += 0.1;
            this.endlessSpawnRate = Math.max(0.5, this.endlessSpawnRate - 0.1);
            this.waveNumber++;
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
            console.log('No spawn points, generating...');
            return;
        }

        // Choose enemy type based on difficulty
        const types = ['grunt'];
        if (this.endlessDifficulty >= 1.2) types.push('runner');
        if (this.endlessDifficulty >= 1.5) types.push('tank');
        if (this.endlessDifficulty >= 1.8) types.push('kamikaze');
        if (this.endlessDifficulty >= 2.0) types.push('healer');
        if (this.endlessDifficulty >= 3.0 && Math.random() < 0.05) types.push('boss');

        const type = types[Math.floor(Math.random() * types.length)];
        const spawn = this.spawnPoints[Math.floor(Math.random() * this.spawnPoints.length)];

        console.log(`Spawning ${type} at (${spawn.x}, ${spawn.y})`);

        const enemy = this.game.spawnEnemy(spawn.x, spawn.y, type);
        if (enemy) {
            enemy.maxHealth *= this.endlessDifficulty;
            enemy.health = enemy.maxHealth;
            console.log(`Enemy created, total enemies: ${this.game.enemies.length}`);
        } else {
            console.error('Failed to spawn enemy!');
        }
    }

    spawnEnemy(enemyData) {
        // Pick random spawn point
        const spawn = this.spawnPoints[Math.floor(Math.random() * this.spawnPoints.length)];

        const enemy = this.game.spawnEnemy(spawn.x, spawn.y, enemyData.type);
        if (enemy && enemyData.healthMultiplier) {
            enemy.maxHealth *= enemyData.healthMultiplier;
            enemy.health = enemy.maxHealth;
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
