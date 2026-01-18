const TURRET_TYPES = {
    'turret-mg': {
        name: 'Mitrailleuse',
        damage: 5,
        range: 4,
        fireRate: 0.1,
        cost: { iron: 100 },
        projectileSpeed: 15
    },
    'turret-sniper': {
        name: 'Sniper',
        damage: 50,
        range: 10,
        fireRate: 1.5,
        cost: { iron: 200, copper: 50 },
        projectileSpeed: 30,
        penetration: true
    },
    'turret-artillery': {
        name: 'Artillerie',
        damage: 30,
        range: 8,
        fireRate: 2,
        cost: { iron: 300, copper: 100 },
        projectileSpeed: 8,
        aoeRadius: 2
    },
    'turret-flamethrower': {
        name: 'Lance-flammes',
        damage: 15,
        range: 3,
        fireRate: 0.05,
        cost: { iron: 150, coal: 30 },
        continuous: true,
        dotDamage: 5,
        dotDuration: 2
    },
    'turret-tesla': {
        name: 'Tesla',
        damage: 25,
        range: 5,
        fireRate: 0.8,
        cost: { iron: 400, copper: 150, gold: 50 },
        chainTargets: 3
    },
    'turret-laser': {
        name: 'Laser',
        damage: 40,
        range: 6,
        fireRate: 0.2,
        cost: { iron: 500, copper: 200, gold: 100 },
        instantHit: true
    }
};

const BUILDING_TYPES = {
    'wall': { health: 200, cost: { iron: 20 } },
    'extractor': { health: 100, cost: { iron: 50 } }
};

const ENEMY_TYPES = {
    'grunt': { health: 50, speed: 1, damage: 10, reward: { iron: 5 } },
    'runner': { health: 30, speed: 2, damage: 5, reward: { iron: 3 } },
    'tank': { health: 300, speed: 0.5, damage: 30, armor: 0.5, reward: { iron: 20, copper: 5 } },
    'kamikaze': { health: 20, speed: 2.5, damage: 100, reward: { iron: 8 } },
    'healer': { health: 80, speed: 1, damage: 0, healAmount: 5, reward: { iron: 15, copper: 5 } },
    'boss': { health: 2000, speed: 0.3, damage: 100, reward: { iron: 100, copper: 50, gold: 20 } }
};

class GameState {
    constructor(gameMode = 'waves') {
        this.cellSize = 32;
        this.cols = 40;
        this.rows = 30;
        this.gameMode = gameMode; // 'waves' or 'endless'

        this.resources = { iron: 500, copper: 0, coal: 0, gold: 0 };
        this.nexusHealth = 1000;
        this.nexusMaxHealth = 1000;
        this.waveNumber = 0;

        this.grid = [];
        this.resourceMap = [];
        this.turrets = [];
        this.walls = [];
        this.extractors = [];
        this.enemies = [];
        this.projectiles = [];

        this.waveTimer = 0;
        this.waveActive = false;
        this.enemiesToSpawn = [];
        this.spawnTimer = 0;

        // Endless mode settings
        this.endlessSpawnRate = 2; // Spawn every 2 seconds
        this.endlessDifficulty = 1;
        this.endlessTimer = 0;
        this.difficultyTimer = 0;
    }

    init() {
        // Initialize grid
        for (let y = 0; y < this.rows; y++) {
            this.grid[y] = [];
            this.resourceMap[y] = [];
            for (let x = 0; x < this.cols; x++) {
                this.grid[y][x] = 0;
                this.resourceMap[y][x] = null;
            }
        }

        // Place nexus at center
        const centerX = Math.floor(this.cols / 2);
        const centerY = Math.floor(this.rows / 2);
        this.grid[centerY][centerX] = 3;
        this.nexusX = centerX;
        this.nexusY = centerY;

        // Generate resources
        this.generateResources();

        // Start first wave timer
        this.waveTimer = 30;
    }

    generateResources() {
        const types = ['iron', 'copper', 'coal', 'gold'];
        const counts = { iron: 15, copper: 10, coal: 8, gold: 5 };

        for (const type of types) {
            let placed = 0;
            while (placed < counts[type]) {
                const x = Math.floor(Math.random() * this.cols);
                const y = Math.floor(Math.random() * this.rows);

                const distFromCenter = Math.sqrt(
                    (x - this.cols / 2) ** 2 + (y - this.rows / 2) ** 2
                );

                if (distFromCenter > 5 && x > 2 && x < this.cols - 3 &&
                    y > 2 && y < this.rows - 3 && this.grid[y][x] === 0) {
                    this.grid[y][x] = 2;
                    this.resourceMap[y][x] = type;
                    placed++;
                }
            }
        }
    }

