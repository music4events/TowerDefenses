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

// Helper function to interpolate color from dark to bright
function getWallColor(level, maxLevel = 100) {
    // Start: dark brown (#533535), End: golden (#ffd700)
    const t = level / maxLevel;

    // Color progression: brown -> orange -> gold
    let r, g, b;

    if (t < 0.5) {
        // Brown to orange (0-50)
        const t2 = t * 2;
        r = Math.floor(83 + (255 - 83) * t2);  // 83 -> 255
        g = Math.floor(53 + (165 - 53) * t2);  // 53 -> 165
        b = Math.floor(53 + (0 - 53) * t2);    // 53 -> 0
    } else {
        // Orange to gold (50-100)
        const t2 = (t - 0.5) * 2;
        r = 255;
        g = Math.floor(165 + (215 - 165) * t2); // 165 -> 215
        b = Math.floor(0 + (0) * t2);            // 0 -> 0
    }

    return `rgb(${r}, ${g}, ${b})`;
}

// Generate wall upgrade cost based on level
function getWallUpgradeCost(level, isReinforced = false) {
    const baseMult = isReinforced ? 1.5 : 1;

    // Iron: base 20, increases each level
    const iron = Math.floor((20 + level * 15) * baseMult * (1 + level * 0.02));

    // Copper: starts at level 10
    let copper = 0;
    if (level >= 10) {
        copper = Math.floor((10 + (level - 10) * 8) * baseMult * (1 + level * 0.015));
    }

    // Gold: starts at level 30
    let gold = 0;
    if (level >= 30) {
        gold = Math.floor((5 + (level - 30) * 4) * baseMult * (1 + level * 0.01));
    }

    const cost = { iron };
    if (copper > 0) cost.copper = copper;
    if (gold > 0) cost.gold = gold;

    return cost;
}

// Generate health bonus based on level
function getWallHealthBonus(level, isReinforced = false) {
    const baseMult = isReinforced ? 1.5 : 1;
    // Health bonus grows exponentially: 50 * (1.08 ^ level)
    return Math.floor(50 * Math.pow(1.08, level) * baseMult);
}

// Generate 100 levels dynamically
function generateWallLevels(isReinforced = false) {
    const levels = {};
    const prefix = isReinforced ? 'Mur Renforcé' : 'Mur';

    for (let level = 1; level <= 100; level++) {
        levels[level] = {
            cost: getWallUpgradeCost(level, isReinforced),
            healthBonus: getWallHealthBonus(level, isReinforced),
            color: getWallColor(level),
            name: `${prefix} +${level}`
        };
    }

    return levels;
}

// Wall upgrade paths - 100 levels each
export const WALL_UPGRADES = {
    'wall': {
        maxLevel: 100,
        levels: generateWallLevels(false)
    },
    'wall-reinforced': {
        maxLevel: 100,
        levels: generateWallLevels(true)
    }
};

// Helper functions exported for use elsewhere
export function getWallUpgradeInfo(wallType, level) {
    const upgrades = WALL_UPGRADES[wallType] || WALL_UPGRADES['wall'];
    return upgrades.levels[level] || null;
}

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
