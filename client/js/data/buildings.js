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

// Wall upgrade paths
export const WALL_UPGRADES = {
    'wall': {
        levels: {
            1: {
                cost: { iron: 30 },
                healthBonus: 100,
                color: '#634545',
                name: 'Mur +1'
            },
            2: {
                cost: { iron: 50, copper: 10 },
                healthBonus: 150,
                color: '#735555',
                name: 'Mur +2'
            },
            3: {
                cost: { iron: 80, copper: 25 },
                healthBonus: 200,
                color: '#836565',
                name: 'Mur +3'
            },
            4: {
                cost: { iron: 120, copper: 40, gold: 10 },
                healthBonus: 300,
                color: '#937575',
                name: 'Mur +4'
            },
            5: {
                cost: { iron: 200, copper: 60, gold: 25 },
                healthBonus: 500,
                color: '#a38585',
                name: 'Mur +5'
            }
        }
    },
    'wall-reinforced': {
        levels: {
            1: {
                cost: { iron: 60, copper: 30 },
                healthBonus: 200,
                color: '#7b5433',
                name: 'Mur Renforcé +1'
            },
            2: {
                cost: { iron: 100, copper: 50 },
                healthBonus: 300,
                color: '#8b6443',
                name: 'Mur Renforcé +2'
            },
            3: {
                cost: { iron: 150, copper: 75, gold: 15 },
                healthBonus: 400,
                color: '#9b7453',
                name: 'Mur Renforcé +3'
            },
            4: {
                cost: { iron: 200, copper: 100, gold: 30 },
                healthBonus: 600,
                color: '#ab8463',
                name: 'Mur Renforcé +4'
            },
            5: {
                cost: { iron: 300, copper: 150, gold: 50 },
                healthBonus: 1000,
                color: '#bb9473',
                name: 'Mur Renforcé +5'
            }
        }
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
