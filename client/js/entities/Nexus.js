export class Nexus {
    constructor(x, y, cellSize) {
        this.x = x;
        this.y = y;
        this.gridX = Math.floor(x / cellSize);
        this.gridY = Math.floor(y / cellSize);
        this.radius = cellSize * 1.2;
        this.maxHealth = 1000;
        this.health = this.maxHealth;
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
}
