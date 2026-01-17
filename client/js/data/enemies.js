export const ENEMY_TYPES = {
    'grunt': {
        name: 'Grunt',
        health: 50,
        speed: 1,
        damage: 10,
        color: '#ff4444',
        size: 0.6,
        reward: { iron: 5 }
    },
    'runner': {
        name: 'Runner',
        health: 30,
        speed: 2,
        damage: 5,
        color: '#ff8844',
        size: 0.5,
        reward: { iron: 3 }
    },
    'tank': {
        name: 'Tank',
        health: 300,
        speed: 0.5,
        damage: 30,
        color: '#aa2222',
        size: 0.9,
        armor: 0.5, // 50% damage reduction
        reward: { iron: 20, copper: 5 }
    },
    'kamikaze': {
        name: 'Kamikaze',
        health: 20,
        speed: 2.5,
        damage: 100,
        color: '#ffaa00',
        size: 0.5,
        explodeOnDeath: true,
        explosionRadius: 1.5,
        reward: { iron: 8 }
    },
    'healer': {
        name: 'Healer',
        health: 80,
        speed: 1,
        damage: 0,
        color: '#44ff44',
        size: 0.6,
        healAmount: 5,
        healRange: 2,
        healRate: 1,
        reward: { iron: 15, copper: 5 }
    },
    'boss': {
        name: 'Boss',
        health: 2000,
        speed: 0.3,
        damage: 100,
        color: '#880088',
        size: 1.5,
        spawnMinions: true,
        minionType: 'grunt',
        minionCount: 3,
        minionRate: 5,
        reward: { iron: 100, copper: 50, gold: 20 }
    }
};
