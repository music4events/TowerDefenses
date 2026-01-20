export const TURRET_TYPES = {
    'turret-mg': {
        name: 'Mitrailleuse',
        damage: 5,
        range: 4,
        fireRate: 0.1,
        color: '#4a9eff',
        cost: { iron: 100 },
        projectileSpeed: 15,
        projectileColor: '#ffff00',
        size: 0.8,
        health: 100,
        maxHealth: 100
    },
    'turret-sniper': {
        name: 'Sniper',
        damage: 50,
        range: 10,
        fireRate: 1.5,
        color: '#9b59b6',
        cost: { iron: 200, copper: 50 },
        projectileSpeed: 30,
        projectileColor: '#ff00ff',
        penetration: true,
        size: 0.7,
        health: 80,
        maxHealth: 80
    },
    'turret-artillery': {
        name: 'Artillerie',
        damage: 30,
        range: 8,
        fireRate: 2,
        color: '#e67e22',
        cost: { iron: 300, copper: 100 },
        projectileSpeed: 8,
        projectileColor: '#ff6600',
        aoeRadius: 2,
        size: 0.9,
        health: 120,
        maxHealth: 120
    },
    'turret-flamethrower': {
        name: 'Lance-flammes',
        damage: 15,
        range: 4,                 // Portée augmentée
        fireRate: 0.03,           // Plus rapide encore
        color: '#e74c3c',
        cost: { iron: 150, coal: 30 },
        continuous: true,
        projectileSpeed: 5,       // Plus lent pour couvrir la zone
        flameCount: 8,            // Plus de particules
        flameLife: 1.2,           // Durée plus longue pour couvrir toute la portée
        flameSpread: 0.5,         // Plus de dispersion
        dotDamage: 5,
        dotDuration: 2,
        size: 0.8,
        health: 90,
        maxHealth: 90
    },
    'turret-tesla': {
        name: 'Tesla',
        damage: 25,
        range: 5,
        fireRate: 0.8,
        color: '#00d4ff',
        cost: { iron: 400, copper: 150, gold: 50 },
        chainTargets: 3,
        chainRange: 2,
        size: 0.85,
        health: 100,
        maxHealth: 100
    },
    'turret-laser': {
        name: 'Laser',
        damage: 40,
        range: 6,
        fireRate: 0.2,
        color: '#2ecc71',
        cost: { iron: 500, copper: 200, gold: 100 },
        accuracy: 1,
        instantHit: true,
        size: 0.75,
        health: 80,
        maxHealth: 80
    },
    // === NOUVELLES TOURELLES ===
    'turret-shotgun': {
        name: 'Shotgun',
        damage: 8,
        range: 4,
        fireRate: 0.8,
        color: '#8b4513',
        cost: { iron: 150, copper: 30 },
        projectileSpeed: 12,
        projectileColor: '#ffcc00',
        pelletCount: 6,
        spreadAngle: 0.5,
        size: 0.8,
        health: 100,
        maxHealth: 100
    },
    'turret-multi-artillery': {
        name: 'Multi-Artillerie',
        damage: 25,
        range: 9,
        fireRate: 2.5,
        color: '#cc6600',
        cost: { iron: 400, copper: 150, coal: 50 },
        projectileSpeed: 7,
        projectileColor: '#ff8800',
        aoeRadius: 1.5,
        shellCount: 3,
        shellSpread: 1.5,
        size: 0.95,
        health: 130,
        maxHealth: 130
    },
    'turret-healer': {
        name: 'Healer',
        damage: 0,
        healAmount: 10,
        range: 4,
        fireRate: 0.5,
        color: '#44ff44',
        cost: { iron: 250, copper: 100, gold: 30 },
        isHealer: true,
        beamColor: '#88ff88',
        size: 0.8,
        health: 80,
        maxHealth: 80
    },
    'turret-slowdown': {
        name: 'Ralentisseur',
        damage: 0,
        slowAmount: 0.4,
        range: 4,
        fireRate: 0.1,
        color: '#88ddff',
        cost: { iron: 180, copper: 60 },
        isSlowdown: true,
        aoeRange: 3,
        frostColor: '#aaeeff',
        size: 0.8,
        health: 90,
        maxHealth: 90
    },
    'turret-mortar': {
        name: 'Mortier',
        damage: 60,
        range: 14,
        minRange: 5,
        fireRate: 3,
        color: '#556b2f',
        cost: { iron: 350, copper: 120 },
        projectileSpeed: 6,
        projectileColor: '#8b4513',
        aoeRadius: 2.5,
        arcHeight: 3,
        size: 0.9,
        health: 110,
        maxHealth: 110
    },
    'turret-railgun': {
        name: 'Railgun',
        damage: 70,
        range: 12,
        fireRate: 2.5,
        color: '#4169e1',
        cost: { iron: 500, copper: 200, gold: 80 },
        instantHit: true,
        piercingBeam: true,
        beamColor: '#6495ed',
        beamWidth: 4,
        size: 0.85,
        health: 90,
        maxHealth: 90
    },
    'turret-drone': {
        name: 'Drone',
        damage: 12,
        range: 5,
        fireRate: 0.3,
        color: '#9370db',
        cost: { iron: 300, copper: 150, gold: 50 },
        projectileSpeed: 18,
        projectileColor: '#dda0dd',
        isDrone: true,
        patrolRadius: 4,
        moveSpeed: 2,
        size: 0.6,
        health: 60,
        maxHealth: 60
    },
    'turret-shockwave': {
        name: 'Shockwave',
        damage: 20,
        range: 4,
        fireRate: 1.5,
        color: '#00bfff',
        cost: { iron: 350, copper: 150, gold: 60 },
        isShockwave: true,
        aoeRange: 3,
        shockColor: '#00d4ff',
        size: 0.85,
        health: 100,
        maxHealth: 100
    },
    'turret-speed-booster': {
        name: 'Speed Booster',
        damage: 0,
        range: 4,
        fireRate: 0.5,
        color: '#ffaa00',
        cost: { iron: 200, copper: 80, gold: 40 },
        isSpeedBooster: true,
        fireRateBoost: 0.25,
        boostColor: 'rgba(255, 170, 0, 0.15)',
        size: 0.8,
        health: 80,
        maxHealth: 80
    },
    'turret-damage-booster': {
        name: 'Damage Booster',
        damage: 0,
        range: 4,
        fireRate: 0.5,
        color: '#ff4444',
        cost: { iron: 250, copper: 100, gold: 50 },
        isDamageBooster: true,
        damageBoost: 0.3,
        boostColor: 'rgba(255, 68, 68, 0.15)',
        size: 0.8,
        health: 80,
        maxHealth: 80
    },
    'turret-range-booster': {
        name: 'Range Booster',
        damage: 0,
        range: 4,
        fireRate: 0.5,
        color: '#44aaff',
        cost: { iron: 300, copper: 120, gold: 60 },
        isRangeBooster: true,
        rangeBoost: 0.25,
        boostColor: 'rgba(68, 170, 255, 0.15)',
        size: 0.8,
        health: 80,
        maxHealth: 80
    },
    // === TOURELLES 2x2 (BUFFED!) ===
    'turret-missile': {
        name: 'Missile Launcher',
        gridSize: 2,
        damage: 60,
        range: 12,
        fireRate: 1.2,            // Plus rapide!
        color: '#8b0000',
        cost: { iron: 600, copper: 200, gold: 80 },
        projectileSpeed: 12,      // Plus rapide!
        projectileColor: '#ff4400',

        isMissile: true,
        homingStrength: 0.25,     // Guidage plus fort!
        missileCount: 3,          // 3 missiles par salve!
        trailColor: '#ff6600',
        explosionRadius: 2.0,     // Plus gros!

        size: 1.8,
        health: 250,
        maxHealth: 250
    },
    'turret-plasma': {
        name: 'Plasma Cannon',
        gridSize: 2,
        damage: 120,              // Plus de dégâts!
        range: 10,
        fireRate: 1.5,            // Plus rapide!
        color: '#9400d3',
        cost: { iron: 700, copper: 250, gold: 100 },
        projectileSpeed: 15,
        projectileColor: '#da70d6',

        isPlasma: true,
        plasmaSize: 20,           // Plus gros!
        plasmaTrail: true,
        aoeRadius: 1.8,           // Plus gros!

        size: 1.8,
        health: 220,
        maxHealth: 220
    },
    'turret-cryo': {
        name: 'Cryo Tower',
        gridSize: 2,
        damage: 25,
        range: 7,
        fireRate: 0.1,
        color: '#00ffff',
        cost: { iron: 550, copper: 180, gold: 70 },

        isCryo: true,
        freezeChance: 0.1,        // 10% chance de geler
        slowAmount: 0.6,          // 60% slow
        beamColor: '#00ffff',
        particleColor: '#aaffff',

        size: 1.8,
        health: 200,
        maxHealth: 200
    },
    'turret-gatling': {
        name: 'Gatling Gun',
        gridSize: 2,
        damage: 8,
        range: 7,
        fireRate: 0.03,           // Tres rapide!
        color: '#696969',
        cost: { iron: 650, copper: 220, gold: 60 },
        projectileSpeed: 25,
        projectileColor: '#ffdd00',

        isGatling: true,
        barrelCount: 6,
        spinSpeed: 0.5,           // Vitesse de rotation
        spread: 0.15,

        size: 1.8,
        health: 280,
        maxHealth: 280
    },
    'turret-emp': {
        name: 'EMP Tower',
        gridSize: 2,
        damage: 15,
        range: 6,
        fireRate: 3.0,
        color: '#4169e1',
        cost: { iron: 600, copper: 300, gold: 120 },

        isEMP: true,
        stunDuration: 2.0,        // Secondes de stun
        empRadius: 4,
        empColor: '#6495ed',
        waveCount: 3,

        size: 1.8,
        health: 180,
        maxHealth: 180
    },

    // === TOURELLES 3x3 (PORTEES AUGMENTEES!) ===
    'turret-flak': {
        name: 'FLAK Anti-Aerien',
        gridSize: 3,
        damage: 15,               // Degats augmentes (moins de projectiles)
        range: 18,                // +4 portée!
        fireRate: 0.15,           // Cadence reduite pour perf
        color: '#2a5caa',
        cost: { iron: 800, copper: 300, gold: 100 },
        projectileSpeed: 50,      // Plus rapide!
        projectileColor: '#00ddff',

        isAntiAir: true,
        flakCount: 6,             // Reduit pour perf (6 au lieu de 20)
        flakSpread: 8,            // Zone x6 plus grande!
        barrelCount: 2,
        flakExplosion: true,      // Explosions à l'impact!
        flakExplosionRadius: 3.0, // AOE x3 plus grande!

        size: 2.8,
        health: 400,
        maxHealth: 400
    },
    'turret-mega-tesla': {
        name: 'Mega Tesla',
        gridSize: 3,
        damage: 60,
        range: 14,                // +4 portée!
        fireRate: 1.2,
        color: '#00ffff',
        cost: { iron: 1200, copper: 500, gold: 200 },

        isMegaTesla: true,
        chainTargets: 8,          // Touche 8 cibles
        chainRange: 5,            // +1 chain range!
        arcCount: 3,              // 3 arcs principaux
        boltWidth: 6,
        glowColor: '#00ffff',

        size: 2.8,
        health: 500,
        maxHealth: 500
    },
    'turret-mega-railgun': {
        name: 'Mega Railgun',
        gridSize: 3,
        damage: 200,
        range: 24,                // +6 portée!
        fireRate: 4.0,
        color: '#1e90ff',
        cost: { iron: 1500, copper: 600, gold: 250 },

        isMegaRailgun: true,
        instantHit: true,
        piercingBeam: true,
        beamWidth: 12,
        beamColor: '#00bfff',
        chargeTime: 1.0,          // Temps de charge visible
        coreColor: '#ffffff',

        size: 2.8,
        health: 450,
        maxHealth: 450
    },
    'turret-rocket-array': {
        name: 'Rocket Artillery',
        gridSize: 3,
        damage: 60,               // Plus de dégâts!
        range: 22,                // +6 portée!
        fireRate: 1.8,            // Plus rapide!
        color: '#b22222',
        cost: { iron: 1100, copper: 450, gold: 180 },
        projectileSpeed: 14,      // Plus rapide!
        projectileColor: '#ff4500',

        isRocketArray: true,
        rocketCount: 8,           // 8 roquettes par salve!
        isMissile: true,
        homingStrength: 0.2,      // Meilleur guidage!
        salvoDelay: 0.08,         // Salve plus rapide!
        trailColor: '#ff6347',
        explosionRadius: 2.2,     // Plus gros!

        size: 2.8,
        health: 480,
        maxHealth: 480
    },
    'turret-laser-array': {
        name: 'Laser Array',
        gridSize: 3,
        damage: 35,
        range: 16,                // +4 portée!
        fireRate: 0.15,
        color: '#32cd32',
        cost: { iron: 1000, copper: 400, gold: 160 },

        isLaserArray: true,
        laserCount: 4,            // 4 lasers simultanes
        instantHit: true,
        beamColor: '#00ff00',
        beamWidth: 3,
        pulseEffect: true,

        size: 2.8,
        health: 400,
        maxHealth: 400
    },
    'turret-particle': {
        name: 'Particle Cannon',
        gridSize: 3,
        damage: 150,
        range: 20,                // +5 portée!
        fireRate: 3.5,
        color: '#ff1493',
        cost: { iron: 1300, copper: 550, gold: 220 },

        isParticle: true,
        instantHit: true,
        beamWidth: 8,
        beamColor: '#ff69b4',
        particleCount: 50,        // Particules dans le rayon
        chargeTime: 1.5,
        coreColor: '#ffffff',

        size: 2.8,
        health: 420,
        maxHealth: 420
    },
    'turret-nuclear': {
        name: 'Nuclear Launcher',
        gridSize: 3,
        damage: 600,              // DEVASTATEUR!
        range: 28,                // +6 portée!
        minRange: 5,
        fireRate: 4.5,            // Plus rapide!
        color: '#ffff00',
        cost: { iron: 2000, copper: 800, gold: 400 },
        projectileSpeed: 6,       // ICBM guidé
        projectileColor: '#ffff00',

        isNuclear: true,
        homingStrength: 0.08,     // MISSILE GUIDÉ!
        aoeRadius: 7,             // ENORME zone de dégâts!
        radiationDamage: 40,      // Radiation augmentée!
        radiationDuration: 4,
        mushroomCloud: true,

        size: 2.8,
        health: 600,
        maxHealth: 600
    },
    'turret-storm': {
        name: 'Storm Generator',
        gridSize: 3,
        damage: 25,
        range: 14,                // +4 portée!
        fireRate: 0.2,
        color: '#9932cc',
        cost: { iron: 1100, copper: 500, gold: 200 },

        isStorm: true,
        stormRadius: 6,           // +1 rayon de tempête!
        lightningStrikes: 6,      // +1 éclairs!
        strikeChance: 0.3,
        cloudColor: '#4b0082',
        boltColor: '#da70d6',

        size: 2.8,
        health: 450,
        maxHealth: 450
    },
    'turret-deathray': {
        name: 'Death Ray',
        gridSize: 3,
        damage: 100,
        range: 18,                // +4 portée!
        fireRate: 0.05,           // Continu
        color: '#8b0000',
        cost: { iron: 1400, copper: 600, gold: 280 },

        isDeathRay: true,
        continuous: true,
        beamWidth: 10,
        beamColor: '#ff0000',
        coreColor: '#ffff00',
        heatBuildup: true,        // Surchauffe visuelle
        maxHeat: 100,

        size: 2.8,
        health: 380,
        maxHealth: 380
    },
    'turret-missile-battery': {
        name: 'Missile Battery',
        gridSize: 3,
        damage: 70,               // Plus de dégâts par missile
        range: 24,                // Longue portée
        fireRate: 2.0,            // Cadence équilibrée
        color: '#556b2f',
        cost: { iron: 1200, copper: 500, gold: 200 },
        projectileSpeed: 14,      // Missiles fluides
        projectileColor: '#9acd32',

        isMissileBattery: true,
        missileCount: 8,          // Réduit pour performance
        isMissile: true,
        homingStrength: 0.25,     // Guidage
        salvoDelay: 0.06,         // Salve satisfaisante
        spreadRadius: 2.5,        // Missiles dispersés autour de la cible
        trailColor: '#adff2f',
        explosionRadius: 2.0,     // Grosses explosions!

        size: 2.8,
        health: 520,
        maxHealth: 520
    },
    'turret-orbital': {
        name: 'Orbital Strike',
        gridSize: 3,
        damage: 500,              // DEVASTATEUR!
        range: 40,                // +10 portée MASSIVE!
        minRange: 3,
        fireRate: 4.0,            // Plus rapide!
        color: '#ffd700',
        cost: { iron: 2500, copper: 1000, gold: 500 },

        isOrbital: true,
        strikeDelay: 1.0,         // Délai réduit!
        strikeRadius: 6,          // +1 rayon de frappe!
        beamFromSky: true,
        warningColor: '#ff0000',
        strikeColor: '#ffffff',

        size: 2.8,
        health: 400,
        maxHealth: 400
    }
};