    update(deltaTime) {
        try {
            // Wave/Endless management based on game mode
            if (this.gameMode === 'endless') {
                this.updateEndless(deltaTime);
            } else {
                this.updateWaves(deltaTime);
            }

            // Update extractors
            for (const extractor of this.extractors) {
                if (!extractor) continue;
                extractor.timer = (extractor.timer || 0) + deltaTime;
                const extractionTime = 1 / (extractor.extractionRate || 1);
                if (extractor.timer >= extractionTime) {
                    extractor.timer = 0;
                    if (extractor.resourceType) {
                        this.resources[extractor.resourceType] =
                            (this.resources[extractor.resourceType] || 0) + 1;
                    }
                }
            }

            // Update enemies
            for (const enemy of this.enemies) {
                this.updateEnemy(enemy, deltaTime);
            }

            // Remove dead enemies
            this.enemies = this.enemies.filter(e => {
                if (!e) return false;
                if (e.dead && !e.reachedNexus) {
                    const enemyType = ENEMY_TYPES[e.type];
                    if (enemyType && enemyType.reward) {
                        for (const [res, amt] of Object.entries(enemyType.reward)) {
                            this.resources[res] = (this.resources[res] || 0) + amt;
                        }
                    }
                }
                return !e.dead;
            });

            // Update turrets
            for (const turret of this.turrets) {
                this.updateTurret(turret, deltaTime);
            }

            // Update projectiles
            this.updateProjectiles(deltaTime);
        } catch (error) {
            console.error('Error in GameState.update:', error);
        }
    }

    updateWaves(deltaTime) {
        if (!this.waveActive && this.waveTimer > 0) {
            this.waveTimer -= deltaTime;
            if (this.waveTimer <= 0) {
                this.startWave();
            }
        }

        if (this.waveActive) {
            this.spawnTimer += deltaTime;

            while (this.enemiesToSpawn.length > 0 &&
                   this.spawnTimer >= this.enemiesToSpawn[0].delay) {
                const enemyData = this.enemiesToSpawn.shift();
                this.spawnEnemy(enemyData);
            }

            if (this.enemiesToSpawn.length === 0 && this.enemies.length === 0) {
                this.waveActive = false;
                this.waveTimer = 60;
                this.spawnTimer = 0;
            }
        }
    }

    updateEndless(deltaTime) {
        try {
            this.waveActive = true; // Always active in endless

            // Initialize wave number on first frame
            if (this.waveNumber === 0) {
                this.waveNumber = 1;
                console.log('Endless mode started');
            }

            this.endlessTimer += deltaTime;
            this.difficultyTimer += deltaTime;

            // Increase difficulty every 30 seconds
            if (this.difficultyTimer >= 30) {
                this.difficultyTimer = 0;
                this.endlessDifficulty += 0.1;
                this.endlessSpawnRate = Math.max(0.5, this.endlessSpawnRate - 0.1);
                this.waveNumber++;
                console.log(`Endless difficulty increased to ${this.endlessDifficulty.toFixed(1)}`);
            }

            // Spawn enemies continuously
            if (this.endlessTimer >= this.endlessSpawnRate) {
                this.endlessTimer = 0;
                this.spawnEndlessEnemy();
            }
        } catch (error) {
            console.error('Error in updateEndless:', error);
        }
    }

