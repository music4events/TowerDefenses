const TURRET_TYPES = {
    'turret-mg': {
        name: 'Mitrailleuse',
        damage: 5,
        range: 4,
        fireRate: 0.1,
        cost: { iron: 100 },
        projectileSpeed: 15,
        health: 100,
        maxHealth: 100
    },
    'turret-sniper': {
        name: 'Sniper',
        damage: 50,
        range: 10,
        fireRate: 1.5,
        cost: { iron: 200, copper: 50 },
        projectileSpeed: 30,
        penetration: true,
        health: 80,
        maxHealth: 80
    },
    'turret-artillery': {
        name: 'Artillerie',
        damage: 30,
        range: 8,
        fireRate: 2,
        cost: { iron: 300, copper: 100 },
        projectileSpeed: 8,
        aoeRadius: 2,
        health: 120,
        maxHealth: 120
    },
    'turret-flamethrower': {
        name: 'Lance-flammes',
        damage: 15,
        range: 3,
        fireRate: 0.05,
        cost: { iron: 150, coal: 30 },
        continuous: true,
        dotDamage: 5,
        dotDuration: 2,
        health: 90,
        maxHealth: 90
    },
    'turret-tesla': {
        name: 'Tesla',
        damage: 25,
        range: 5,
        fireRate: 0.8,
        cost: { iron: 400, copper: 150, gold: 50 },
        chainTargets: 3,
        chainRange: 2,
        health: 100,
        maxHealth: 100
    },
    'turret-laser': {
        name: 'Laser',
        damage: 40,
        range: 6,
        fireRate: 0.2,
        cost: { iron: 500, copper: 200, gold: 100 },
        instantHit: true,
        health: 80,
        maxHealth: 80
    },
    // === NOUVELLES TOURELLES ===
    'turret-shotgun': {
        name: 'Shotgun',
        damage: 8,
        range: 4,
        fireRate: 0.8,
        cost: { iron: 150, copper: 30 },
        projectileSpeed: 12,
        pelletCount: 6,
        spreadAngle: 0.5,
        health: 100,
        maxHealth: 100
    },
    'turret-multi-artillery': {
        name: 'Multi-Artillerie',
        damage: 25,
        range: 9,
        fireRate: 2.5,
        cost: { iron: 400, copper: 150, coal: 50 },
        projectileSpeed: 7,
        aoeRadius: 1.5,
        shellCount: 3,
        shellSpread: 1.5,
        health: 130,
        maxHealth: 130
    },
    'turret-healer': {
        name: 'Healer',
        damage: 0,
        healAmount: 10,
        range: 4,
        fireRate: 0.5,
        cost: { iron: 250, copper: 100, gold: 30 },
        isHealer: true,
        health: 80,
        maxHealth: 80
    },
    'turret-slowdown': {
        name: 'Ralentisseur',
        damage: 0,
        slowAmount: 0.4,
        range: 4,
        fireRate: 0.1,
        cost: { iron: 180, copper: 60 },
        isSlowdown: true,
        aoeRange: 3,
        health: 90,
        maxHealth: 90
    },
    'turret-mortar': {
        name: 'Mortier',
        damage: 60,
        range: 14,
        minRange: 5,
        fireRate: 3,
        cost: { iron: 350, copper: 120 },
        projectileSpeed: 6,
        aoeRadius: 2.5,
        health: 110,
        maxHealth: 110
    },
    'turret-railgun': {
        name: 'Railgun',
        damage: 70,
        range: 12,
        fireRate: 2.5,
        cost: { iron: 500, copper: 200, gold: 80 },
        instantHit: true,
        piercingBeam: true,
        health: 90,
        maxHealth: 90
    },
    'turret-drone': {
        name: 'Drone',
        damage: 12,
        range: 5,
        fireRate: 0.3,
        cost: { iron: 300, copper: 150, gold: 50 },
        projectileSpeed: 18,
        isDrone: true,
        patrolRadius: 4,
        moveSpeed: 2,
        health: 60,
        maxHealth: 60
    },
    'turret-shockwave': {
        name: 'Shockwave',
        damage: 20,
        range: 4,
        fireRate: 1.5,
        cost: { iron: 350, copper: 150, gold: 60 },
        isShockwave: true,
        aoeRange: 3,
        health: 100,
        maxHealth: 100
    },
    'turret-speed-booster': {
        name: 'Speed Booster',
        damage: 0,
        range: 4,
        fireRate: 0.5,
        cost: { iron: 200, copper: 80, gold: 40 },
        isSpeedBooster: true,
        fireRateBoost: 0.25, // 25% faster firing for nearby turrets
        health: 80,
        maxHealth: 80
    },
    'turret-damage-booster': {
        name: 'Damage Booster',
        damage: 0,
        range: 4,
        fireRate: 0.5,
        cost: { iron: 250, copper: 100, gold: 50 },
        isDamageBooster: true,
        damageBoost: 0.3, // 30% more damage for nearby turrets
        health: 80,
        maxHealth: 80
    }
};

