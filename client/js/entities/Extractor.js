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

        // Upgrade system
        this.level = 1;
        this.maxLevel = 100;
    }

    getStats() {
        return {
            name: `Mine de ${this.resourceType}`,
            level: this.level,
            maxLevel: this.maxLevel,
            health: this.health,
            maxHealth: this.maxHealth,
            extractionRate: this.extractionRate.toFixed(2),
            stored: this.stored,
            maxStorage: this.maxStorage,
            resourceType: this.resourceType
        };
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

    upgrade() {
        if (this.level >= this.maxLevel) return false;

        this.level++;
        // +50% extraction rate per level
        this.extractionRate = (this.config.extractionRate || 1) * (1 + (this.level - 1) * 0.5);
        // +20 max storage per level
        this.maxStorage = 50 + (this.level - 1) * 20;

        return true;
    }

    getUpgradeCost() {
        if (this.level >= this.maxLevel) return null;
        return { iron: 30 + this.level * 10 };
    }

    getSellValue() {
        // 75% refund scaled by level
        const baseCost = this.config.cost?.iron || 50;
        const refundMultiplier = 0.75 * (1 + (this.level - 1) * 0.5);
        return { iron: Math.floor(baseCost * refundMultiplier) };
    }
}