    spawnEndlessEnemy() {
        try {
            // Choose enemy type based on difficulty
            const types = ['grunt'];
            if (this.endlessDifficulty >= 1.2) types.push('runner');
            if (this.endlessDifficulty >= 1.5) types.push('tank');
            if (this.endlessDifficulty >= 1.8) types.push('kamikaze');
            if (this.endlessDifficulty >= 2.0) types.push('healer');
            if (this.endlessDifficulty >= 3.0 && Math.random() < 0.05) types.push('boss');

            const type = types[Math.floor(Math.random() * types.length)];

            // Pick random edge spawn point
            const edges = ['top', 'bottom', 'left', 'right'];
            const edge = edges[Math.floor(Math.random() * edges.length)];

            let x, y;
            switch (edge) {
                case 'top': x = Math.floor(Math.random() * this.cols); y = 0; break;
                case 'bottom': x = Math.floor(Math.random() * this.cols); y = this.rows - 1; break;
                case 'left': x = 0; y = Math.floor(Math.random() * this.rows); break;
                case 'right': x = this.cols - 1; y = Math.floor(Math.random() * this.rows); break;
            }

            const config = ENEMY_TYPES[type];
            if (!config) {
                console.error(`Unknown enemy type in endless: ${type}`);
                return;
            }

            const enemy = {
                id: Date.now() + Math.random(),
                type: type,
                x: x * this.cellSize + this.cellSize / 2,
                y: y * this.cellSize + this.cellSize / 2,
                gridX: x,
                gridY: y,
                health: config.health * this.endlessDifficulty,
                maxHealth: config.health * this.endlessDifficulty,
                speed: config.speed,
                damage: config.damage,
                path: [],
                pathIndex: 0,
                dead: false,
                reachedNexus: false,
                burning: false,
                burnTime: 0,
                burnDamage: 0
            };

            const path = this.findPath(x, y, this.nexusX, this.nexusY);
            if (path) {
                enemy.path = path;
                this.enemies.push(enemy);
            }
        } catch (error) {
            console.error('Error in spawnEndlessEnemy:', error);
        }
    }

    startWave() {
        this.waveNumber++;
        this.waveActive = true;
        this.generateWaveEnemies();
    }

    generateWaveEnemies() {
        this.enemiesToSpawn = [];
        const baseCount = 5 + this.waveNumber * 2;

        for (let i = 0; i < baseCount; i++) {
            this.enemiesToSpawn.push({ type: 'grunt', delay: i * 0.5 });
        }

        if (this.waveNumber >= 2) {
            for (let i = 0; i < Math.floor(baseCount * 0.3); i++) {
                this.enemiesToSpawn.push({ type: 'runner', delay: 2 + i * 0.3 });
            }
        }

        if (this.waveNumber >= 3) {
            for (let i = 0; i < Math.floor(this.waveNumber / 3); i++) {
                this.enemiesToSpawn.push({ type: 'tank', delay: 5 + i * 2 });
            }
        }

        if (this.waveNumber % 10 === 0) {
            this.enemiesToSpawn.push({ type: 'boss', delay: 10 });
        }

        this.enemiesToSpawn.sort((a, b) => a.delay - b.delay);
    }

    spawnEnemy(enemyData) {
        try {
            // Pick random edge spawn point
            const edges = ['top', 'bottom', 'left', 'right'];
            const edge = edges[Math.floor(Math.random() * edges.length)];

            let x, y;
            switch (edge) {
                case 'top': x = Math.floor(Math.random() * this.cols); y = 0; break;
                case 'bottom': x = Math.floor(Math.random() * this.cols); y = this.rows - 1; break;
                case 'left': x = 0; y = Math.floor(Math.random() * this.rows); break;
                case 'right': x = this.cols - 1; y = Math.floor(Math.random() * this.rows); break;
            }

            const config = ENEMY_TYPES[enemyData.type];
            if (!config) {
                console.error(`Unknown enemy type: ${enemyData.type}`);
                return;
            }
            const healthMult = 1 + (this.waveNumber - 1) * 0.1;

        const enemy = {
            id: Date.now() + Math.random(),
            type: enemyData.type,
            x: x * this.cellSize + this.cellSize / 2,
            y: y * this.cellSize + this.cellSize / 2,
            gridX: x,
            gridY: y,
            health: config.health * healthMult,
            maxHealth: config.health * healthMult,
            speed: config.speed,
            damage: config.damage,
            path: [],
            pathIndex: 0,
            dead: false,
            reachedNexus: false,
            burning: false,
            burnTime: 0,
            burnDamage: 0
        };

        const path = this.findPath(x, y, this.nexusX, this.nexusY);
        if (path) {
            enemy.path = path;
            this.enemies.push(enemy);
        }
        } catch (error) {
            console.error('Error spawning enemy:', error);
        }
    }

