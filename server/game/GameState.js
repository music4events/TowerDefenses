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
        penetration: false, // Stops on impact
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
        range: 4,
        fireRate: 0.04,
        cost: { iron: 150, coal: 30 },
        continuous: true,
        projectileSpeed: 7,
        flameCount: 6,
        flameLife: 0.9,
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
    },
    'turret-range-booster': {
        name: 'Range Booster',
        damage: 0,
        range: 4,
        fireRate: 0.5,
        cost: { iron: 300, copper: 120, gold: 60 },
        isRangeBooster: true,
        rangeBoost: 0.25, // 25% more range for nearby turrets
        health: 80,
        maxHealth: 80
    },
    // === TOURELLES 2x2 (BUFFED!) ===
    'turret-missile': {
        name: 'Missile Launcher',
        gridSize: 2,
        damage: 60,
        range: 12,
        fireRate: 1.2,
        cost: { iron: 600, copper: 200, gold: 80 },
        projectileSpeed: 12,
        isMissile: true,
        homingStrength: 0.25,
        missileCount: 3,
        explosionRadius: 2.0,
        health: 250,
        maxHealth: 250
    },
    'turret-plasma': {
        name: 'Plasma Cannon',
        gridSize: 2,
        damage: 120,
        range: 10,
        fireRate: 1.5,
        cost: { iron: 700, copper: 250, gold: 100 },
        projectileSpeed: 15,
        isPlasma: true,
        aoeRadius: 1.8,
        health: 220,
        maxHealth: 220
    },
    'turret-cryo': {
        name: 'Cryo Tower',
        gridSize: 2,
        damage: 25,
        range: 7,
        fireRate: 0.1,
        cost: { iron: 550, copper: 180, gold: 70 },
        isCryo: true,
        freezeChance: 0.1,
        slowAmount: 0.6,
        health: 200,
        maxHealth: 200
    },
    'turret-gatling': {
        name: 'Gatling Gun',
        gridSize: 2,
        damage: 8,
        range: 7,
        fireRate: 0.03,
        cost: { iron: 650, copper: 220, gold: 60 },
        projectileSpeed: 25,
        isGatling: true,
        health: 280,
        maxHealth: 280
    },
    'turret-emp': {
        name: 'EMP Tower',
        gridSize: 2,
        damage: 15,
        range: 6,
        fireRate: 3.0,
        cost: { iron: 600, copper: 300, gold: 120 },
        isEMP: true,
        stunDuration: 2.0,
        empRadius: 4,
        health: 180,
        maxHealth: 180
    },
    // === TOURELLES 3x3 ===
    'turret-flak': {
        name: 'FLAK Anti-Aerien',
        gridSize: 3,
        damage: 8,
        range: 18,               // +4 range
        fireRate: 0.08,
        cost: { iron: 800, copper: 300, gold: 100 },
        projectileSpeed: 40,
        isAntiAir: true,
        flakCount: 16,
        flakSpread: 3,
        barrelCount: 2,
        flakExplosion: true,
        flakExplosionRadius: 0.8,
        health: 400,
        maxHealth: 400
    },
    'turret-mega-tesla': {
        name: 'Mega Tesla',
        gridSize: 3,
        damage: 60,
        range: 14,               // +4 range
        fireRate: 1.2,
        cost: { iron: 1200, copper: 500, gold: 200 },
        isMegaTesla: true,
        chainTargets: 8,
        chainRange: 5,           // +1 chain range
        health: 500,
        maxHealth: 500
    },
    'turret-mega-railgun': {
        name: 'Mega Railgun',
        gridSize: 3,
        damage: 200,
        range: 24,               // +6 range
        fireRate: 4.0,
        cost: { iron: 1500, copper: 600, gold: 250 },
        isMegaRailgun: true,
        instantHit: true,
        piercingBeam: true,
        health: 450,
        maxHealth: 450
    },
    'turret-rocket-array': {
        name: 'Rocket Artillery',
        gridSize: 3,
        damage: 60,
        range: 22,               // +6 range
        fireRate: 1.8,
        cost: { iron: 1100, copper: 450, gold: 180 },
        projectileSpeed: 14,
        isRocketArray: true,
        rocketCount: 8,
        isMissile: true,
        homingStrength: 0.2,
        explosionRadius: 2.2,
        health: 480,
        maxHealth: 480
    },
    'turret-laser-array': {
        name: 'Laser Array',
        gridSize: 3,
        damage: 35,
        range: 16,               // +4 range
        fireRate: 0.15,
        cost: { iron: 1000, copper: 400, gold: 160 },
        isLaserArray: true,
        laserCount: 4,
        instantHit: true,
        health: 400,
        maxHealth: 400
    },
    'turret-particle': {
        name: 'Particle Cannon',
        gridSize: 3,
        damage: 150,
        range: 20,               // +5 range
        fireRate: 3.5,
        cost: { iron: 1300, copper: 550, gold: 220 },
        isParticle: true,
        instantHit: true,
        health: 420,
        maxHealth: 420
    },
    'turret-nuclear': {
        name: 'Nuclear Launcher',
        gridSize: 3,
        damage: 600,
        range: 28,               // +6 range
        minRange: 5,
        fireRate: 4.5,
        cost: { iron: 2000, copper: 800, gold: 400 },
        projectileSpeed: 6,
        isNuclear: true,
        aoeRadius: 7,
        homingStrength: 0.08,
        health: 600,
        maxHealth: 600
    },
    'turret-storm': {
        name: 'Storm Generator',
        gridSize: 3,
        damage: 25,
        range: 14,               // +4 range
        fireRate: 0.2,
        cost: { iron: 1100, copper: 500, gold: 200 },
        isStorm: true,
        stormRadius: 6,          // +1 storm radius
        lightningStrikes: 6,     // +1 strikes
        health: 450,
        maxHealth: 450
    },
    'turret-deathray': {
        name: 'Death Ray',
        gridSize: 3,
        damage: 100,
        range: 18,               // +4 range
        fireRate: 0.05,
        cost: { iron: 1400, copper: 600, gold: 280 },
        isDeathRay: true,
        continuous: true,
        health: 380,
        maxHealth: 380
    },
    'turret-missile-battery': {
        name: 'Missile Battery',
        gridSize: 3,
        damage: 70,
        range: 24,
        fireRate: 2.0,
        cost: { iron: 1200, copper: 500, gold: 200 },
        projectileSpeed: 14,
        isMissileBattery: true,
        missileCount: 8,
        isMissile: true,
        homingStrength: 0.25,
        spreadRadius: 2.5,
        explosionRadius: 2.0,
        health: 520,
        maxHealth: 520
    },
    'turret-orbital': {
        name: 'Orbital Strike',
        gridSize: 3,
        damage: 500,
        range: 40,               // +10 range (massive)
        minRange: 3,
        fireRate: 4.0,
        cost: { iron: 2500, copper: 1000, gold: 500 },
        isOrbital: true,
        strikeDelay: 1.0,
        strikeRadius: 6,         // +1 strike radius
        health: 400,
        maxHealth: 400
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
        turretAttackRange: 1.5, turretAttackDamage: 25, turretAttackRate: 2,
        // Boss spawns minions
        isSpawner: true, spawnType: 'grunt', spawnInterval: 4, spawnCount: 2
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
    },
    // === TROUPES AERIENNES ===
    'flying-bomber': {
        health: 60, speed: 1.2, damage: 25, reward: { iron: 15, copper: 5 },
        isFlying: true,
        turretAttackRange: 0, turretAttackDamage: 0, turretAttackRate: 999
    },
    'flying-swarm': {
        health: 20, speed: 2.0, damage: 8, reward: { iron: 5 },
        isFlying: true,
        turretAttackRange: 0, turretAttackDamage: 0, turretAttackRate: 999
    },
    // === KAMIKAZE AMELIORE ===
    'kamikaze-spawner': {
        health: 30, speed: 3, damage: 80, reward: { iron: 12 },
        splitOnDeath: true, splitCount: 3, splitType: 'runner',
        turretAttackRange: 0, turretAttackDamage: 0, turretAttackRate: 999
    },
    // === AVION TRANSPORT ===
    'transport': {
        health: 150, speed: 0.8, damage: 10, reward: { iron: 30, copper: 10 },
        isFlying: true,
        isTransport: true,
        spawnType: 'grunt',
        spawnInterval: 3, // Spawn every 3 seconds
        spawnCount: 1,
        turretAttackRange: 0, turretAttackDamage: 0, turretAttackRate: 999
    },
    'transport-elite': {
        health: 250, speed: 0.6, damage: 15, reward: { iron: 50, copper: 20, gold: 5 },
        isFlying: true,
        isTransport: true,
        spawnType: 'runner',
        spawnInterval: 2,
        spawnCount: 2,
        turretAttackRange: 0, turretAttackDamage: 0, turretAttackRate: 999
    },
    // === BOSS AERIENS ===
    'flying-boss': {
        health: 1500, speed: 0.5, damage: 80, reward: { iron: 150, copper: 80, gold: 30 },
        isFlying: true,
        isSpawner: true, spawnType: 'flying-swarm', spawnInterval: 3, spawnCount: 3,
        turretAttackRange: 0, turretAttackDamage: 0, turretAttackRate: 999
    },
    'carrier-boss': {
        health: 3000, speed: 0.3, damage: 50, reward: { iron: 200, copper: 100, gold: 50 },
        isFlying: true,
        isTransport: true,
        spawnType: 'flying-bomber', spawnInterval: 2, spawnCount: 2,
        turretAttackRange: 0, turretAttackDamage: 0, turretAttackRate: 999
    },
    'mega-boss': {
        health: 5000, speed: 0.2, damage: 200, reward: { iron: 300, copper: 150, gold: 100 },
        turretAttackRange: 2, turretAttackDamage: 50, turretAttackRate: 1.5,
        isSpawner: true, spawnType: 'tank', spawnInterval: 5, spawnCount: 1
    },
    // === MEGA BOSS - Tier 2 ===
    'titan': {
        health: 15000, speed: 0.15, damage: 300, reward: { iron: 500, copper: 250, gold: 150 },
        turretAttackRange: 2.5, turretAttackDamage: 80, turretAttackRate: 1.5,
        isSpawner: true, spawnType: 'tank', spawnInterval: 3, spawnCount: 2, armor: 0.3
    },
    'leviathan': {
        health: 12000, speed: 0.25, damage: 250, reward: { iron: 450, copper: 200, gold: 120 },
        isFlying: true, isSpawner: true, spawnType: 'flying-bomber', spawnInterval: 2, spawnCount: 4,
        turretAttackRange: 0, turretAttackDamage: 0, turretAttackRate: 999
    },
    'swarm-mother': {
        health: 8000, speed: 0.3, damage: 150, reward: { iron: 400, copper: 180, gold: 100 },
        turretAttackRange: 1.5, turretAttackDamage: 40, turretAttackRate: 1,
        isSpawner: true, spawnType: 'runner', spawnInterval: 1, spawnCount: 5
    },
    'devastator': {
        health: 10000, speed: 0.2, damage: 400, reward: { iron: 450, copper: 220, gold: 130 },
        turretAttackRange: 2, turretAttackDamage: 100, turretAttackRate: 2,
        isSpawner: true, spawnType: 'kamikaze', spawnInterval: 2, spawnCount: 4, armor: 0.4
    },
    // === MEGA BOSS - Tier 3 ===
    'overlord': {
        health: 25000, speed: 0.12, damage: 500, reward: { iron: 800, copper: 400, gold: 250 },
        turretAttackRange: 3, turretAttackDamage: 120, turretAttackRate: 2,
        isSpawner: true, spawnType: 'boss', spawnInterval: 8, spawnCount: 1
    },
    'colossus': {
        health: 30000, speed: 0.1, damage: 600, reward: { iron: 900, copper: 450, gold: 300 },
        turretAttackRange: 3.5, turretAttackDamage: 150, turretAttackRate: 2.5,
        isSpawner: true, spawnType: 'splitter', spawnInterval: 3, spawnCount: 3, armor: 0.5
    },
    'hive-queen': {
        health: 20000, speed: 0.18, damage: 350, reward: { iron: 700, copper: 350, gold: 200 },
        isFlying: true, isSpawner: true, spawnType: 'flying-swarm', spawnInterval: 1, spawnCount: 8,
        turretAttackRange: 0, turretAttackDamage: 0, turretAttackRate: 999
    },
    // === MEGA BOSS - Tier 4 ===
    'juggernaut': {
        health: 40000, speed: 0.08, damage: 800, reward: { iron: 1200, copper: 600, gold: 400 },
        turretAttackRange: 4, turretAttackDamage: 200, turretAttackRate: 2,
        isSpawner: true, spawnType: 'armored-front', spawnInterval: 2, spawnCount: 3, armor: 0.6, frontArmor: 0.8
    },
    'apocalypse': {
        health: 50000, speed: 0.1, damage: 1000, reward: { iron: 1500, copper: 800, gold: 500 },
        turretAttackRange: 4, turretAttackDamage: 250, turretAttackRate: 1.5,
        isSpawner: true, spawnType: 'devastator', spawnInterval: 10, spawnCount: 1, armor: 0.5
    },
    // === MEGA BOSS - Tier 5 (Ultimate) ===
    'world-ender': {
        health: 100000, speed: 0.05, damage: 2000, reward: { iron: 3000, copper: 1500, gold: 1000 },
        turretAttackRange: 5, turretAttackDamage: 500, turretAttackRate: 1,
        isSpawner: true, spawnType: 'overlord', spawnInterval: 15, spawnCount: 1, armor: 0.7
    },
    // === MEGA BOSS - Waves 100-200 (Every 10 waves) ===
    'titan-prime': {
        health: 60000, speed: 0.1, damage: 800, reward: { iron: 2000, copper: 1000, gold: 600 },
        turretAttackRange: 3.5, turretAttackDamage: 200, turretAttackRate: 1.5,
        isSpawner: true, spawnType: 'titan', spawnInterval: 8, spawnCount: 1, armor: 0.5,
        splitOnDeath: true, splitCount: 2, splitType: 'mega-boss', isMegaBoss: true, bossSize: 2
    },
    'void-herald': {
        health: 75000, speed: 0.08, damage: 1000, reward: { iron: 2200, copper: 1100, gold: 700 },
        turretAttackRange: 4, turretAttackDamage: 250, turretAttackRate: 1.5,
        isFlying: true, isSpawner: true, spawnType: 'flying-boss', spawnInterval: 6, spawnCount: 1,
        splitOnDeath: true, splitCount: 2, splitType: 'carrier-boss', isMegaBoss: true, bossSize: 2
    },
    'siege-breaker': {
        health: 90000, speed: 0.12, damage: 1200, reward: { iron: 2500, copper: 1200, gold: 800 },
        turretAttackRange: 5, turretAttackDamage: 300, turretAttackRate: 1,
        isSpawner: true, spawnType: 'devastator', spawnInterval: 5, spawnCount: 1, armor: 0.6, frontArmor: 0.85,
        splitOnDeath: true, splitCount: 3, splitType: 'boss', isMegaBoss: true, bossSize: 2.5
    },
    'swarm-emperor': {
        health: 70000, speed: 0.15, damage: 700, reward: { iron: 2000, copper: 1000, gold: 650 },
        turretAttackRange: 3, turretAttackDamage: 150, turretAttackRate: 1,
        isSpawner: true, spawnType: 'swarm-mother', spawnInterval: 10, spawnCount: 1,
        splitOnDeath: true, splitCount: 3, splitType: 'splitter', isMegaBoss: true, bossSize: 2
    },
    'inferno-lord': {
        health: 100000, speed: 0.1, damage: 1500, reward: { iron: 2800, copper: 1400, gold: 900 },
        turretAttackRange: 4.5, turretAttackDamage: 350, turretAttackRate: 1.2,
        isSpawner: true, spawnType: 'kamikaze', spawnInterval: 1.5, spawnCount: 5, armor: 0.55,
        splitOnDeath: true, splitCount: 2, splitType: 'devastator', isMegaBoss: true, bossSize: 2.5
    },
    'fortress-titan': {
        health: 150000, speed: 0.06, damage: 2000, reward: { iron: 3500, copper: 1800, gold: 1200 },
        turretAttackRange: 5, turretAttackDamage: 400, turretAttackRate: 1,
        isSpawner: true, spawnType: 'armored-front', spawnInterval: 3, spawnCount: 4, armor: 0.7, frontArmor: 0.9,
        splitOnDeath: true, splitCount: 2, splitType: 'juggernaut', isMegaBoss: true, bossSize: 3
    },
    'sky-sovereign': {
        health: 120000, speed: 0.08, damage: 1200, reward: { iron: 3000, copper: 1500, gold: 1000 },
        isFlying: true, isSpawner: true, spawnType: 'leviathan', spawnInterval: 12, spawnCount: 1,
        splitOnDeath: true, splitCount: 3, splitType: 'flying-boss', isMegaBoss: true, bossSize: 3,
        turretAttackRange: 0, turretAttackDamage: 0, turretAttackRate: 999
    },
    'harbinger-of-doom': {
        health: 180000, speed: 0.05, damage: 2500, reward: { iron: 4000, copper: 2000, gold: 1500 },
        turretAttackRange: 5.5, turretAttackDamage: 500, turretAttackRate: 0.8,
        isSpawner: true, spawnType: 'overlord', spawnInterval: 15, spawnCount: 1, armor: 0.65,
        splitOnDeath: true, splitCount: 2, splitType: 'colossus', isMegaBoss: true, bossSize: 3.5
    },
    'oblivion-bringer': {
        health: 200000, speed: 0.04, damage: 3000, reward: { iron: 4500, copper: 2200, gold: 1800 },
        turretAttackRange: 6, turretAttackDamage: 600, turretAttackRate: 0.8,
        isSpawner: true, spawnType: 'apocalypse', spawnInterval: 20, spawnCount: 1, armor: 0.75,
        splitOnDeath: true, splitCount: 2, splitType: 'harbinger-of-doom', isMegaBoss: true, bossSize: 4
    },
    'eternal-nightmare': {
        health: 300000, speed: 0.03, damage: 5000, reward: { iron: 6000, copper: 3000, gold: 2500 },
        turretAttackRange: 7, turretAttackDamage: 800, turretAttackRate: 0.6,
        isSpawner: true, spawnType: 'world-ender', spawnInterval: 25, spawnCount: 1, armor: 0.8,
        splitOnDeath: true, splitCount: 2, splitType: 'harbinger-of-doom', isMegaBoss: true, bossSize: 5
    },
    // === MEGA BOSS - Waves 210-300 (Tier 6) ===
    'dimensional-rift': {
        health: 400000, speed: 0.04, damage: 6000, reward: { iron: 8000, copper: 4000, gold: 3000 },
        turretAttackRange: 7, turretAttackDamage: 900, turretAttackRate: 0.5,
        isSpawner: true, spawnType: 'eternal-nightmare', spawnInterval: 30, spawnCount: 1, armor: 0.82,
        splitOnDeath: true, splitCount: 2, splitType: 'oblivion-bringer', isMegaBoss: true, bossSize: 5.5
    },
    'chaos-incarnate': {
        health: 500000, speed: 0.035, damage: 7000, reward: { iron: 9000, copper: 4500, gold: 3500 },
        turretAttackRange: 8, turretAttackDamage: 1000, turretAttackRate: 0.5,
        isSpawner: true, spawnType: 'harbinger-of-doom', spawnInterval: 12, spawnCount: 2, armor: 0.83,
        splitOnDeath: true, splitCount: 3, splitType: 'fortress-titan', isMegaBoss: true, bossSize: 6
    },
    'storm-bringer': {
        health: 450000, speed: 0.05, damage: 6500, reward: { iron: 8500, copper: 4200, gold: 3200 },
        isFlying: true, isSpawner: true, spawnType: 'sky-sovereign', spawnInterval: 15, spawnCount: 2,
        splitOnDeath: true, splitCount: 3, splitType: 'leviathan', isMegaBoss: true, bossSize: 5.5,
        turretAttackRange: 0, turretAttackDamage: 0, turretAttackRate: 999
    },
    'plague-father': {
        health: 550000, speed: 0.03, damage: 5500, reward: { iron: 9500, copper: 4800, gold: 3800 },
        turretAttackRange: 6, turretAttackDamage: 700, turretAttackRate: 0.8,
        isSpawner: true, spawnType: 'swarm-emperor', spawnInterval: 8, spawnCount: 2, armor: 0.75,
        splitOnDeath: true, splitCount: 4, splitType: 'swarm-mother', isMegaBoss: true, bossSize: 6
    },
    'void-tyrant': {
        health: 600000, speed: 0.028, damage: 8000, reward: { iron: 10000, copper: 5000, gold: 4000 },
        turretAttackRange: 8, turretAttackDamage: 1100, turretAttackRate: 0.5,
        isSpawner: true, spawnType: 'oblivion-bringer', spawnInterval: 20, spawnCount: 1, armor: 0.85,
        splitOnDeath: true, splitCount: 2, splitType: 'eternal-nightmare', isMegaBoss: true, bossSize: 6.5
    },
    // === MEGA BOSS - Waves 300-400 (Tier 7 - Godlike) ===
    'primordial-terror': {
        health: 800000, speed: 0.025, damage: 10000, reward: { iron: 12000, copper: 6000, gold: 5000 },
        turretAttackRange: 9, turretAttackDamage: 1300, turretAttackRate: 0.4,
        isSpawner: true, spawnType: 'void-tyrant', spawnInterval: 25, spawnCount: 1, armor: 0.87,
        splitOnDeath: true, splitCount: 2, splitType: 'chaos-incarnate', isMegaBoss: true, bossSize: 7
    },
    'elder-god': {
        health: 1000000, speed: 0.022, damage: 12000, reward: { iron: 15000, copper: 7500, gold: 6000 },
        turretAttackRange: 10, turretAttackDamage: 1500, turretAttackRate: 0.4,
        isSpawner: true, spawnType: 'eternal-nightmare', spawnInterval: 15, spawnCount: 2, armor: 0.88,
        splitOnDeath: true, splitCount: 3, splitType: 'void-tyrant', isMegaBoss: true, bossSize: 7.5
    },
    'cosmic-horror': {
        health: 900000, speed: 0.03, damage: 11000, reward: { iron: 13000, copper: 6500, gold: 5500 },
        isFlying: true, isSpawner: true, spawnType: 'storm-bringer', spawnInterval: 12, spawnCount: 2,
        splitOnDeath: true, splitCount: 2, splitType: 'sky-sovereign', isMegaBoss: true, bossSize: 7,
        turretAttackRange: 0, turretAttackDamage: 0, turretAttackRate: 999
    },
    'death-incarnate': {
        health: 1200000, speed: 0.02, damage: 15000, reward: { iron: 18000, copper: 9000, gold: 7500 },
        turretAttackRange: 10, turretAttackDamage: 2000, turretAttackRate: 0.3,
        isSpawner: true, spawnType: 'inferno-lord', spawnInterval: 5, spawnCount: 3, armor: 0.89,
        splitOnDeath: true, splitCount: 2, splitType: 'primordial-terror', isMegaBoss: true, bossSize: 8
    },
    'the-consumer': {
        health: 1500000, speed: 0.018, damage: 18000, reward: { iron: 20000, copper: 10000, gold: 8000 },
        turretAttackRange: 11, turretAttackDamage: 2500, turretAttackRate: 0.3,
        isSpawner: true, spawnType: 'elder-god', spawnInterval: 30, spawnCount: 1, armor: 0.9,
        splitOnDeath: true, splitCount: 2, splitType: 'death-incarnate', isMegaBoss: true, bossSize: 8.5
    },
    // === MEGA BOSS - Waves 400-500 (Tier 8 - Ultimate Cosmic) ===
    'reality-shatterer': {
        health: 2000000, speed: 0.015, damage: 22000, reward: { iron: 25000, copper: 12500, gold: 10000 },
        turretAttackRange: 12, turretAttackDamage: 3000, turretAttackRate: 0.25,
        isSpawner: true, spawnType: 'the-consumer', spawnInterval: 35, spawnCount: 1, armor: 0.91,
        splitOnDeath: true, splitCount: 2, splitType: 'elder-god', isMegaBoss: true, bossSize: 9
    },
    'universe-devourer': {
        health: 2500000, speed: 0.012, damage: 25000, reward: { iron: 30000, copper: 15000, gold: 12000 },
        turretAttackRange: 12, turretAttackDamage: 3500, turretAttackRate: 0.25,
        isSpawner: true, spawnType: 'primordial-terror', spawnInterval: 15, spawnCount: 2, armor: 0.92,
        splitOnDeath: true, splitCount: 3, splitType: 'the-consumer', isMegaBoss: true, bossSize: 9.5
    },
    'void-emperor': {
        health: 3000000, speed: 0.01, damage: 30000, reward: { iron: 35000, copper: 17500, gold: 15000 },
        turretAttackRange: 13, turretAttackDamage: 4000, turretAttackRate: 0.2,
        isSpawner: true, spawnType: 'death-incarnate', spawnInterval: 12, spawnCount: 2, armor: 0.93,
        splitOnDeath: true, splitCount: 2, splitType: 'universe-devourer', isMegaBoss: true, bossSize: 10
    },
    'omega-beast': {
        health: 4000000, speed: 0.008, damage: 40000, reward: { iron: 45000, copper: 22500, gold: 20000 },
        turretAttackRange: 14, turretAttackDamage: 5000, turretAttackRate: 0.2,
        isSpawner: true, spawnType: 'reality-shatterer', spawnInterval: 20, spawnCount: 2, armor: 0.94,
        splitOnDeath: true, splitCount: 3, splitType: 'void-emperor', isMegaBoss: true, bossSize: 11
    },
    'genesis-destroyer': {
        health: 5000000, speed: 0.006, damage: 50000, reward: { iron: 60000, copper: 30000, gold: 25000 },
        turretAttackRange: 15, turretAttackDamage: 6000, turretAttackRate: 0.15,
        isSpawner: true, spawnType: 'universe-devourer', spawnInterval: 15, spawnCount: 2, armor: 0.95,
        splitOnDeath: true, splitCount: 2, splitType: 'omega-beast', isMegaBoss: true, bossSize: 12
    },
    // === FINAL BOSS - Wave 500 ===
    'the-absolute': {
        health: 10000000, speed: 0.005, damage: 100000, reward: { iron: 100000, copper: 50000, gold: 50000 },
        turretAttackRange: 20, turretAttackDamage: 10000, turretAttackRate: 0.1,
        isSpawner: true, spawnType: 'genesis-destroyer', spawnInterval: 20, spawnCount: 2, armor: 0.96,
        splitOnDeath: true, splitCount: 3, splitType: 'omega-beast', isMegaBoss: true, bossSize: 15
    }
};

