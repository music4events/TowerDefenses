import { BUILDING_TYPES, WALL_UPGRADES } from '../data/buildings.js';

export class Wall {
    constructor(gridX, gridY, type, grid) {
        this.grid = grid;
        this.type = type;
        this.config = BUILDING_TYPES[type] || BUILDING_TYPES['wall'];

        const worldPos = grid.gridToWorld(gridX, gridY);
        this.x = worldPos.x;
        this.y = worldPos.y;
        this.gridX = gridX;
        this.gridY = gridY;

        this.maxHealth = this.config.health;
        this.health = this.maxHealth;

        // Upgrade level (0 = base, up to 5)
        this.level = 0;
        this.maxLevel = 5;
    }

    takeDamage(amount) {
        this.health -= amount;
        return this.health <= 0;
    }

    isDestroyed() {
        return this.health <= 0;
    }

    // Get upgrade cost for next level
    getUpgradeCost() {
        if (this.level >= this.maxLevel) return null;

        const upgrades = WALL_UPGRADES[this.type] || WALL_UPGRADES['wall'];
        return upgrades.levels[this.level + 1]?.cost || null;
    }

    // Get stats for next level
    getNextLevelStats() {
        if (this.level >= this.maxLevel) return null;

        const upgrades = WALL_UPGRADES[this.type] || WALL_UPGRADES['wall'];
        return upgrades.levels[this.level + 1] || null;
    }

    // Upgrade the wall
    upgrade() {
        if (this.level >= this.maxLevel) return false;

        const upgrades = WALL_UPGRADES[this.type] || WALL_UPGRADES['wall'];
        const nextLevel = upgrades.levels[this.level + 1];

        if (!nextLevel) return false;

        this.level++;

        // Increase max health
        const healthIncrease = nextLevel.healthBonus;
        this.maxHealth += healthIncrease;

        // Heal to new max (or just add the bonus HP)
        this.health = Math.min(this.health + healthIncrease, this.maxHealth);

        return true;
    }

    // Get current level display name
    getLevelName() {
        if (this.level === 0) return this.config.name;
        return `${this.config.name} +${this.level}`;
    }

    // Get color based on level
    getColor() {
        const upgrades = WALL_UPGRADES[this.type] || WALL_UPGRADES['wall'];
        if (this.level > 0 && upgrades.levels[this.level]?.color) {
            return upgrades.levels[this.level].color;
        }
        return this.config.color;
    }

    // Serialize for network
    serialize() {
        return {
            gridX: this.gridX,
            gridY: this.gridY,
            type: this.type,
            health: this.health,
            maxHealth: this.maxHealth,
            level: this.level
        };
    }

    // Apply state from server
    applyState(state) {
        this.health = state.health;
        this.maxHealth = state.maxHealth;
        this.level = state.level || 0;
    }
}
