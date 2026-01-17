export const TURRET_TYPES = {
    'turret-mg': {
        name: 'Mitrailleuse',
        damage: 5,
        range: 4,
        fireRate: 0.1, // seconds between shots
        color: '#4a9eff',
        cost: { iron: 100 },
        projectileSpeed: 15,
        projectileColor: '#ffff00',
        size: 0.8
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
        size: 0.7
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
        size: 0.9
    },
    'turret-flamethrower': {
        name: 'Lance-flammes',
        damage: 15,
        range: 3,
        fireRate: 0.05,
        color: '#e74c3c',
        cost: { iron: 150, coal: 30 },
        continuous: true,
        dotDamage: 5,
        dotDuration: 2,
        size: 0.8
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
        size: 0.85
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
        size: 0.75
    }
};