const BUILDING_TYPES = {
    'wall': { health: 200, cost: { iron: 20 } },
    'extractor': { health: 100, cost: { iron: 50 } }
};

const ENEMY_TYPES = {
    'grunt': {
        health: 50, speed: 1, damage: 10, reward: { iron: 5 },
        turretAttackRange: 1, turretAttackDamage: 5, turretAttackRate: 1.5
    },
    'runner': {
        health: 30, speed: 2, damage: 5, reward: { iron: 3 },
        turretAttackRange: 0.8, turretAttackDamage: 3, turretAttackRate: 1
    },
    'tank': {
        health: 300, speed: 0.5, damage: 30, armor: 0.5, reward: { iron: 20, copper: 5 },
        turretAttackRange: 1.2, turretAttackDamage: 15, turretAttackRate: 2
    },
    'kamikaze': {
        health: 20, speed: 2.5, damage: 100, reward: { iron: 8 },
        turretAttackRange: 0, turretAttackDamage: 0, turretAttackRate: 999
    },
    'healer': {
        health: 80, speed: 1, damage: 0, healAmount: 5, reward: { iron: 15, copper: 5 },
        turretAttackRange: 0, turretAttackDamage: 0, turretAttackRate: 999
    },
    'boss': {
        health: 2000, speed: 0.3, damage: 100, reward: { iron: 100, copper: 50, gold: 20 },
        turretAttackRange: 1.5, turretAttackDamage: 25, turretAttackRate: 2
    },
    // === NOUVEAUX ENNEMIS ===
    'flying': {
        health: 40, speed: 1.5, damage: 15, reward: { iron: 10, copper: 3 },
        isFlying: true,
        turretAttackRange: 0, turretAttackDamage: 0, turretAttackRate: 999
    },
    'splitter': {
        health: 100, speed: 0.8, damage: 15, reward: { iron: 12 },
        splitOnDeath: true, splitCount: 2, splitType: 'splitter-child',
        turretAttackRange: 1, turretAttackDamage: 6, turretAttackRate: 1.5
    },
    'splitter-child': {
        health: 40, speed: 1.2, damage: 8, reward: { iron: 4 },
        turretAttackRange: 0.8, turretAttackDamage: 3, turretAttackRate: 1.2
    },
    'armored-front': {
        health: 200, speed: 0.7, damage: 20, reward: { iron: 25, copper: 10 },
        frontArmor: 0.8, backArmor: 0,
        turretAttackRange: 1, turretAttackDamage: 10, turretAttackRate: 1.5
    }
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

        // Effects to send to client (explosions, deaths)
        this.pendingEffects = [];
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
            // NOTE: pendingEffects is NOT cleared here - it accumulates between syncs
            // It gets cleared in serializeForSync() after being sent to clients

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

            // Remove dead enemies and handle splitters
            const enemiesToSpawn = [];
            this.enemies = this.enemies.filter(e => {
                if (!e) return false;
                if (e.dead) {
                    // Add death effect
                    const enemyType = ENEMY_TYPES[e.type];
                    this.pendingEffects.push({
                        type: 'death',
                        x: e.x,
                        y: e.y,
                        enemyType: e.type,
                        color: enemyType?.color || '#ff4444'
                    });

                    if (!e.reachedNexus) {
                        if (enemyType && enemyType.reward) {
                            for (const [res, amt] of Object.entries(enemyType.reward)) {
                                this.resources[res] = (this.resources[res] || 0) + amt;
                            }
                        }
                        // Handle splitter
                        if (enemyType && enemyType.splitOnDeath) {
                            const count = enemyType.splitCount || 2;
                            const childType = enemyType.splitType || 'splitter-child';
                            for (let i = 0; i < count; i++) {
                                enemiesToSpawn.push({
                                    type: childType,
                                    gridX: e.gridX,
                                    gridY: e.gridY
                                });
                            }
                        }
                    }
                }
                return !e.dead;
            });

            // Spawn splitter children
            for (const spawn of enemiesToSpawn) {
                this.spawnSplitterChild(spawn);
            }

            // Reset boosts for all turrets
            for (const turret of this.turrets) {
                turret.speedBoosted = false;
                turret.damageBoosted = false;
                turret.speedBoostAmount = 0;
                turret.damageBoostAmount = 0;
            }

            // Update booster turrets FIRST so they can set boost flags
            for (const turret of this.turrets) {
                if (turret.config?.isSpeedBooster || turret.config?.isDamageBooster) {
                    this.updateTurret(turret, deltaTime);
                }
            }

            // Update all other turrets
            for (const turret of this.turrets) {
                if (!turret.config?.isSpeedBooster && !turret.config?.isDamageBooster) {
                    this.updateTurret(turret, deltaTime);
                }
            }

            // Remove destroyed turrets
            this.turrets = this.turrets.filter(t => {
                if (t.health !== undefined && t.health <= 0) {
                    this.grid[t.gridY][t.gridX] = 0;
                    this.recalculatePaths();
                    return false;
                }
                return true;
            });

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

        // Spawn rate increases with waves (faster spawning)
        const spawnInterval = Math.max(0.2, 0.5 - this.waveNumber * 0.02);

        // Grunts - always
        for (let i = 0; i < baseCount; i++) {
            this.enemiesToSpawn.push({ type: 'grunt', delay: i * spawnInterval });
        }

        // Runners - from wave 2
        if (this.waveNumber >= 2) {
            const count = Math.floor(baseCount * 0.3);
            for (let i = 0; i < count; i++) {
                this.enemiesToSpawn.push({ type: 'runner', delay: 2 + i * spawnInterval * 0.6 });
            }
        }

        // Tanks - from wave 3
        if (this.waveNumber >= 3) {
            const count = Math.floor(this.waveNumber / 3);
            for (let i = 0; i < count; i++) {
                this.enemiesToSpawn.push({ type: 'tank', delay: 5 + i * 2 });
            }
        }

        // Kamikazes - from wave 4
        if (this.waveNumber >= 4) {
            const count = Math.floor(this.waveNumber / 4);
            for (let i = 0; i < count; i++) {
                this.enemiesToSpawn.push({ type: 'kamikaze', delay: 3 + i * 1.5 });
            }
        }

        // Flying enemies - from wave 5
        if (this.waveNumber >= 5) {
            const count = Math.floor(this.waveNumber / 5);
            for (let i = 0; i < count; i++) {
                this.enemiesToSpawn.push({ type: 'flying', delay: 4 + i * 2 });
            }
        }

        // Splitters - from wave 6
        if (this.waveNumber >= 6) {
            const count = Math.floor(this.waveNumber / 6);
            for (let i = 0; i < count; i++) {
                this.enemiesToSpawn.push({ type: 'splitter', delay: 6 + i * 3 });
            }
        }

        // Armored-front - from wave 7
        if (this.waveNumber >= 7) {
            const count = Math.floor(this.waveNumber / 7);
            for (let i = 0; i < count; i++) {
                this.enemiesToSpawn.push({ type: 'armored-front', delay: 7 + i * 2.5 });
            }
        }

        // Healers - from wave 8 (supporting enemies)
        if (this.waveNumber >= 8) {
            const count = Math.floor(this.waveNumber / 8);
            for (let i = 0; i < count; i++) {
                this.enemiesToSpawn.push({ type: 'healer', delay: 8 + i * 4 });
            }
        }

        // Boss every 10 waves
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

            // Scaling: HP increases 10% per wave, speed increases 3% per wave
            const healthMult = 1 + (this.waveNumber - 1) * 0.1;
            const speedMult = 1 + (this.waveNumber - 1) * 0.03;

        const enemy = {
            id: Date.now() + Math.random(),
            type: enemyData.type,
            x: x * this.cellSize + this.cellSize / 2,
            y: y * this.cellSize + this.cellSize / 2,
            gridX: x,
            gridY: y,
            health: config.health * healthMult,
            maxHealth: config.health * healthMult,
            speed: config.speed * speedMult,
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

    spawnSplitterChild(spawn) {
        try {
            const config = ENEMY_TYPES[spawn.type];
            if (!config) return;

            const x = spawn.gridX;
            const y = spawn.gridY;

            const enemy = {
                id: Date.now() + Math.random(),
                type: spawn.type,
                x: x * this.cellSize + this.cellSize / 2 + (Math.random() - 0.5) * 20,
                y: y * this.cellSize + this.cellSize / 2 + (Math.random() - 0.5) * 20,
                gridX: x,
                gridY: y,
                health: config.health,
                maxHealth: config.health,
                speed: config.speed,
                damage: config.damage,
                path: [],
                pathIndex: 0,
                dead: false,
                reachedNexus: false,
                burning: false,
                burnTime: 0,
                burnDamage: 0,
                turretAttackCooldown: 0
            };

            const path = this.findPath(x, y, this.nexusX, this.nexusY);
            if (path) {
                enemy.path = path;
            }
            this.enemies.push(enemy);
        } catch (error) {
            console.error('Error spawning splitter child:', error);
        }
    }

    updateEnemy(enemy, deltaTime) {
        if (!enemy || enemy.dead) return;

        const enemyType = ENEMY_TYPES[enemy.type];

        // Burning
        if (enemy.burning) {
            enemy.burnTime -= deltaTime;
            enemy.health -= (enemy.burnDamage || 0) * deltaTime;
            if (enemy.burnTime <= 0) enemy.burning = false;
        }

        // Attack cooldown
        if (enemy.turretAttackCooldown === undefined) enemy.turretAttackCooldown = 0;
        enemy.turretAttackCooldown -= deltaTime;

        // Movement - Flying enemies go directly to nexus
        const nexusWorldX = this.nexusX * this.cellSize + this.cellSize / 2;
        const nexusWorldY = this.nexusY * this.cellSize + this.cellSize / 2;

        if (enemyType && enemyType.isFlying) {
            // Flying: direct path to nexus
            const dx = nexusWorldX - enemy.x;
            const dy = nexusWorldY - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 2) {
                const slowMult = enemy.slowMultiplier || 1;
                const moveSpeed = (enemy.speed || 1) * slowMult * this.cellSize * deltaTime;
                enemy.x += (dx / dist) * moveSpeed;
                enemy.y += (dy / dist) * moveSpeed;
                enemy.angle = Math.atan2(dy, dx);
            }
        } else if (enemy.path && enemy.pathIndex < enemy.path.length) {
            // Normal pathing
            const target = enemy.path[enemy.pathIndex];
            if (target) {
                const targetX = target.x * this.cellSize + this.cellSize / 2;
                const targetY = target.y * this.cellSize + this.cellSize / 2;

                const dx = targetX - enemy.x;
                const dy = targetY - enemy.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist > 2) {
                    const slowMult = enemy.slowMultiplier || 1;
                    const moveSpeed = (enemy.speed || 1) * slowMult * this.cellSize * deltaTime;
                    enemy.x += (dx / dist) * moveSpeed;
                    enemy.y += (dy / dist) * moveSpeed;
                    enemy.angle = Math.atan2(dy, dx);
                } else {
                    enemy.pathIndex++;
                }
            }
        }

        // Reset slow each frame
        enemy.slowMultiplier = 1;
        enemy.frosted = false;

        // Update grid position
        enemy.gridX = Math.floor(enemy.x / this.cellSize);
        enemy.gridY = Math.floor(enemy.y / this.cellSize);

        // Attack turrets while passing
        if (enemyType && enemyType.turretAttackRange > 0 && enemy.turretAttackCooldown <= 0) {
            this.enemyAttackTurret(enemy, enemyType);
        }

        // Check nexus collision
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

    enemyAttackTurret(enemy, enemyType) {
        const attackRange = (enemyType.turretAttackRange || 1) * this.cellSize;
        const attackDamage = enemyType.turretAttackDamage || 5;
        const attackRate = enemyType.turretAttackRate || 1.5;

        // Find nearest turret in range
        let nearestTurret = null;
        let nearestDist = Infinity;

        for (const turret of this.turrets) {
            if (turret.health !== undefined && turret.health <= 0) continue;

            const dist = Math.sqrt((enemy.x - turret.x) ** 2 + (enemy.y - turret.y) ** 2);
            if (dist <= attackRange && dist < nearestDist) {
                nearestTurret = turret;
                nearestDist = dist;
            }
        }

        if (nearestTurret) {
            enemy.turretAttackCooldown = attackRate;
            enemy.isAttackingTurret = true;

            if (nearestTurret.health !== undefined) {
                nearestTurret.health -= attackDamage;
            }
        } else {
            enemy.isAttackingTurret = false;
        }
    }

    updateTurret(turret, deltaTime) {
        if (!turret || !turret.config) return;
        if (turret.health !== undefined && turret.health <= 0) return;

        // Apply cooldown reduction (speed boost from boosters makes it faster)
        const speedMult = 1 + (turret.speedBoostAmount || 0);
        turret.cooldown -= deltaTime * speedMult;

        const range = (turret.config.range || 4) * this.cellSize;
        const minRange = (turret.config.minRange || 0) * this.cellSize;

        // Healer turret - heals other turrets
        if (turret.config.isHealer) {
            if (turret.cooldown <= 0) {
                turret.cooldown = turret.config.fireRate || 0.5;
                for (const other of this.turrets) {
                    if (other === turret) continue;
                    if (other.health === undefined || other.health >= (other.config?.maxHealth || 100)) continue;

                    const dist = Math.sqrt((turret.x - other.x) ** 2 + (turret.y - other.y) ** 2);
                    if (dist <= range) {
                        const healAmount = turret.config.healAmount || 10;
                        other.health = Math.min(other.config?.maxHealth || 100, other.health + healAmount);
                    }
                }
            }
            return;
        }

        // Slowdown turret - slows enemies in range
        if (turret.config.isSlowdown) {
            const slowRange = (turret.config.aoeRange || turret.config.range) * this.cellSize;
            for (const enemy of this.enemies) {
                if (!enemy || enemy.dead) continue;
                const dist = Math.sqrt((turret.x - enemy.x) ** 2 + (turret.y - enemy.y) ** 2);
                if (dist <= slowRange) {
                    enemy.frosted = true;
                    enemy.slowMultiplier = Math.min(enemy.slowMultiplier || 1, turret.config.slowAmount || 0.4);
                }
            }
            return;
        }

        // Drone turret - moves around
        if (turret.config.isDrone) {
            if (turret.homeX === undefined) {
                turret.homeX = turret.x;
                turret.homeY = turret.y;
                turret.patrolAngle = 0;
            }
            turret.patrolAngle = (turret.patrolAngle || 0) + deltaTime * 0.5;

            const patrolRadius = (turret.config.patrolRadius || 4) * this.cellSize;

            // Find target for drone
            let target = null;
            let closestDist = Infinity;
            for (const enemy of this.enemies) {
                if (!enemy || enemy.dead) continue;
                const dist = Math.sqrt((turret.x - enemy.x) ** 2 + (turret.y - enemy.y) ** 2);
                if (dist <= range && dist < closestDist) {
                    target = enemy;
                    closestDist = dist;
                }
            }

            if (target && !target.dead) {
                // Move towards target
                const dx = target.x - turret.x;
                const dy = target.y - turret.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist > range * 0.5) {
                    const moveSpeed = (turret.config.moveSpeed || 2) * this.cellSize * deltaTime;
                    const newX = turret.x + (dx / dist) * moveSpeed;
                    const newY = turret.y + (dy / dist) * moveSpeed;

                    const distFromHome = Math.sqrt((newX - turret.homeX) ** 2 + (newY - turret.homeY) ** 2);
                    if (distFromHome <= patrolRadius) {
                        turret.x = newX;
                        turret.y = newY;
                    }
                }

                turret.angle = Math.atan2(dy, dx);
                if (turret.cooldown <= 0) {
                    this.fireTurret(turret, target);
                    turret.cooldown = turret.config.fireRate || 0.3;
                }
            } else {
                // Patrol
                turret.x = turret.homeX + Math.cos(turret.patrolAngle) * patrolRadius * 0.5;
                turret.y = turret.homeY + Math.sin(turret.patrolAngle) * patrolRadius * 0.5;
            }
            return;
        }

        // Shockwave turret - periodic electric AOE
        if (turret.config.isShockwave) {
            if (turret.cooldown <= 0) {
                const shockRange = (turret.config.aoeRange || turret.config.range) * this.cellSize;
                let hitAny = false;

                for (const enemy of this.enemies) {
                    if (!enemy || enemy.dead) continue;
                    const dist = Math.sqrt((turret.x - enemy.x) ** 2 + (turret.y - enemy.y) ** 2);
                    if (dist <= shockRange) {
                        enemy.health -= turret.config.damage || 20;
                        hitAny = true;
                    }
                }

                // Always create shockwave visual, even if no enemies hit
                this.pendingEffects.push({
                    type: 'shockwave',
                    x: turret.x,
                    y: turret.y,
                    radius: shockRange,
                    color: '#00d4ff'
                });

                turret.cooldown = turret.config.fireRate || 1.5;
            }
            return;
        }

        // Speed Booster - boosts nearby turrets' fire rate
        if (turret.config.isSpeedBooster) {
            const boostRange = (turret.config.range || 4) * this.cellSize;
            const boostAmount = turret.config.fireRateBoost || 0.25;

            for (const other of this.turrets) {
                if (other === turret) continue;
                if (other.config?.isSpeedBooster || other.config?.isDamageBooster || other.config?.isHealer) continue;

                const dist = Math.sqrt((turret.x - other.x) ** 2 + (turret.y - other.y) ** 2);
                if (dist <= boostRange) {
                    // Mark as speed boosted (will reduce cooldown faster)
                    other.speedBoosted = true;
                    other.speedBoostAmount = Math.max(other.speedBoostAmount || 0, boostAmount);
                }
            }
            return;
        }

        // Damage Booster - boosts nearby turrets' damage
        if (turret.config.isDamageBooster) {
            const boostRange = (turret.config.range || 4) * this.cellSize;
            const boostAmount = turret.config.damageBoost || 0.3;

            for (const other of this.turrets) {
                if (other === turret) continue;
                if (other.config?.isSpeedBooster || other.config?.isDamageBooster || other.config?.isHealer) continue;

                const dist = Math.sqrt((turret.x - other.x) ** 2 + (turret.y - other.y) ** 2);
                if (dist <= boostRange) {
                    // Mark as damage boosted
                    other.damageBoosted = true;
                    other.damageBoostAmount = Math.max(other.damageBoostAmount || 0, boostAmount);
                }
            }
            return;
        }

        // Normal turrets - Find target
        let target = null;
        let closestDist = Infinity;

        for (const enemy of this.enemies) {
            if (!enemy || enemy.dead) continue;
            const dist = Math.sqrt(
                (turret.x - enemy.x) ** 2 + (turret.y - enemy.y) ** 2
            );

            // Check min range (for mortar)
            if (dist < minRange) continue;

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

        // Apply damage boost from nearby boosters
        const damageMult = 1 + (turret.damageBoostAmount || 0);
        const damage = (turret.config.damage || 10) * damageMult;

        // Shotgun - multiple pellets
        if (turret.config.pelletCount) {
            const pellets = turret.config.pelletCount || 6;
            const spread = turret.config.spreadAngle || 0.5;
            const baseAngle = turret.angle;

            for (let i = 0; i < pellets; i++) {
                const pelletAngle = baseAngle + (i - (pellets - 1) / 2) * (spread / (pellets - 1));
                const speed = (turret.config.projectileSpeed || 12) * this.cellSize;

                this.projectiles.push({
                    id: Date.now() + Math.random() + i,
                    type: 'pellet',
                    x: turret.x,
                    y: turret.y,
                    startX: turret.x,
                    startY: turret.y,
                    vx: Math.cos(pelletAngle) * speed,
                    vy: Math.sin(pelletAngle) * speed,
                    damage: damage,
                    aoeRadius: 0,
                    penetration: false,
                    hitEnemies: []
                });
            }
            return;
        }

        // Multi-Artillery - multiple shells
        if (turret.config.shellCount) {
            const shells = turret.config.shellCount || 3;
            const spread = (turret.config.shellSpread || 1.5) * this.cellSize;

            for (let i = 0; i < shells; i++) {
                const offsetX = (Math.random() - 0.5) * spread;
                const offsetY = (Math.random() - 0.5) * spread;
                const targetX = target.x + offsetX;
                const targetY = target.y + offsetY;

                const dx = targetX - turret.x;
                const dy = targetY - turret.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist > 0) {
                    this.projectiles.push({
                        id: Date.now() + Math.random() + i,
                        type: 'artillery',
                        x: turret.x,
                        y: turret.y,
                        startX: turret.x,
                        startY: turret.y,
                        vx: (dx / dist) * (turret.config.projectileSpeed || 7) * this.cellSize,
                        vy: (dy / dist) * (turret.config.projectileSpeed || 7) * this.cellSize,
                        damage: damage,
                        aoeRadius: turret.config.aoeRadius || 1.5,
                        penetration: false,
                        hitEnemies: []
                    });
                }
            }
            return;
        }

        // Railgun - piercing beam
        if (turret.config.piercingBeam) {
            const beamEndX = turret.x + Math.cos(turret.angle) * (turret.config.range * this.cellSize);
            const beamEndY = turret.y + Math.sin(turret.angle) * (turret.config.range * this.cellSize);

            // Hit all enemies in line
            for (const enemy of this.enemies) {
                if (!enemy || enemy.dead) continue;

                const dist = this.pointToLineDistance(
                    enemy.x, enemy.y,
                    turret.x, turret.y,
                    beamEndX, beamEndY
                );

                if (dist <= this.cellSize * 0.4) {
                    enemy.health -= damage;
                }
            }

            // Visual beam projectile
            this.projectiles.push({
                id: Date.now() + Math.random(),
                type: 'railgun',
                x: beamEndX,
                y: beamEndY,
                startX: turret.x,
                startY: turret.y,
                vx: 0,
                vy: 0,
                damage: 0,
                life: 0.2
            });
            return;
        }

        if (turret.config.instantHit && !turret.config.piercingBeam) {
            // Laser - instant hit with visual
            target.health -= damage;
            this.projectiles.push({
                id: Date.now() + Math.random(),
                type: 'laser',
                x: target.x,
                y: target.y,
                startX: turret.x,
                startY: turret.y,
                vx: 0,
                vy: 0,
                damage: 0,
                life: 0.1
            });
        } else if (turret.config.chainTargets) {
            // Tesla chain
            let current = target;
            const hitTargets = [];
            const chainRange = (turret.config.chainRange || 2) * this.cellSize;
            let prevX = turret.x;
            let prevY = turret.y;

            for (let i = 0; i < turret.config.chainTargets; i++) {
                if (current && !current.dead) {
                    current.health -= damage;
                    hitTargets.push(current);

                    // Create visual arc
                    this.projectiles.push({
                        id: Date.now() + Math.random() + i,
                        type: 'tesla',
                        x: current.x,
                        y: current.y,
                        startX: prevX,
                        startY: prevY,
                        vx: 0,
                        vy: 0,
                        damage: 0,
                        life: 0.15
                    });

                    prevX = current.x;
                    prevY = current.y;

                    // Find next target
                    current = this.findNearestEnemy(current.x, current.y, chainRange, hitTargets);
                }
            }
        } else if (turret.config.continuous) {
            // Flamethrower
            target.health -= damage * 0.1;
            target.burning = true;
            target.burnDamage = turret.config.dotDamage || 5;
            target.burnTime = turret.config.dotDuration || 2;

            // Create flame particles
            for (let i = 0; i < 3; i++) {
                const spread = 0.3;
                const angle = turret.angle + (Math.random() - 0.5) * spread;
                const speed = (turret.config.projectileSpeed || 5) * this.cellSize;

                this.projectiles.push({
                    id: Date.now() + Math.random() + i,
                    type: 'flame',
                    x: turret.x,
                    y: turret.y,
                    startX: turret.x,
                    startY: turret.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    damage: 0,
                    life: 0.3
                });
            }
        } else {
            // Standard projectile
            const dx = target.x - turret.x;
            const dy = target.y - turret.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 0) {
                // Determine projectile type from turret type
                let projType = 'bullet';
                if (turret.type === 'turret-artillery' || turret.type === 'turret-mortar') projType = 'artillery';
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

    pointToLineDistance(px, py, x1, y1, x2, y2) {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;

        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;

        if (lenSq !== 0) param = dot / lenSq;

        let xx, yy;
        if (param < 0) { xx = x1; yy = y1; }
        else if (param > 1) { xx = x2; yy = y2; }
        else { xx = x1 + param * C; yy = y1 + param * D; }

        return Math.sqrt((px - xx) ** 2 + (py - yy) ** 2);
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

            // Handle beam/visual-only projectiles with life
            if (proj.life !== undefined) {
                proj.life -= deltaTime;
                if (proj.life <= 0) {
                    this.projectiles.splice(i, 1);
                    continue;
                }
                // Beam projectiles don't move or hit - they're just visual
                if (proj.type === 'railgun' || proj.type === 'laser' || proj.type === 'tesla') {
                    continue;
                }
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

        // Add explosion effect
        this.pendingEffects.push({
            type: 'explosion',
            x: x,
            y: y,
            radius: radius,
            color: '#ff6600'
        });

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
            const turret = {
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
                health: config.health || 100,
                maxHealth: config.maxHealth || 100,
                playerId
            };

            // Drone turrets have home position
            if (config.isDrone) {
                turret.homeX = worldX;
                turret.homeY = worldY;
                turret.patrolAngle = 0;
            }

            this.turrets.push(turret);
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
        // Capture effects before clearing
        const effectsToSend = this.pendingEffects.slice();
        this.pendingEffects = []; // Clear after capturing

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
                burning: e.burning,
                frosted: e.frosted,
                slowMultiplier: e.slowMultiplier,
                isAttackingTurret: e.isAttackingTurret
            })),
            turrets: this.turrets.map(t => ({
                id: t.id,
                type: t.type,
                gridX: t.gridX,
                gridY: t.gridY,
                x: t.x,
                y: t.y,
                angle: t.angle,
                level: t.level || 1,
                damage: t.config?.damage,
                range: t.config?.range,
                fireRate: t.config?.fireRate,
                health: t.health,
                maxHealth: t.maxHealth || t.config?.maxHealth || 100,
                homeX: t.homeX,
                homeY: t.homeY,
                speedBoosted: t.speedBoosted || false,
                damageBoosted: t.damageBoosted || false
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
                aoeRadius: p.aoeRadius || 0,
                life: p.life,
                vx: p.vx,
                vy: p.vy,
                damage: p.damage
            })),
            // Effects to trigger on client (explosions, deaths, etc.)
            effects: effectsToSend,
            grid: this.grid
        };
    }
}

module.exports = GameState;