    updateEnemy(enemy, deltaTime) {
        if (!enemy || enemy.dead) return;

        // Burning
        if (enemy.burning) {
            enemy.burnTime -= deltaTime;
            enemy.health -= (enemy.burnDamage || 0) * deltaTime;
            if (enemy.burnTime <= 0) enemy.burning = false;
        }

        // Movement
        if (enemy.path && enemy.pathIndex < enemy.path.length) {
            const target = enemy.path[enemy.pathIndex];
            if (target) {
                const targetX = target.x * this.cellSize + this.cellSize / 2;
                const targetY = target.y * this.cellSize + this.cellSize / 2;

                const dx = targetX - enemy.x;
                const dy = targetY - enemy.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist > 2) {
                    const moveSpeed = (enemy.speed || 1) * this.cellSize * deltaTime;
                    enemy.x += (dx / dist) * moveSpeed;
                    enemy.y += (dy / dist) * moveSpeed;
                    enemy.angle = Math.atan2(dy, dx);
                } else {
                    enemy.pathIndex++;
                }
            }
        }

        // Update grid position
        enemy.gridX = Math.floor(enemy.x / this.cellSize);
        enemy.gridY = Math.floor(enemy.y / this.cellSize);

        // Check nexus collision
        const nexusWorldX = this.nexusX * this.cellSize + this.cellSize / 2;
        const nexusWorldY = this.nexusY * this.cellSize + this.cellSize / 2;
        const nexusDist = Math.sqrt(
            (enemy.x - nexusWorldX) ** 2 + (enemy.y - nexusWorldY) ** 2
        );

        if (nexusDist < this.cellSize) {
            enemy.reachedNexus = true;
            enemy.dead = true;
            this.nexusHealth -= (enemy.damage || 10);
        }

