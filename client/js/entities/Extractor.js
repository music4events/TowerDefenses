import { BUILDING_TYPES } from '../data/buildings.js';

export class Extractor {
    constructor(gridX, gridY, resourceType, grid) {
        this.grid = grid;
        this.config = BUILDING_TYPES['extractor'];
        this.resourceType = resourceType;

        const worldPos = grid.gridToWorld(gridX, gridY);
        this.x = worldPos.x;
        this.y = worldPos.y;
        this.gridX = gridX;
        this.gridY = gridY;

        this.maxHealth = this.config.health;
        this.health = this.maxHealth;

        this.extractionRate = this.config.extractionRate || 1;
        this.extractionTimer = 0;
        this.stored = 0;
        this.maxStorage = 50;
    }

    update(deltaTime) {
        this.extractionTimer += deltaTime;

        if (this.extractionTimer >= 1 / this.extractionRate) {
            this.extractionTimer = 0;
            if (this.stored < this.maxStorage) {
                this.stored++;
            }
        }
    }

    collect() {
        const amount = this.stored;
        this.stored = 0;
        return { type: this.resourceType, amount };
    }

    takeDamage(amount) {
        this.health -= amount;
        return this.health <= 0;
    }

    isDestroyed() {
        return this.health <= 0;
    }
}