class GameState {
    constructor(gameMode = 'waves') {
        this.cellSize = 32;
        this.cols = 150;  // 3x larger map
        this.rows = 114;  // 3x larger map
        this.gameMode = gameMode; // 'waves' or 'endless'

        this.resources = { iron: 500, copper: 0, coal: 0, gold: 0 };
        this.nexusHealth = 1000;
        this.nexusMaxHealth = 1000;
        this.waveNumber = 0;
        this.totalKills = 0;
        this.totalScore = 0;

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

        // Game speed multiplier (1, 2, 5, 10)
        this.gameSpeed = 1;

        // Track if grid/paths need to be sent (reduces bandwidth)
        this.gridDirty = true;
        this.syncCounter = 0;

        // 4 main paths from edges to nexus (N, E, S, W)
        this.mainPaths = {
            north: [],
            east: [],
            south: [],
            west: []
        };
        this.mainSpawnPoints = {
            north: null,
            east: null,
            south: null,
            west: null
        };
    }

    // Calculate the 4 main paths from edge centers to nexus
    calculateMainPaths() {
        const centerX = Math.floor(this.cols / 2);
        const centerY = Math.floor(this.rows / 2);

        // Define spawn points at center of each edge
        this.mainSpawnPoints = {
            north: { x: centerX, y: 0 },
            south: { x: centerX, y: this.rows - 1 },
            west: { x: 0, y: centerY },
            east: { x: this.cols - 1, y: centerY }
        };

        // Calculate paths from each spawn point to nexus
        for (const [direction, spawn] of Object.entries(this.mainSpawnPoints)) {
            const path = this.findPath(spawn.x, spawn.y, this.nexusX, this.nexusY);
            this.mainPaths[direction] = path || [];
        }

        console.log(`[Pathfinding] Main paths calculated: N=${this.mainPaths.north.length}, E=${this.mainPaths.east.length}, S=${this.mainPaths.south.length}, W=${this.mainPaths.west.length}`);
    }