        if (enemy.health <= 0) {
            enemy.dead = true;
        }
    }

    updateTurret(turret, deltaTime) {
        if (!turret || !turret.config) return;

        turret.cooldown -= deltaTime;

        // Find target
        let target = null;
        let closestDist = Infinity;
        const range = (turret.config.range || 4) * this.cellSize;

        for (const enemy of this.enemies) {
            if (!enemy || enemy.dead) continue;
            const dist = Math.sqrt(
                (turret.x - enemy.x) ** 2 + (turret.y - enemy.y) ** 2
            );
            if (dist <= range && dist < closestDist) {
                target = enemy;
                closestDist = dist;
            }
        }

        if (target && !target.dead) {
            turret.angle = Math.atan2(target.y - turret.y, target.x - turret.x);

            if (turret.cooldown <= 0) {
                this.fireTurret(turret, target);
                turret.cooldown = turret.config.fireRate || 0.5;
            }
        }
    }

    fireTurret(turret, target) {
        if (!turret || !turret.config || !target || target.dead) return;

        const damage = turret.config.damage || 10;

        if (turret.config.instantHit) {
            target.health -= damage;
        } else if (turret.config.chainTargets) {
            // Tesla chain
            let current = target;
            const hitTargets = [];
            for (let i = 0; i < turret.config.chainTargets; i++) {
                if (current && !current.dead) {
                    current.health -= damage;
                    hitTargets.push(current);
                    // Find next target
                    current = this.findNearestEnemy(current.x, current.y, 2 * this.cellSize, hitTargets);
                }
            }
        } else if (turret.config.continuous) {
            // Flamethrower
            target.health -= damage * 0.1;
            target.burning = true;
            target.burnDamage = turret.config.dotDamage || 5;
            target.burnTime = turret.config.dotDuration || 2;
        } else {
            // Standard projectile
            const dx = target.x - turret.x;
            const dy = target.y - turret.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 0) {
                // Determine projectile type from turret type
                let projType = 'bullet';
                if (turret.type === 'turret-artillery') projType = 'artillery';
                else if (turret.type === 'turret-sniper') projType = 'sniper';

                this.projectiles.push({
                    id: Date.now() + Math.random(),
                    type: projType,
                    x: turret.x,
                    y: turret.y,
                    startX: turret.x,
                    startY: turret.y,
                    vx: (dx / dist) * (turret.config.projectileSpeed || 10) * this.cellSize,
                    vy: (dy / dist) * (turret.config.projectileSpeed || 10) * this.cellSize,
                    damage: damage,
                    aoeRadius: turret.config.aoeRadius || 0,
                    penetration: turret.config.penetration || false,
                    hitEnemies: []
                });
            }
        }
    }

    findNearestEnemy(x, y, range, exclude = []) {
        let nearest = null;
        let minDist = Infinity;

        for (const enemy of this.enemies) {
            if (enemy.dead || exclude.includes(enemy)) continue;
            const dist = Math.sqrt((x - enemy.x) ** 2 + (y - enemy.y) ** 2);
            if (dist <= range && dist < minDist) {
                nearest = enemy;
                minDist = dist;
            }
        }
        return nearest;
    }

    updateProjectiles(deltaTime) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            if (!proj) {
                this.projectiles.splice(i, 1);
                continue;
            }

            proj.x += (proj.vx || 0) * deltaTime;
            proj.y += (proj.vy || 0) * deltaTime;

            // Bounds check
            if (proj.x < 0 || proj.x > this.cols * this.cellSize ||
                proj.y < 0 || proj.y > this.rows * this.cellSize) {
                this.projectiles.splice(i, 1);
                continue;
            }

            // Hit detection
            for (const enemy of this.enemies) {
                if (!enemy || enemy.dead) continue;
                if (proj.hitEnemies && proj.hitEnemies.includes(enemy.id)) continue;

                const dist = Math.sqrt((proj.x - enemy.x) ** 2 + (proj.y - enemy.y) ** 2);
                if (dist < this.cellSize * 0.5) {
                    if (proj.aoeRadius > 0) {
                        this.dealAOE(proj.x, proj.y, proj.aoeRadius * this.cellSize, proj.damage || 10);
                        this.projectiles.splice(i, 1);
                    } else {
                        enemy.health -= (proj.damage || 10);
                        if (proj.penetration) {
                            if (!proj.hitEnemies) proj.hitEnemies = [];
                            proj.hitEnemies.push(enemy.id);
                        } else {
                            this.projectiles.splice(i, 1);
                        }
                    }
                    break;
                }
            }
        }
    }

    dealAOE(x, y, radius, damage) {
        if (!radius || radius <= 0) return;
        for (const enemy of this.enemies) {
            if (!enemy || enemy.dead) continue;
            const dist = Math.sqrt((x - enemy.x) ** 2 + (y - enemy.y) ** 2);
            if (dist <= radius) {
                const falloff = 1 - (dist / radius) * 0.5;
                enemy.health -= (damage || 10) * falloff;
            }
        }
    }

    placeBuilding(gridX, gridY, buildingType, playerId) {
        if (!this.canPlace(gridX, gridY, buildingType)) {
            return { success: false, message: 'Cannot place here' };
        }

        const cost = this.getBuildingCost(buildingType);
        if (!this.canAfford(cost)) {
            return { success: false, message: 'Not enough resources' };
        }

        // Deduct cost
        for (const [res, amt] of Object.entries(cost)) {
            this.resources[res] -= amt;
        }

        const worldX = gridX * this.cellSize + this.cellSize / 2;
        const worldY = gridY * this.cellSize + this.cellSize / 2;

        if (buildingType.startsWith('turret-')) {
            const config = TURRET_TYPES[buildingType];
            this.turrets.push({
                id: Date.now(),
                type: buildingType,
                gridX,
                gridY,
                x: worldX,
                y: worldY,
                angle: 0,
                cooldown: 0,
                config: { ...config }, // Copy config so we can modify it
                level: 1,
                maxLevel: 5,
                playerId
            });
            this.grid[gridY][gridX] = 1;
        } else if (buildingType === 'wall') {
            this.walls.push({
                id: Date.now(),
                gridX,
                gridY,
                x: worldX,
                y: worldY,
                health: 200,
                playerId
            });
            this.grid[gridY][gridX] = 1;
            this.recalculatePaths();
        } else if (buildingType === 'extractor') {
            const resourceType = this.resourceMap[gridY][gridX];
            if (resourceType) {
                this.extractors.push({
                    id: Date.now(),
                    gridX,
                    gridY,
                    x: worldX,
                    y: worldY,
                    resourceType,
                    timer: 0,
                    level: 1,
                    maxLevel: 5,
                    extractionRate: 1, // Resources per second
                    playerId
                });
                this.grid[gridY][gridX] = 1;
            }
        }

        return { success: true };
    }

    sellBuilding(gridX, gridY, playerId) {
        // Find turret at position
        const turretIndex = this.turrets.findIndex(t => t.gridX === gridX && t.gridY === gridY);
        if (turretIndex > -1) {
            const turret = this.turrets[turretIndex];
            const baseCost = TURRET_TYPES[turret.type]?.cost || {};

            // 75% refund, scaled by level
            const refundMultiplier = 0.75 * (1 + (turret.level - 1) * 0.5);
            for (const [res, amt] of Object.entries(baseCost)) {
                this.resources[res] = (this.resources[res] || 0) + Math.floor(amt * refundMultiplier);
            }

            this.turrets.splice(turretIndex, 1);
            this.grid[gridY][gridX] = 0;
            return { success: true, type: 'turret' };
        }

        // Find extractor at position
        const extractorIndex = this.extractors.findIndex(e => e.gridX === gridX && e.gridY === gridY);
        if (extractorIndex > -1) {
            const extractor = this.extractors[extractorIndex];
            const baseCost = BUILDING_TYPES['extractor']?.cost || { iron: 50 };

            // 75% refund, scaled by level
            const refundMultiplier = 0.75 * (1 + (extractor.level - 1) * 0.5);
            for (const [res, amt] of Object.entries(baseCost)) {
                this.resources[res] = (this.resources[res] || 0) + Math.floor(amt * refundMultiplier);
            }

            this.extractors.splice(extractorIndex, 1);
            this.grid[gridY][gridX] = 2; // Back to resource cell
            return { success: true, type: 'extractor' };
        }

        // Find wall at position
        const wallIndex = this.walls.findIndex(w => w.gridX === gridX && w.gridY === gridY);
        if (wallIndex > -1) {
            const baseCost = BUILDING_TYPES['wall']?.cost || { iron: 20 };

            // 75% refund
            for (const [res, amt] of Object.entries(baseCost)) {
                this.resources[res] = (this.resources[res] || 0) + Math.floor(amt * 0.75);
            }

            this.walls.splice(wallIndex, 1);
            this.grid[gridY][gridX] = 0;
            this.recalculatePaths();
            return { success: true, type: 'wall' };
        }

        return { success: false, message: 'No building at this position' };
    }

    upgradeBuilding(gridX, gridY, playerId) {
        // Find turret at position
        const turret = this.turrets.find(t => t.gridX === gridX && t.gridY === gridY);
        if (turret) {
            if (turret.level >= turret.maxLevel) {
                return { success: false, message: 'Already max level' };
            }

            // Upgrade cost: 50% of base cost per level
            const baseCost = TURRET_TYPES[turret.type]?.cost || {};
            const upgradeCost = {};
            for (const [res, amt] of Object.entries(baseCost)) {
                upgradeCost[res] = Math.floor(amt * 0.5 * turret.level);
            }

            if (!this.canAfford(upgradeCost)) {
                return { success: false, message: 'Not enough resources' };
            }

            // Deduct cost
            for (const [res, amt] of Object.entries(upgradeCost)) {
                this.resources[res] -= amt;
            }

            // Apply upgrade
            turret.level++;
            turret.config.damage = Math.floor(turret.config.damage * 1.25);
            turret.config.range = turret.config.range * 1.1;
            if (turret.config.fireRate > 0.05) {
                turret.config.fireRate = turret.config.fireRate * 0.9;
            }

            return { success: true, type: 'turret', level: turret.level };
        }

        // Find extractor at position
        const extractor = this.extractors.find(e => e.gridX === gridX && e.gridY === gridY);
        if (extractor) {
            if (extractor.level >= extractor.maxLevel) {
                return { success: false, message: 'Already max level' };
            }

            // Upgrade cost: 30 iron + 10 per level
            const upgradeCost = { iron: 30 + extractor.level * 10 };

            if (!this.canAfford(upgradeCost)) {
                return { success: false, message: 'Not enough resources' };
            }

            // Deduct cost
            for (const [res, amt] of Object.entries(upgradeCost)) {
                this.resources[res] -= amt;
            }

            // Apply upgrade: +50% extraction rate per level
            extractor.level++;
            extractor.extractionRate = 1 + (extractor.level - 1) * 0.5;

            return { success: true, type: 'extractor', level: extractor.level };
        }

        return { success: false, message: 'No upgradeable building at this position' };
    }

    canPlace(gridX, gridY, buildingType) {
        if (gridX < 0 || gridX >= this.cols || gridY < 0 || gridY >= this.rows) {
            return false;
        }

        if (buildingType === 'extractor') {
            return this.grid[gridY][gridX] === 2;
        }

        return this.grid[gridY][gridX] === 0 || this.grid[gridY][gridX] === 2;
    }

    getBuildingCost(buildingType) {
        if (buildingType.startsWith('turret-')) {
            return TURRET_TYPES[buildingType]?.cost || {};
        }
        return BUILDING_TYPES[buildingType]?.cost || {};
    }

    canAfford(cost) {
        for (const [res, amt] of Object.entries(cost)) {
            if ((this.resources[res] || 0) < amt) return false;
        }
        return true;
    }

    recalculatePaths() {
        for (const enemy of this.enemies) {
            const path = this.findPath(enemy.gridX, enemy.gridY, this.nexusX, this.nexusY);
            if (path) {
                enemy.path = path;
                enemy.pathIndex = 0;
            }
        }
    }

    findPath(startX, startY, endX, endY) {
        const openSet = [{ x: startX, y: startY, f: 0, g: 0 }];
        const closedSet = new Set();
        const cameFrom = new Map();
        const gScore = new Map();

        gScore.set(`${startX},${startY}`, 0);

        while (openSet.length > 0) {
            openSet.sort((a, b) => a.f - b.f);
            const current = openSet.shift();
            const key = `${current.x},${current.y}`;

            if (current.x === endX && current.y === endY) {
                return this.reconstructPath(cameFrom, current);
            }

            closedSet.add(key);

            const neighbors = [
                { x: current.x - 1, y: current.y },
                { x: current.x + 1, y: current.y },
                { x: current.x, y: current.y - 1 },
                { x: current.x, y: current.y + 1 }
            ];

            for (const n of neighbors) {
                const nKey = `${n.x},${n.y}`;
                if (closedSet.has(nKey)) continue;
                if (!this.isWalkable(n.x, n.y)) continue;

                const tentativeG = gScore.get(key) + 1;

                if (!gScore.has(nKey) || tentativeG < gScore.get(nKey)) {
                    cameFrom.set(nKey, current);
                    gScore.set(nKey, tentativeG);
                    const h = Math.abs(n.x - endX) + Math.abs(n.y - endY);
                    n.f = tentativeG + h;
                    n.g = tentativeG;

                    if (!openSet.some(o => o.x === n.x && o.y === n.y)) {
                        openSet.push(n);
                    }
                }
            }
        }

        return null;
    }

    isWalkable(x, y) {
        if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) return false;
        const cell = this.grid[y][x];
        return cell === 0 || cell === 2 || cell === 3;
    }

    reconstructPath(cameFrom, current) {
        const path = [{ x: current.x, y: current.y }];
        let key = `${current.x},${current.y}`;

        while (cameFrom.has(key)) {
            const prev = cameFrom.get(key);
            path.unshift({ x: prev.x, y: prev.y });
            key = `${prev.x},${prev.y}`;
        }

        return path;
    }

    isGameOver() {
        return this.nexusHealth <= 0;
    }

    serialize() {
        return {
            resources: this.resources,
            nexusHealth: this.nexusHealth,
            nexusMaxHealth: this.nexusMaxHealth,
            waveNumber: this.waveNumber,
            grid: this.grid,
            resourceMap: this.resourceMap,
            nexusX: this.nexusX,
            nexusY: this.nexusY
        };
    }

    serializeForSync() {
        return {
            resources: this.resources,
            nexusHealth: this.nexusHealth,
            waveNumber: this.waveNumber,
            waveTimer: this.waveTimer,
            waveActive: this.waveActive,
            enemies: this.enemies.map(e => ({
                id: e.id,
                type: e.type,
                x: e.x,
                y: e.y,
                health: e.health,
                maxHealth: e.maxHealth,
                angle: e.angle,
                burning: e.burning
            })),
            turrets: this.turrets.map(t => ({
                id: t.id,
                type: t.type,
                gridX: t.gridX,
                gridY: t.gridY,
                x: t.x,
                y: t.y,
                angle: t.angle,
                level: t.level || 1
            })),
            walls: this.walls.map(w => ({
                id: w.id,
                gridX: w.gridX,
                gridY: w.gridY,
                x: w.x,
                y: w.y,
                health: w.health
            })),
            extractors: this.extractors.map(e => ({
                id: e.id,
                gridX: e.gridX,
                gridY: e.gridY,
                x: e.x,
                y: e.y,
                resourceType: e.resourceType,
                level: e.level || 1,
                extractionRate: e.extractionRate || 1
            })),
            projectiles: this.projectiles.map(p => ({
                id: p.id,
                type: p.type || 'bullet',
                x: p.x,
                y: p.y,
                startX: p.startX,
                startY: p.startY,
                aoeRadius: p.aoeRadius || 0
            })),
            grid: this.grid
        };
    }
}

module.exports = GameState;
