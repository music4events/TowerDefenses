export const BUILDING_TYPES = {
    'wall': {
        name: 'Mur',
        health: 200,
        color: '#533535',
        cost: { iron: 20 },
        blocking: true,
        size: 1
    },
    'wall-reinforced': {
        name: 'Mur Renforcé',
        health: 500,
        color: '#6b4423',
        cost: { iron: 50, copper: 20 },
        blocking: true,
        size: 1
    },
    'extractor': {
        name: 'Foreuse',
        health: 100,
        color: '#8b9dc3',
        cost: { iron: 50 },
        extractionRate: 1, // per second
        size: 1,
        requiresResource: true
    },
    'smelter': {
        name: 'Fonderie',
        health: 150,
        color: '#cc5500',
        cost: { iron: 100, coal: 20 },
        processRate: 0.5,
        size: 2
    },
    'generator': {
        name: 'Générateur',
        health: 120,
        color: '#ffcc00',
        cost: { iron: 80, coal: 50 },
        energyOutput: 10,
        size: 2
    }
};

export const RESOURCE_TYPES = {
    'iron': {
        name: 'Fer',
        color: '#8b9dc3',
        bgColor: '#4a5568'
    },
    'copper': {
        name: 'Cuivre',
        color: '#e07b39',
        bgColor: '#7c4a1a'
    },
    'coal': {
        name: 'Charbon',
        color: '#2d2d2d',
        bgColor: '#1a1a1a'
    },
    'gold': {
        name: 'Or',
        color: '#ffd700',
        bgColor: '#8b7500'
    }
};