    // Find the nearest main path for an enemy position
    findNearestMainPath(x, y) {
        let bestPath = null;
        let bestDistance = Infinity;
        let bestStartIndex = 0;

        for (const [direction, path] of Object.entries(this.mainPaths)) {
            if (!path || path.length === 0) continue;

            // Find the closest point on this path
            for (let i = 0; i < path.length; i++) {
                const point = path[i];
                const dist = Math.abs(point.x - x) + Math.abs(point.y - y); // Manhattan distance

                if (dist < bestDistance) {
                    bestDistance = dist;
                    bestPath = path;
                    bestStartIndex = i;
                }
            }
        }

        // Return a copy of the path starting from the nearest point
        if (bestPath && bestStartIndex < bestPath.length) {
            return bestPath.slice(bestStartIndex).map(p => ({ x: p.x, y: p.y }));
        }

        return null;
    }

    setGameSpeed(speed) {
        const validSpeeds = [1, 2, 5, 10];
        if (validSpeeds.includes(speed)) {
            this.gameSpeed = speed;
            return true;
        }
        return false;
    }

    init() {
        // Initialize grid
        for (let y = 0; y < this.rows; y++) {
            this.grid[y] = [];
            this.resourceMap[y] = [];
            for (let x = 0; x < this.cols; x++) {
                // Mark borders as non-buildable (cell value 4)
                if (x === 0 || x === this.cols - 1 || y === 0 || y === this.rows - 1) {
                    this.grid[y][x] = 4; // Border - walkable but not buildable
                } else {
                    this.grid[y][x] = 0;
                }
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

        // Calculate the 4 main paths
        this.calculateMainPaths();

        // Start first wave timer
        this.waveTimer = 30;
    }

    generateResources() {
        const types = ['iron', 'copper', 'coal', 'gold'];
        // 3x more resources for 3x larger map
        const counts = { iron: 75, copper: 54, coal: 36, gold: 24 };

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
            // Apply game speed multiplier
            const adjustedDelta = deltaTime * this.gameSpeed;

            // NOTE: pendingEffects is NOT cleared here - it accumulates between syncs
            // It gets cleared in serializeForSync() after being sent to clients

            // Wave/Endless management based on game mode
            if (this.gameMode === 'endless') {
                this.updateEndless(adjustedDelta);
            } else {
                this.updateWaves(adjustedDelta);
            }
            // Debug: log game mode periodically (every 60 seconds real time)
            if (!this._lastModeLog || Date.now() - this._lastModeLog > 60000) {
                console.log(`[GameState] Mode: ${this.gameMode}, Difficulty: ${this.endlessDifficulty?.toFixed(2) || 'N/A'}, Wave: ${this.waveNumber}`);
                this._lastModeLog = Date.now();
            }

            // Update extractors
            for (const extractor of this.extractors) {
                if (!extractor) continue;
                extractor.timer = (extractor.timer || 0) + adjustedDelta;
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
                this.updateEnemy(enemy, adjustedDelta);
            }

            // Remove dead enemies and handle splitters
            const enemiesToSpawn = [];
            // Boss types for special death effect
            const bossTypes = ['boss', 'flying-boss', 'carrier-boss', 'mega-boss',
                               'titan', 'leviathan', 'swarm-mother', 'devastator',
                               'overlord', 'colossus', 'hive-queen', 'juggernaut',
                               'apocalypse', 'world-ender',
                               // Wave 100-200 mega bosses
                               'titan-prime', 'void-herald', 'siege-breaker', 'swarm-emperor',
                               'inferno-lord', 'fortress-titan', 'sky-sovereign',
                               'harbinger-of-doom', 'oblivion-bringer', 'eternal-nightmare',
                               // Wave 210-300 mega bosses (Tier 6)
                               'dimensional-rift', 'chaos-incarnate', 'storm-bringer',
                               'plague-father', 'void-tyrant',
                               // Wave 300-400 mega bosses (Tier 7)
                               'primordial-terror', 'elder-god', 'cosmic-horror',
                               'death-incarnate', 'the-consumer',
                               // Wave 400-500 mega bosses (Tier 8)
                               'reality-shatterer', 'universe-devourer', 'void-emperor',
                               'omega-beast', 'genesis-destroyer', 'the-absolute'];

            this.enemies = this.enemies.filter(e => {
                if (!e) return false;
                if (e.dead) {
                    const enemyType = ENEMY_TYPES[e.type];

                    // Check if it's a boss - add epic death effect
                    if (bossTypes.includes(e.type) && !e.reachedNexus) {
                        this.pendingEffects.push({
                            type: 'boss-death',
                            x: e.x,
                            y: e.y,
                            size: enemyType?.bossSize || enemyType?.size || 1.5,
                            color: enemyType?.color || '#880088',
                            isMegaBoss: enemyType?.isMegaBoss || false
                        });
                    } else {
                        // Normal death effect
                        this.pendingEffects.push({
                            type: 'death',
                            x: e.x,
                            y: e.y,
                            enemyType: e.type,
                            color: enemyType?.color || '#ff4444'
                        });
                    }

                    if (!e.reachedNexus) {
                        // Increment kill counter and score (based on enemy max health)
                        this.totalKills++;
                        this.totalScore += e.maxHealth || 100;

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
                if (!turret) continue;
                turret.speedBoosted = false;
                turret.damageBoosted = false;
                turret.rangeBoosted = false;
                turret.speedBoostAmount = 0;
                turret.damageBoostAmount = 0;
                turret.rangeBoostAmount = 0;
            }

            // Update booster turrets FIRST so they can set boost flags
            for (const turret of this.turrets) {
                if (!turret || !turret.config) continue;
                if (turret.config.isSpeedBooster || turret.config.isDamageBooster || turret.config.isRangeBooster) {
                    try {
                        this.updateTurret(turret, adjustedDelta);
                    } catch (err) {
                        console.error('Error updating booster turret:', err);
                    }
                }
            }

            // Update all other turrets
            for (const turret of this.turrets) {
                if (!turret || !turret.config) continue;
                if (!turret.config.isSpeedBooster && !turret.config.isDamageBooster && !turret.config.isRangeBooster) {
                    try {
                        this.updateTurret(turret, adjustedDelta);
                    } catch (err) {
                        console.error('Error updating turret:', err);
                    }
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
            this.updateProjectiles(adjustedDelta);

            // Progressive path recalculation (spreads work over multiple frames)
            this.progressivePathRecalc(5);
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
                this.endlessDifficulty = 1;
                console.log('Endless mode started');
            }

            this.endlessTimer += deltaTime;
            this.difficultyTimer += deltaTime;

            // Increase wave every 30 seconds, difficulty = wave number
            if (this.difficultyTimer >= 30) {
                this.difficultyTimer = 0;
                this.waveNumber++;
                this.endlessDifficulty = this.waveNumber; // Difficulty matches wave number
                this.endlessSpawnRate = Math.max(0.3, 2 - this.waveNumber * 0.02); // Faster spawn over time
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
            // === MEGA BOSS Wave 100-200 Types ===
            if (wave >= 100 && Math.random() < 0.004 + bossSpawnBonus) types.push('titan-prime');
            if (wave >= 110 && Math.random() < 0.004 + bossSpawnBonus) types.push('void-herald');
            if (wave >= 120 && Math.random() < 0.003 + bossSpawnBonus) types.push('siege-breaker');
            if (wave >= 130 && Math.random() < 0.003 + bossSpawnBonus) types.push('swarm-emperor');
            if (wave >= 140 && Math.random() < 0.003 + bossSpawnBonus) types.push('inferno-lord');
            if (wave >= 150 && Math.random() < 0.002 + bossSpawnBonus) types.push('fortress-titan');
            if (wave >= 160 && Math.random() < 0.002 + bossSpawnBonus) types.push('sky-sovereign');
            if (wave >= 170 && Math.random() < 0.002 + bossSpawnBonus) types.push('harbinger-of-doom');
            if (wave >= 180 && Math.random() < 0.001 + bossSpawnBonus) types.push('oblivion-bringer');
            if (wave >= 200 && Math.random() < 0.0005 + bossSpawnBonus) types.push('eternal-nightmare');
            // === MEGA BOSS Tier 6 (Waves 210-300 - Dimensional) ===
            if (wave >= 210 && Math.random() < 0.001 + bossSpawnBonus) types.push('dimensional-rift');
            if (wave >= 220 && Math.random() < 0.001 + bossSpawnBonus) types.push('chaos-incarnate');
            if (wave >= 240 && Math.random() < 0.0008 + bossSpawnBonus) types.push('storm-bringer');
            if (wave >= 260 && Math.random() < 0.0008 + bossSpawnBonus) types.push('plague-father');
            if (wave >= 280 && Math.random() < 0.0006 + bossSpawnBonus) types.push('void-tyrant');
            // === MEGA BOSS Tier 7 (Waves 300-400 - Elder) ===
            if (wave >= 300 && Math.random() < 0.0005 + bossSpawnBonus) types.push('primordial-terror');
            if (wave >= 320 && Math.random() < 0.0004 + bossSpawnBonus) types.push('elder-god');
            if (wave >= 340 && Math.random() < 0.0004 + bossSpawnBonus) types.push('cosmic-horror');
            if (wave >= 360 && Math.random() < 0.0003 + bossSpawnBonus) types.push('death-incarnate');
            if (wave >= 380 && Math.random() < 0.0003 + bossSpawnBonus) types.push('the-consumer');
            // === MEGA BOSS Tier 8 (Waves 400-500 - Ultimate Cosmic) ===
            if (wave >= 400 && Math.random() < 0.0002 + bossSpawnBonus) types.push('reality-shatterer');
            if (wave >= 420 && Math.random() < 0.0002 + bossSpawnBonus) types.push('universe-devourer');
            if (wave >= 440 && Math.random() < 0.00015 + bossSpawnBonus) types.push('void-emperor');
            if (wave >= 460 && Math.random() < 0.00015 + bossSpawnBonus) types.push('omega-beast');
            if (wave >= 480 && Math.random() < 0.0001 + bossSpawnBonus) types.push('genesis-destroyer');
            // === THE FINAL BOSS (Wave 500+) ===
            if (wave >= 500 && Math.random() < 0.00005 + bossSpawnBonus) types.push('the-absolute');

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

            // Scaling: +5% HP per wave, logarithmic for speed/damage
            const healthMult = 1 + this.endlessDifficulty * 0.05; // +5% per wave (wave 132 = 7.6x)
            const speedMult = Math.min(5, 1 + Math.log10(this.endlessDifficulty) * 1.5); // Max 5x speed
            const damageMult = Math.min(10, 1 + Math.log10(this.endlessDifficulty) * 3); // Max 10x damage
            const attackRangeMult = Math.min(3, 1 + Math.log10(this.endlessDifficulty) * 0.8); // Max 3x range

            const enemy = {
                id: Date.now() + Math.random(),
                type: type,
                x: x * this.cellSize + this.cellSize / 2,
                y: y * this.cellSize + this.cellSize / 2,
                gridX: x,
                gridY: y,
                health: config.health * healthMult,
                maxHealth: config.health * healthMult,
                speed: config.speed * speedMult,
                damage: config.damage * damageMult,
                turretAttackRange: (config.turretAttackRange || 0) * attackRangeMult,
                turretAttackDamage: (config.turretAttackDamage || 0) * damageMult,
                path: [],
                pathIndex: 0,
                dead: false,
                reachedNexus: false,
                burning: false,
                burnTime: 0,
                burnDamage: 0,
                spawnTimer: 0 // For transport/spawner units
            };

            // Use main paths - find nearest path point
            const path = this.findNearestMainPath(x, y);
            if (path && path.length > 0) {
                enemy.path = path;
            } else {
                // No path found - mark enemy to go through walls
                enemy.ignoreWalls = true;
            }
            this.enemies.push(enemy);
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

        // Flying swarm - from wave 9
        if (this.waveNumber >= 9) {
            const count = Math.floor(this.waveNumber / 9) * 2;
            for (let i = 0; i < count; i++) {
                this.enemiesToSpawn.push({ type: 'flying-swarm', delay: 3 + i * 0.5 });
            }
        }

        // Kamikaze spawner - from wave 10
        if (this.waveNumber >= 10) {
            const count = Math.floor(this.waveNumber / 10);
            for (let i = 0; i < count; i++) {
                this.enemiesToSpawn.push({ type: 'kamikaze-spawner', delay: 5 + i * 3 });
            }
        }

        // Flying bomber - from wave 12
        if (this.waveNumber >= 12) {
            const count = Math.floor(this.waveNumber / 12);
            for (let i = 0; i < count; i++) {
                this.enemiesToSpawn.push({ type: 'flying-bomber', delay: 6 + i * 2.5 });
            }
        }

        // Transport - from wave 15
        if (this.waveNumber >= 15) {
            const count = Math.floor(this.waveNumber / 15);
            for (let i = 0; i < count; i++) {
                this.enemiesToSpawn.push({ type: 'transport', delay: 8 + i * 5 });
            }
        }

        // Transport elite - from wave 20
        if (this.waveNumber >= 20) {
            const count = Math.floor(this.waveNumber / 20);
            for (let i = 0; i < count; i++) {
                this.enemiesToSpawn.push({ type: 'transport-elite', delay: 10 + i * 6 });
            }
        }

        // Boss every 10 waves
        if (this.waveNumber % 10 === 0) {
            this.enemiesToSpawn.push({ type: 'boss', delay: 10 });
        }

        // Flying boss every 15 waves (starting wave 15)
        if (this.waveNumber >= 15 && this.waveNumber % 15 === 0) {
            this.enemiesToSpawn.push({ type: 'flying-boss', delay: 12 });
        }

        // Carrier boss every 25 waves (starting wave 25)
        if (this.waveNumber >= 25 && this.waveNumber % 25 === 0) {
            this.enemiesToSpawn.push({ type: 'carrier-boss', delay: 15 });
        }

        // Mega boss every 50 waves (starting wave 50)
        if (this.waveNumber >= 50 && this.waveNumber % 50 === 0) {
            this.enemiesToSpawn.push({ type: 'mega-boss', delay: 20 });
        }

        // === MEGA BOSSES FOR WAVES 100-200 (Every 10 waves) ===
        // These are epic bosses that spawn previous bosses when killed
        if (this.waveNumber === 100) {
            this.enemiesToSpawn.push({ type: 'titan-prime', delay: 25 });
        }
        if (this.waveNumber === 110) {
            this.enemiesToSpawn.push({ type: 'void-herald', delay: 25 });
        }
        if (this.waveNumber === 120) {
            this.enemiesToSpawn.push({ type: 'siege-breaker', delay: 25 });
        }
        if (this.waveNumber === 130) {
            this.enemiesToSpawn.push({ type: 'swarm-emperor', delay: 25 });
        }
        if (this.waveNumber === 140) {
            this.enemiesToSpawn.push({ type: 'inferno-lord', delay: 25 });
        }
        if (this.waveNumber === 150) {
            this.enemiesToSpawn.push({ type: 'fortress-titan', delay: 30 });
        }
        if (this.waveNumber === 160) {
            this.enemiesToSpawn.push({ type: 'sky-sovereign', delay: 30 });
        }
        if (this.waveNumber === 170) {
            this.enemiesToSpawn.push({ type: 'harbinger-of-doom', delay: 30 });
        }
        if (this.waveNumber === 180) {
            this.enemiesToSpawn.push({ type: 'oblivion-bringer', delay: 35 });
        }
        if (this.waveNumber === 190) {
            // Two mega-bosses at wave 190!
            this.enemiesToSpawn.push({ type: 'harbinger-of-doom', delay: 30 });
            this.enemiesToSpawn.push({ type: 'oblivion-bringer', delay: 40 });
        }
        if (this.waveNumber === 200) {
            // THE ULTIMATE BOSS
            this.enemiesToSpawn.push({ type: 'eternal-nightmare', delay: 35 });
        }

        // === MEGA BOSSES - Waves 210-300 (Tier 6 - Dimensional) ===
        if (this.waveNumber === 210) {
            this.enemiesToSpawn.push({ type: 'dimensional-rift', delay: 35 });
        }
        if (this.waveNumber === 220) {
            this.enemiesToSpawn.push({ type: 'chaos-incarnate', delay: 35 });
        }
        if (this.waveNumber === 240) {
            this.enemiesToSpawn.push({ type: 'storm-bringer', delay: 35 });
        }
        if (this.waveNumber === 260) {
            this.enemiesToSpawn.push({ type: 'plague-father', delay: 35 });
        }
        if (this.waveNumber === 280) {
            this.enemiesToSpawn.push({ type: 'void-tyrant', delay: 35 });
        }
        if (this.waveNumber === 300) {
            // Major milestone boss + escort
            this.enemiesToSpawn.push({ type: 'primordial-terror', delay: 30 });
            this.enemiesToSpawn.push({ type: 'void-tyrant', delay: 45 });
        }

        // === MEGA BOSSES - Waves 300-400 (Tier 7 - Elder) ===
        if (this.waveNumber === 320) {
            this.enemiesToSpawn.push({ type: 'elder-god', delay: 35 });
        }
        if (this.waveNumber === 340) {
            this.enemiesToSpawn.push({ type: 'cosmic-horror', delay: 35 });
        }
        if (this.waveNumber === 360) {
            this.enemiesToSpawn.push({ type: 'death-incarnate', delay: 35 });
        }
        if (this.waveNumber === 380) {
            this.enemiesToSpawn.push({ type: 'the-consumer', delay: 35 });
        }
        if (this.waveNumber === 400) {
            // Major milestone - dual bosses
            this.enemiesToSpawn.push({ type: 'reality-shatterer', delay: 30 });
            this.enemiesToSpawn.push({ type: 'the-consumer', delay: 50 });
        }

        // === MEGA BOSSES - Waves 400-500 (Tier 8 - Ultimate) ===
        if (this.waveNumber === 420) {
            this.enemiesToSpawn.push({ type: 'universe-devourer', delay: 35 });
        }
        if (this.waveNumber === 440) {
            this.enemiesToSpawn.push({ type: 'void-emperor', delay: 35 });
        }
        if (this.waveNumber === 460) {
            this.enemiesToSpawn.push({ type: 'omega-beast', delay: 35 });
        }
        if (this.waveNumber === 480) {
            this.enemiesToSpawn.push({ type: 'genesis-destroyer', delay: 35 });
        }
        if (this.waveNumber === 500) {
            // THE ABSOLUTE - FINAL BOSS
            this.enemiesToSpawn.push({ type: 'the-absolute', delay: 40 });
            // Escort of previous tier bosses
            this.enemiesToSpawn.push({ type: 'reality-shatterer', delay: 60 });
            this.enemiesToSpawn.push({ type: 'universe-devourer', delay: 80 });
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

            // Scaling: HP increases 10% per wave, speed 3%, damage 5%, attack range 3%
            const healthMult = 1 + (this.waveNumber - 1) * 0.1;
            const speedMult = 1 + (this.waveNumber - 1) * 0.03;
            const damageMult = 1 + (this.waveNumber - 1) * 0.05;
            const attackRangeMult = 1 + (this.waveNumber - 1) * 0.03;

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
                damage: config.damage * damageMult,
                turretAttackRange: (config.turretAttackRange || 0) * attackRangeMult,
                turretAttackDamage: (config.turretAttackDamage || 0) * damageMult,
                path: [],
                pathIndex: 0,
                dead: false,
                reachedNexus: false,
                burning: false,
                burnTime: 0,
                burnDamage: 0,
                spawnTimer: 0
            };

            // Use main paths - find nearest path point
            const path = this.findNearestMainPath(x, y);
            if (path && path.length > 0) {
                enemy.path = path;
            } else {
                // No path found - mark enemy to go through walls
                enemy.ignoreWalls = true;
            }
            this.enemies.push(enemy);
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

            // Use main paths
            const path = this.findNearestMainPath(x, y);
            if (path && path.length > 0) {
                enemy.path = path;
            }
            this.enemies.push(enemy);
        } catch (error) {
            console.error('Error spawning splitter child:', error);
        }
    }

    spawnTransportUnit(transport, transportType) {
        try {
            const spawnType = transportType.spawnType || 'grunt';
            const spawnCount = transportType.spawnCount || 1;
            const config = ENEMY_TYPES[spawnType];
            if (!config) return;

            // Get ground position below the transport
            const gridX = Math.floor(transport.x / this.cellSize);
            const gridY = Math.floor(transport.y / this.cellSize);

            for (let i = 0; i < spawnCount; i++) {
                const enemy = {
                    id: Date.now() + Math.random() + i,
                    type: spawnType,
                    x: transport.x + (Math.random() - 0.5) * 30,
                    y: transport.y + (Math.random() - 0.5) * 30,
                    gridX: gridX,
                    gridY: gridY,
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

                // Use main paths
                const path = this.findNearestMainPath(gridX, gridY);
                if (path && path.length > 0) {
                    enemy.path = path;
                }
                this.enemies.push(enemy);
            }

            // Add visual effect for spawn
            this.pendingEffects.push({
                type: 'spawn',
                x: transport.x,
                y: transport.y,
                color: '#88ff88'
            });
        } catch (error) {
            console.error('Error spawning transport unit:', error);
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

        // Transport planes and spawner enemies spawn units while moving
        if (enemyType && (enemyType.isTransport || enemyType.isSpawner)) {
            if (enemy.spawnTimer === undefined) enemy.spawnTimer = 0;
            enemy.spawnTimer += deltaTime;

            if (enemy.spawnTimer >= (enemyType.spawnInterval || 3)) {
                enemy.spawnTimer = 0;
                // Spawn units at current position
                this.spawnTransportUnit(enemy, enemyType);
            }
        }

        // Movement - Flying enemies or enemies with no path go directly to nexus
        const nexusWorldX = this.nexusX * this.cellSize + this.cellSize / 2;
        const nexusWorldY = this.nexusY * this.cellSize + this.cellSize / 2;

        if ((enemyType && enemyType.isFlying) || enemy.ignoreWalls) {
            // Flying or ignoreWalls: direct path to nexus (through walls if needed)
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

        // Attack turrets while passing (use scaled range from enemy or base from config)
        const attackRange = enemy.turretAttackRange || (enemyType?.turretAttackRange || 0);
        if (attackRange > 0 && enemy.turretAttackCooldown <= 0) {
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
        // Use enemy's scaled values if available, otherwise use base config
        const attackRange = (enemy.turretAttackRange || enemyType.turretAttackRange || 1) * this.cellSize;
        const attackDamage = enemy.turretAttackDamage || enemyType.turretAttackDamage || 5;
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

        // Apply range boost from nearby range boosters
        const rangeMult = 1 + (turret.rangeBoostAmount || 0);
        const range = (turret.config.range || 4) * this.cellSize * rangeMult;
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
                if (other.config?.isSpeedBooster || other.config?.isDamageBooster || other.config?.isRangeBooster || other.config?.isHealer) continue;

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
                if (other.config?.isSpeedBooster || other.config?.isDamageBooster || other.config?.isRangeBooster || other.config?.isHealer) continue;

                const dist = Math.sqrt((turret.x - other.x) ** 2 + (turret.y - other.y) ** 2);
                if (dist <= boostRange) {
                    // Mark as damage boosted
                    other.damageBoosted = true;
                    other.damageBoostAmount = Math.max(other.damageBoostAmount || 0, boostAmount);
                }
            }
            return;
        }

        // Range Booster - boosts nearby turrets' range
        if (turret.config.isRangeBooster) {
            const boostRange = (turret.config.range || 4) * this.cellSize;
            const boostAmount = turret.config.rangeBoost || 0.25;

            for (const other of this.turrets) {
                if (other === turret) continue;
                if (other.config?.isSpeedBooster || other.config?.isDamageBooster || other.config?.isRangeBooster || other.config?.isHealer) continue;

                const dist = Math.sqrt((turret.x - other.x) ** 2 + (turret.y - other.y) ** 2);
                if (dist <= boostRange) {
                    // Mark as range boosted
                    other.rangeBoosted = true;
                    other.rangeBoostAmount = Math.max(other.rangeBoostAmount || 0, boostAmount);
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
        const range = (turret.config.range || 5) * this.cellSize;

        // Shotgun - multiple pellets with blast effect
        if (turret.config.pelletCount) {
            const pellets = turret.config.pelletCount || 6;
            const spread = turret.config.spreadAngle || 0.5;
            const baseAngle = turret.angle;
            const speed = (turret.config.projectileSpeed || 12) * this.cellSize;

            // Shotgun blast muzzle flash
            this.pendingEffects.push({
                type: 'shotgun-blast',
                x: turret.x + Math.cos(baseAngle) * this.cellSize * 0.3,
                y: turret.y + Math.sin(baseAngle) * this.cellSize * 0.3,
                angle: baseAngle,
                spread: spread,
                color: turret.config.projectileColor || '#ffcc00'
            });

            for (let i = 0; i < pellets; i++) {
                const pelletAngle = baseAngle + (i - (pellets - 1) / 2) * (spread / (pellets - 1));

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
                    hitEnemies: [],
                    color: turret.config.projectileColor
                });
            }
            return;
        }

        // Multi-Artillery - multiple shells with smoke effect
        if (turret.config.shellCount) {
            const shells = turret.config.shellCount || 3;
            const spread = (turret.config.shellSpread || 1.5) * this.cellSize;
            const speed = (turret.config.projectileSpeed || 7) * this.cellSize;

            // Artillery cannon fire effect
            this.pendingEffects.push({
                type: 'cannon-fire',
                x: turret.x + Math.cos(turret.angle) * this.cellSize * 0.4,
                y: turret.y + Math.sin(turret.angle) * this.cellSize * 0.4,
                angle: turret.angle,
                color: '#ff6600'
            });

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
                        vx: (dx / dist) * speed,
                        vy: (dy / dist) * speed,
                        damage: damage,
                        aoeRadius: turret.config.aoeRadius || 1.5,
                        penetration: false,
                        hitEnemies: [],
                        color: turret.config.projectileColor
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

            // Laser pulse effect at turret
            this.pendingEffects.push({
                type: 'laser-pulse',
                x: turret.x,
                y: turret.y,
                color: '#2ecc71'
            });

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
            // Tesla chain with electric spark effect
            let current = target;
            const hitTargets = [];
            const chainRange = (turret.config.chainRange || 2) * this.cellSize;
            let prevX = turret.x;
            let prevY = turret.y;

            // Electric spark at turret
            this.pendingEffects.push({
                type: 'electric-spark',
                x: turret.x,
                y: turret.y,
                color: '#00d4ff'
            });

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
            // Flamethrower with enhanced flames
            target.health -= damage * 0.1;
            target.burning = true;
            target.burnDamage = turret.config.dotDamage || 5;
            target.burnTime = turret.config.dotDuration || 2;

            const spread = turret.config.flameSpread || 0.35;
            const speed = (turret.config.projectileSpeed || 6) * this.cellSize;

            // Create more flame particles for better visual
            for (let i = 0; i < 5; i++) {
                const angle = turret.angle + (Math.random() - 0.5) * spread;
                const particleSpeed = speed * (0.8 + Math.random() * 0.4);

                this.projectiles.push({
                    id: Date.now() + Math.random() + i,
                    type: 'flame',
                    x: turret.x + Math.cos(turret.angle) * this.cellSize * 0.3,
                    y: turret.y + Math.sin(turret.angle) * this.cellSize * 0.3,
                    startX: turret.x,
                    startY: turret.y,
                    vx: Math.cos(angle) * particleSpeed,
                    vy: Math.sin(angle) * particleSpeed,
                    damage: 0,
                    life: 0.4 + Math.random() * 0.2,
                    size: 8 + Math.random() * 8
                });
            }
        } else if (turret.config.isMissile || turret.config.isMissileBattery || turret.config.isRocketArray) {
            // GUIDED MISSILES
            const missileCount = turret.config.missileCount || turret.config.rocketCount || 2;
            const speed = (turret.config.projectileSpeed || 12) * this.cellSize;
            const homingStrength = turret.config.homingStrength || 0.15;
            const spreadRadius = (turret.config.spreadRadius || 0) * this.cellSize;

            // Find strongest target for battery
            let missileTarget = target;
            if (turret.config.isMissileBattery) {
                let maxHealth = 0;
                for (const enemy of this.enemies) {
                    if (!enemy || enemy.dead) continue;
                    const dist = Math.sqrt((turret.x - enemy.x) ** 2 + (turret.y - enemy.y) ** 2);
                    if (dist <= range && enemy.health > maxHealth) {
                        maxHealth = enemy.health;
                        missileTarget = enemy;
                    }
                }
            }

            // Safety check - if no valid target, abort
            if (!missileTarget || missileTarget.dead) return;

            for (let i = 0; i < missileCount; i++) {
                // Launch from different positions on the turret
                const launchAngle = turret.config.isMissileBattery
                    ? (i / missileCount) * Math.PI * 2
                    : turret.angle + (i - (missileCount - 1) / 2) * 0.2;
                const launchOffset = turret.config.isMissileBattery ? this.cellSize * 0.6 : this.cellSize * 0.3;
                const startX = turret.x + Math.cos(launchAngle) * launchOffset;
                const startY = turret.y + Math.sin(launchAngle) * launchOffset;

                // Calculate target position with spread
                let targetX = missileTarget.x;
                let targetY = missileTarget.y;
                if (spreadRadius > 0) {
                    const spreadAngle = Math.random() * Math.PI * 2;
                    const spreadDist = Math.random() * spreadRadius;
                    targetX += Math.cos(spreadAngle) * spreadDist;
                    targetY += Math.sin(spreadAngle) * spreadDist;
                }

                const dx = targetX - startX;
                const dy = targetY - startY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                let projType = 'missile';
                if (turret.config.isRocketArray) projType = 'rocket';
                if (turret.config.isMissileBattery) projType = 'battery-missile';

                // Initial launch angle with slight variation
                const initialAngle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.4;

                this.projectiles.push({
                    id: Date.now() + Math.random() + i,
                    type: projType,
                    x: startX,
                    y: startY,
                    startX: startX,
                    startY: startY,
                    vx: Math.cos(initialAngle) * speed * 0.5,
                    vy: Math.sin(initialAngle) * speed * 0.5 - (turret.config.isMissileBattery ? speed * 0.2 : 0),
                    maxSpeed: speed,
                    damage: damage,
                    aoeRadius: turret.config.explosionRadius || 1.5,
                    penetration: false,
                    hitEnemies: [],
                    // Homing properties
                    targetId: missileTarget.id,
                    targetX: targetX,
                    targetY: targetY,
                    homingStrength: homingStrength,
                    life: 5.0,
                    delay: i * (turret.config.salvoDelay || 0.05)
                });
            }
        } else if (turret.config.isNuclear) {
            // NUCLEAR ICBM - guided
            let strongestEnemy = target;
            let maxHealth = 0;
            for (const enemy of this.enemies) {
                if (!enemy || enemy.dead) continue;
                const dist = Math.sqrt((turret.x - enemy.x) ** 2 + (turret.y - enemy.y) ** 2);
                if (dist <= range && enemy.health > maxHealth) {
                    maxHealth = enemy.health;
                    strongestEnemy = enemy;
                }
            }

            // Safety check - if no valid target, abort
            if (!strongestEnemy || strongestEnemy.dead) return;

            const speed = (turret.config.projectileSpeed || 6) * this.cellSize;
            const launchAngle = turret.angle - Math.PI / 6;

            this.projectiles.push({
                id: Date.now() + Math.random(),
                type: 'nuclear',
                x: turret.x,
                y: turret.y,
                startX: turret.x,
                startY: turret.y,
                vx: Math.cos(launchAngle) * speed * 0.5,
                vy: Math.sin(launchAngle) * speed * 0.5 - speed * 0.3,
                maxSpeed: speed * 1.5,
                damage: damage,
                aoeRadius: turret.config.aoeRadius || 5,
                targetId: strongestEnemy.id,
                targetX: strongestEnemy.x,
                targetY: strongestEnemy.y,
                homingStrength: turret.config.homingStrength || 0.08,
                life: 8.0,
                hitEnemies: []
            });
        } else if (turret.config.flakCount || turret.config.isAntiAir) {
            // FLAK - multiple fast projectiles with AOE explosions
            const flakCount = turret.config.flakCount || 16;
            const spreadRadius = (turret.config.flakSpread || 3) * this.cellSize;
            const speed = (turret.config.projectileSpeed || 40) * this.cellSize;

            for (let i = 0; i < flakCount; i++) {
                const spreadAngle = turret.angle + (Math.random() - 0.5) * 0.8;
                const spreadDist = Math.random() * spreadRadius;
                const targetX = target.x + Math.cos(spreadAngle) * spreadDist;
                const targetY = target.y + Math.sin(spreadAngle) * spreadDist;

                const dx = targetX - turret.x;
                const dy = targetY - turret.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                this.projectiles.push({
                    id: Date.now() + Math.random() + i,
                    type: 'flak',
                    x: turret.x,
                    y: turret.y,
                    startX: turret.x,
                    startY: turret.y,
                    vx: (dx / dist) * speed,
                    vy: (dy / dist) * speed,
                    damage: damage,
                    aoeRadius: turret.config.flakExplosionRadius || 0.8,
                    targetX: targetX,
                    targetY: targetY,
                    hitEnemies: [],
                    delay: (i / flakCount) * 0.08,
                    life: 1.2
                });
            }
        } else if (turret.config.isOrbital) {
            // ORBITAL STRIKE - delayed beam from sky
            const strikeDelay = turret.config.strikeDelay || 1.0;
            const strikeRadius = (turret.config.strikeRadius || 5) * this.cellSize;

            // Create warning marker first
            this.projectiles.push({
                id: Date.now() + Math.random(),
                type: 'orbital-warning',
                x: target.x,
                y: target.y,
                startX: target.x,
                startY: target.y,
                vx: 0,
                vy: 0,
                damage: 0,
                life: strikeDelay,
                radius: strikeRadius
            });

            // Create delayed strike
            this.projectiles.push({
                id: Date.now() + Math.random() + 1,
                type: 'orbital-strike',
                x: target.x,
                y: target.y,
                startX: target.x,
                startY: target.y,
                vx: 0,
                vy: 0,
                damage: damage,
                aoeRadius: turret.config.strikeRadius || 5,
                delay: strikeDelay,
                life: 1.5,
                radius: strikeRadius
            });
        } else if (turret.config.isStorm) {
            // STORM - area effect with lightning strikes
            const stormRadius = (turret.config.stormRadius || 5) * this.cellSize;
            const lightningStrikes = turret.config.lightningStrikes || 5;

            // Storm cloud effect
            this.projectiles.push({
                id: Date.now() + Math.random(),
                type: 'storm-cloud',
                x: target.x,
                y: target.y,
                startX: turret.x,
                startY: turret.y,
                vx: 0,
                vy: 0,
                damage: 0,
                life: 0.5,
                radius: stormRadius
            });

            // Lightning strikes hitting enemies in area
            const enemiesInRange = this.enemies.filter(e => {
                if (!e || e.dead) return false;
                const dist = Math.sqrt((e.x - target.x) ** 2 + (e.y - target.y) ** 2);
                return dist <= stormRadius;
            });

            for (let i = 0; i < Math.min(lightningStrikes, enemiesInRange.length); i++) {
                const enemy = enemiesInRange[i];
                enemy.health -= damage;

                this.projectiles.push({
                    id: Date.now() + Math.random() + i,
                    type: 'lightning',
                    x: enemy.x,
                    y: enemy.y,
                    startX: target.x,
                    startY: target.y - 200,
                    vx: 0,
                    vy: 0,
                    damage: 0,
                    life: 0.2
                });
            }
        } else if (turret.config.isDeathRay) {
            // DEATH RAY - continuous devastating beam
            target.health -= damage;

            this.projectiles.push({
                id: Date.now() + Math.random(),
                type: 'deathray',
                x: target.x,
                y: target.y,
                startX: turret.x,
                startY: turret.y,
                vx: 0,
                vy: 0,
                damage: 0,
                life: 0.08
            });
        } else if (turret.config.isLaserArray) {
            // LASER ARRAY - multiple instant beams
            const laserCount = turret.config.laserCount || 4;
            const enemiesInRange = this.enemies.filter(e => {
                if (!e || e.dead) return false;
                const dist = Math.sqrt((e.x - turret.x) ** 2 + (e.y - turret.y) ** 2);
                return dist <= turret.config.range * this.cellSize;
            }).slice(0, laserCount);

            for (let i = 0; i < enemiesInRange.length; i++) {
                const enemy = enemiesInRange[i];
                enemy.health -= damage;

                this.projectiles.push({
                    id: Date.now() + Math.random() + i,
                    type: 'laser',
                    x: enemy.x,
                    y: enemy.y,
                    startX: turret.x,
                    startY: turret.y,
                    vx: 0,
                    vy: 0,
                    damage: 0,
                    life: 0.1
                });
            }
        } else {
            // Standard projectile with enhanced visuals
            const dx = target.x - turret.x;
            const dy = target.y - turret.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 0) {
                // Determine projectile type from turret type
                let projType = 'bullet';
                if (turret.type === 'turret-artillery' || turret.type === 'turret-mortar') projType = 'artillery';
                else if (turret.type === 'turret-sniper') projType = 'sniper';

                const speed = (turret.config.projectileSpeed || 10) * this.cellSize;

                // Muzzle flash effect
                this.pendingEffects.push({
                    type: 'muzzle-flash',
                    x: turret.x + Math.cos(turret.angle) * this.cellSize * 0.3,
                    y: turret.y + Math.sin(turret.angle) * this.cellSize * 0.3,
                    angle: turret.angle,
                    color: turret.config.projectileColor || '#ffff00',
                    size: projType === 'sniper' ? 12 : (projType === 'artillery' ? 15 : 8)
                });

                this.projectiles.push({
                    id: Date.now() + Math.random(),
                    type: projType,
                    x: turret.x,
                    y: turret.y,
                    startX: turret.x,
                    startY: turret.y,
                    vx: (dx / dist) * speed,
                    vy: (dy / dist) * speed,
                    damage: damage,
                    aoeRadius: turret.config.aoeRadius || 0,
                    penetration: turret.config.penetration || false,
                    hitEnemies: [],
                    // Pass color for rendering
                    color: turret.config.projectileColor
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

            // Handle delay for salvo firing
            if (proj.delay !== undefined && proj.delay > 0) {
                proj.delay -= deltaTime;
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

            // === HOMING LOGIC FOR GUIDED MISSILES ===
            if (proj.homingStrength && proj.targetId) {
                // Find the target enemy by ID
                const targetEnemy = this.enemies.find(e => e && e.id === proj.targetId && !e.dead);

                if (targetEnemy) {
                    const dx = targetEnemy.x - proj.x;
                    const dy = targetEnemy.y - proj.y;
                    const distToTarget = Math.sqrt(dx * dx + dy * dy);

                    if (distToTarget > 10) {
                        const currentSpeed = Math.sqrt(proj.vx * proj.vx + proj.vy * proj.vy);
                        const maxSpeed = proj.maxSpeed || currentSpeed;

                        // Desired direction
                        const desiredVx = (dx / distToTarget) * maxSpeed;
                        const desiredVy = (dy / distToTarget) * maxSpeed;

                        // Interpolate towards desired direction
                        proj.vx += (desiredVx - proj.vx) * proj.homingStrength;
                        proj.vy += (desiredVy - proj.vy) * proj.homingStrength;

                        // Maintain/increase speed
                        const newSpeed = Math.sqrt(proj.vx * proj.vx + proj.vy * proj.vy);
                        if (newSpeed > 0) {
                            const speedMult = Math.min(maxSpeed / newSpeed, 1.05);
                            proj.vx *= speedMult;
                            proj.vy *= speedMult;
                        }
                    }

                    // Update target position for nuclear
                    if (proj.type === 'nuclear') {
                        proj.targetX = targetEnemy.x;
                        proj.targetY = targetEnemy.y;
                    }
                }
            }

            // Nuclear reaching target
            if (proj.type === 'nuclear' && proj.targetX !== undefined) {
                const distToTarget = Math.sqrt((proj.x - proj.targetX) ** 2 + (proj.y - proj.targetY) ** 2);
                if (distToTarget < 30) {
                    // Explode
                    this.dealAOE(proj.x, proj.y, proj.aoeRadius * this.cellSize, proj.damage);
                    this.pendingEffects.push({
                        type: 'nuclear-explosion',
                        x: proj.x,
                        y: proj.y,
                        radius: proj.aoeRadius * this.cellSize
                    });
                    this.projectiles.splice(i, 1);
                    continue;
                }
            }

            // FLAK reaching target area
            if (proj.type === 'flak' && proj.targetX !== undefined) {
                const distToTarget = Math.sqrt((proj.x - proj.targetX) ** 2 + (proj.y - proj.targetY) ** 2);
                if (distToTarget < 20) {
                    // Explode with flak effect
                    this.dealAOE(proj.x, proj.y, proj.aoeRadius * this.cellSize, proj.damage, 'flak-explosion');
                    this.projectiles.splice(i, 1);
                    continue;
                }
            }

            // Orbital strike - deal damage when delay expires
            if (proj.type === 'orbital-strike' && proj.delay !== undefined && proj.delay <= 0) {
                if (!proj.triggered) {
                    proj.triggered = true;
                    // Deal massive AOE damage
                    this.dealAOE(proj.x, proj.y, proj.radius, proj.damage, 'explosion');
                    this.pendingEffects.push({
                        type: 'orbital-beam',
                        x: proj.x,
                        y: proj.y,
                        radius: proj.radius
                    });
                }
            }

            // Visual-only projectiles that don't move
            if (proj.type === 'storm-cloud' || proj.type === 'lightning' ||
                proj.type === 'orbital-warning' || proj.type === 'orbital-strike' ||
                proj.type === 'deathray' || proj.type === 'flame') {
                continue; // Don't move, just expire based on life
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
                        // Use appropriate explosion effect based on projectile type
                        const explosionType = (proj.type === 'missile' || proj.type === 'rocket' || proj.type === 'battery-missile')
                            ? 'missile-explosion' : 'explosion';
                        this.dealAOE(proj.x, proj.y, proj.aoeRadius * this.cellSize, proj.damage || 10, explosionType);
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

    dealAOE(x, y, radius, damage, explosionType = 'explosion') {
        if (!radius || radius <= 0) return;

        // Add explosion effect based on type
        this.pendingEffects.push({
            type: explosionType,
            x: x,
            y: y,
            radius: radius,
            color: explosionType === 'missile-explosion' ? '#ff4400' : '#ff6600'
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

            // Multi-cell turrets (3x3)
            const size = config.gridSize || 1;
            if (size > 1) {
                this.placeMultiBuilding(gridX, gridY, size);
            } else {
                this.grid[gridY][gridX] = 1;
            }
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

        // Mark grid as dirty so it will be sent in next sync
        this.gridDirty = true;
        return { success: true };
    }

    sellBuilding(gridX, gridY, playerId) {
        // Find turret at position (check footprint for multi-cell turrets)
        const turretIndex = this.turrets.findIndex(t => {
            const size = t.config?.gridSize || 1;
            if (size > 1) {
                const offset = Math.floor(size / 2);
                return gridX >= t.gridX - offset && gridX <= t.gridX + offset &&
                       gridY >= t.gridY - offset && gridY <= t.gridY + offset;
            }
            return t.gridX === gridX && t.gridY === gridY;
        });
        if (turretIndex > -1) {
            const turret = this.turrets[turretIndex];
            const baseCost = TURRET_TYPES[turret.type]?.cost || {};

            // 75% refund, scaled by level
            const refundMultiplier = 0.75 * (1 + (turret.level - 1) * 0.5);
            for (const [res, amt] of Object.entries(baseCost)) {
                this.resources[res] = (this.resources[res] || 0) + Math.floor(amt * refundMultiplier);
            }

            this.turrets.splice(turretIndex, 1);

            // Multi-cell turrets (3x3)
            const size = turret.config?.gridSize || 1;
            if (size > 1) {
                this.removeMultiBuilding(turret.gridX, turret.gridY, size);
            } else {
                this.grid[gridY][gridX] = 0;
            }
            this.gridDirty = true;
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
            this.gridDirty = true;
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
            this.gridDirty = true;
            return { success: true, type: 'wall' };
        }

        return { success: false, message: 'No building at this position' };
    }

    upgradeBuilding(gridX, gridY, playerId) {
        // Find turret at position (check footprint for multi-cell turrets)
        const turret = this.turrets.find(t => {
            const size = t.config?.gridSize || 1;
            if (size > 1) {
                const offset = Math.floor(size / 2);
                return gridX >= t.gridX - offset && gridX <= t.gridX + offset &&
                       gridY >= t.gridY - offset && gridY <= t.gridY + offset;
            }
            return t.gridX === gridX && t.gridY === gridY;
        });
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
            // Also upgrade aoeRange for slowdown/shockwave turrets
            if (turret.config.aoeRange) {
                turret.config.aoeRange = turret.config.aoeRange * 1.1;
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
        // Check multi-cell turrets (3x3)
        if (buildingType.startsWith('turret-')) {
            const config = TURRET_TYPES[buildingType];
            const size = config?.gridSize || 1;

            if (size > 1) {
                return this.canPlaceMulti(gridX, gridY, size);
            }
        }

        if (gridX < 0 || gridX >= this.cols || gridY < 0 || gridY >= this.rows) {
            return false;
        }

        if (buildingType === 'extractor') {
            return this.grid[gridY][gridX] === 2;
        }

        return this.grid[gridY][gridX] === 0 || this.grid[gridY][gridX] === 2;
    }

    canPlaceMulti(centerX, centerY, size) {
        const offset = Math.floor(size / 2);
        for (let dy = -offset; dy <= offset; dy++) {
            for (let dx = -offset; dx <= offset; dx++) {
                const x = centerX + dx;
                const y = centerY + dy;
                if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) {
                    return false;
                }
                const cell = this.grid[y][x];
                // Can only place on empty (0) or resource (2) cells
                if (cell !== 0 && cell !== 2) {
                    return false;
                }
            }
        }
        return true;
    }

    placeMultiBuilding(centerX, centerY, size) {
        const offset = Math.floor(size / 2);
        for (let dy = -offset; dy <= offset; dy++) {
            for (let dx = -offset; dx <= offset; dx++) {
                this.grid[centerY + dy][centerX + dx] = 1;
            }
        }
    }

    removeMultiBuilding(centerX, centerY, size) {
        const offset = Math.floor(size / 2);
        for (let dy = -offset; dy <= offset; dy++) {
            for (let dx = -offset; dx <= offset; dx++) {
                const x = centerX + dx;
                const y = centerY + dy;
                // Check if there was a resource here originally
                if (this.resourceMap[y][x]) {
                    this.grid[y][x] = 2;
                } else {
                    this.grid[y][x] = 0;
                }
            }
        }
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
        // Recalculate main paths when grid changes
        this.calculateMainPaths();

        // Mark all enemies for path recalculation (will be done progressively)
        for (const enemy of this.enemies) {
            enemy.needsPathRecalc = true;
        }
    }

    // Progressive path recalculation - call this in update loop
    // Uses main paths for efficiency
    progressivePathRecalc(maxPerFrame = 5) {
        // Scale recalculations with game speed
        const scaledMax = maxPerFrame * this.gameSpeed;
        let recalculated = 0;

        for (const enemy of this.enemies) {
            if (enemy.needsPathRecalc && recalculated < scaledMax) {
                const gridX = Math.floor(enemy.x / this.cellSize);
                const gridY = Math.floor(enemy.y / this.cellSize);

                // Use main paths - find nearest path point
                const path = this.findNearestMainPath(gridX, gridY);
                if (path) {
                    enemy.path = path;
                    enemy.pathIndex = 0;
                }
                enemy.needsPathRecalc = false;
                recalculated++;
            }
        }
    }

    findPath(startX, startY, endX, endY) {
        // Optimized A* with Set for O(1) lookup
        const openSet = [{ x: startX, y: startY, f: 0, g: 0 }];
        const openSetKeys = new Set([`${startX},${startY}`]);
        const closedSet = new Set();
        const cameFrom = new Map();
        const gScore = new Map();

        gScore.set(`${startX},${startY}`, 0);

        // Max iterations to prevent infinite loops on large maps
        // Increased for 150x114 map (17100 cells) with complex mazes
        let iterations = 0;
        const maxIterations = 50000;

        while (openSet.length > 0 && iterations < maxIterations) {
            iterations++;

            // Find node with lowest f score (simple but effective for our use case)
            let lowestIdx = 0;
            for (let i = 1; i < openSet.length; i++) {
                if (openSet[i].f < openSet[lowestIdx].f) {
                    lowestIdx = i;
                }
            }
            const current = openSet[lowestIdx];
            openSet.splice(lowestIdx, 1);
            const key = `${current.x},${current.y}`;
            openSetKeys.delete(key);

            if (current.x === endX && current.y === endY) {
                return this.reconstructPath(cameFrom, current);
            }

            closedSet.add(key);

            // Check all 4 neighbors
            const nx = [current.x - 1, current.x + 1, current.x, current.x];
            const ny = [current.y, current.y, current.y - 1, current.y + 1];

            for (let i = 0; i < 4; i++) {
                const nKey = `${nx[i]},${ny[i]}`;
                if (closedSet.has(nKey)) continue;
                if (!this.isWalkable(nx[i], ny[i])) continue;

                const tentativeG = gScore.get(key) + 1;

                if (!gScore.has(nKey) || tentativeG < gScore.get(nKey)) {
                    cameFrom.set(nKey, current);
                    gScore.set(nKey, tentativeG);
                    const h = Math.abs(nx[i] - endX) + Math.abs(ny[i] - endY);
                    const f = tentativeG + h;

                    if (!openSetKeys.has(nKey)) {
                        openSet.push({ x: nx[i], y: ny[i], f, g: tentativeG });
                        openSetKeys.add(nKey);
                    }
                }
            }
        }

        return null;
    }

    isWalkable(x, y) {
        if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) return false;
        const cell = this.grid[y][x];
        // 0 = empty, 2 = resource, 3 = nexus, 4 = border (walkable but not buildable)
        return cell === 0 || cell === 2 || cell === 3 || cell === 4;
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

        // Filter out null/undefined items before mapping
        const validEnemies = this.enemies.filter(e => e && !e.dead);
        const validTurrets = this.turrets.filter(t => t && t.config);
        const validWalls = this.walls.filter(w => w);
        const validExtractors = this.extractors.filter(e => e);
        const validProjectiles = this.projectiles.filter(p => p);

        // Increment sync counter - send full state every ~5 seconds (100 syncs at 20/sec)
        this.syncCounter = (this.syncCounter || 0) + 1;
        const sendFullState = this.gridDirty || this.syncCounter >= 100;
        if (sendFullState) {
            this.gridDirty = false;
            this.syncCounter = 0;
        }

        const result = {
            resources: this.resources,
            nexusHealth: this.nexusHealth,
            waveNumber: this.waveNumber,
            waveTimer: this.waveTimer,
            waveActive: this.waveActive,
            totalKills: this.totalKills,
            totalScore: this.totalScore,
            enemies: validEnemies.map(e => ({
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
                isAttackingTurret: e.isAttackingTurret,
                ignoreWalls: e.ignoreWalls || false
            })),
            turrets: validTurrets.map(t => ({
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
                aoeRange: t.config?.aoeRange,
                health: t.health,
                maxHealth: t.maxHealth || t.config?.maxHealth || 100,
                homeX: t.homeX,
                homeY: t.homeY,
                speedBoosted: t.speedBoosted || false,
                damageBoosted: t.damageBoosted || false,
                rangeBoosted: t.rangeBoosted || false
            })),
            walls: validWalls.map(w => ({
                id: w.id,
                gridX: w.gridX,
                gridY: w.gridY,
                x: w.x,
                y: w.y,
                health: w.health
            })),
            extractors: validExtractors.map(e => ({
                id: e.id,
                gridX: e.gridX,
                gridY: e.gridY,
                x: e.x,
                y: e.y,
                resourceType: e.resourceType,
                level: e.level || 1,
                extractionRate: e.extractionRate || 1
            })),
            projectiles: validProjectiles.map(p => ({
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
                damage: p.damage,
                color: p.color,
                size: p.size,
                homingStrength: p.homingStrength,
                targetId: p.targetId,
                maxSpeed: p.maxSpeed,
                targetX: p.targetX,
                targetY: p.targetY,
                delay: p.delay
            })),
            // Effects to trigger on client (explosions, deaths, etc.)
            effects: effectsToSend
        };

        // Only send grid/paths when they've changed or periodically for full sync
        if (sendFullState) {
            result.grid = this.grid;
            result.mainPaths = this.mainPaths;
        }

        return result;
    }
}

module.exports = GameState;
