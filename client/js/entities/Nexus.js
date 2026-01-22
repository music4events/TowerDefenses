export class Nexus {
    constructor(x, y, cellSize) {
        this.x = x;
        this.y = y;
        this.gridX = Math.floor(x / cellSize);
        this.gridY = Math.floor(y / cellSize);
        this.radius = cellSize * 1.2;
        this.maxHealth = 1000;
        this.health = this.maxHealth;

        // Upgrade system
        this.level = 1;
        this.maxLevel = 50;

        // Bonuses applied to all turrets
        this.damageBonus = 0;
        this.rangeBonus = 0;
        this.fireRateBonus = 0;
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health < 0) this.health = 0;
        return this.health <= 0;
    }

    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }

    isDestroyed() {
        return this.health <= 0;
    }

    getHealthPercent() {
        return this.health / this.maxHealth;
    }

    getStats() {
        return {
            name: 'Nexus',
            level: this.level,
            maxLevel: this.maxLevel,
            health: this.health,
            maxHealth: this.maxHealth,
            damageBonus: Math.round(this.damageBonus * 100),
            rangeBonus: Math.round(this.rangeBonus * 100),
            fireRateBonus: Math.round(this.fireRateBonus * 100)
        };
    }

    getUpgradeCost() {
        if (this.level >= this.maxLevel) return null;
        return {
            iron: 200 + this.level * 100,
            copper: 50 + this.level * 50,
            gold: 20 + this.level * 20
        };
    }
}
