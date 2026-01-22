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
        const baseRate = this.extractionRate || 1;
        const effectiveRate = this.effectiveRate || baseRate;
        const nexusBonus = this.nexusMineBonus || 0;
        const hasNexusBonus = nexusBonus > 0;

        return {
            name: `Mine de ${this.resourceType}`,
            level: this.level,
            maxLevel: this.maxLevel,
            health: this.health,
            maxHealth: this.maxHealth,
            extractionRate: baseRate.toFixed(2),
            effectiveRate: effectiveRate.toFixed(2),
            hasNexusBonus: hasNexusBonus,
            nexusBonusPercent: Math.round(nexusBonus * 100),
            stored: Math.floor(this.stored || 0),
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
        // +50% extraction rate per level (level 100: 50.5/s)
        this.extractionRate = 1 + (this.level - 1) * 0.50;
        // +40 max storage per level
        this.maxStorage = 50 + (this.level - 1) * 40;
        // +20 max health per level
        this.maxHealth = 100 + (this.level - 1) * 20;
        this.health = Math.min(this.health + 20, this.maxHealth);

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
