import { BUILDING_TYPES } from '../data/buildings.js';

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
    }

    takeDamage(amount) {
        this.health -= amount;
        return this.health <= 0;
    }

    isDestroyed() {
        return this.health <= 0;
    }
}
