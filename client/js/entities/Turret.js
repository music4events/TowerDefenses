import { TURRET_TYPES } from '../data/turrets.js';

export class Turret {
    constructor(gridX, gridY, type, grid) {
        this.grid = grid;
        this.type = type;
        this.config = { ...TURRET_TYPES[type] }; // Copy config for upgrades
        this.baseConfig = TURRET_TYPES[type]; // Keep original

        const worldPos = grid.gridToWorld(gridX, gridY);
        this.x = worldPos.x;
        this.y = worldPos.y;
        this.gridX = gridX;
        this.gridY = gridY;

        this.angle = 0;
        this.target = null;
        this.cooldown = 0;

        this.level = 1;
        this.maxLevel = 5;
        this.totalInvested = this.calculateTotalCost(this.baseConfig.cost);

        this.range = this.config.range * grid.cellSize;
    }

    calculateTotalCost(cost) {
        let total = 0;
        for (const amount of Object.values(cost)) {
            total += amount;
        }
        return total;
    }

    getUpgradeCost() {
        if (this.level >= this.maxLevel) return null;

        // Upgrade cost = 50% of base cost per level
        const multiplier = 0.5 * this.level;
        const cost = {};
        for (const [resource, amount] of Object.entries(this.baseConfig.cost)) {
            cost[resource] = Math.floor(amount * multiplier);
        }
        return cost;
    }

    upgrade() {
        if (this.level >= this.maxLevel) return false;

        this.level++;

        // Upgrade stats: +15% per level
        const bonus = 1 + (this.level - 1) * 0.15;

        this.config.damage = Math.floor(this.baseConfig.damage * bonus);
        this.config.range = this.baseConfig.range * (1 + (this.level - 1) * 0.1);
        this.config.fireRate = this.baseConfig.fireRate / (1 + (this.level - 1) * 0.1);

        this.range = this.config.range * this.grid.cellSize;

        // Track investment for sell value
        const upgradeCost = this.getUpgradeCost();
        if (upgradeCost) {
            this.totalInvested += this.calculateTotalCost(upgradeCost);
        }

        return true;
    }

    getSellValue() {
        // Return 75% of total invested (base + upgrades)
        const value = {};
        for (const [resource, amount] of Object.entries(this.baseConfig.cost)) {
            const ratio = amount / this.calculateTotalCost(this.baseConfig.cost);
            value[resource] = Math.floor(this.totalInvested * ratio * 0.75);
        }
        return value;
    }

    getStats() {
        return {
            name: this.config.name,
            level: this.level,
            damage: this.config.damage,
            range: this.config.range.toFixed(1),
            fireRate: (1 / this.config.fireRate).toFixed(1) + '/s'
        };
    }

    update(deltaTime, enemies, projectiles, game) {
        this.cooldown -= deltaTime;

        // Find target
        this.target = this.findTarget(enemies);

        if (this.target) {
            // Rotate towards target
            const dx = this.target.x - this.x;
            const dy = this.target.y - this.y;
            this.angle = Math.atan2(dy, dx);

            // Fire if ready
            if (this.cooldown <= 0) {
                this.fire(projectiles, game);
                this.cooldown = this.config.fireRate;
            }
        }
    }

    findTarget(enemies) {
        let closest = null;
        let closestDist = Infinity;

        for (const enemy of enemies) {
            if (enemy.dead) continue;

            const dist = Math.sqrt((this.x - enemy.x) ** 2 + (this.y - enemy.y) ** 2);

            if (dist <= this.range && dist < closestDist) {
                closest = enemy;
                closestDist = dist;
            }
        }

        return closest;
    }

    fire(projectiles, game) {
        if (!this.target) return;

        const projectileType = this.getProjectileType();

        if (this.config.instantHit) {
            // Laser - instant hit
            this.target.takeDamage(this.config.damage);
            projectiles.push({
                type: 'laser',
                x: this.target.x,
                y: this.target.y,
                startX: this.x,
                startY: this.y,
                config: this.config,
                life: 0.1
            });
        } else if (this.config.chainTargets) {
            // Tesla - chain lightning
            this.fireChainLightning(projectiles, game);
        } else if (this.config.continuous) {
            // Flamethrower - continuous damage
            this.fireFlame(projectiles);
        } else {
            // Standard projectile
            const dx = this.target.x - this.x;
            const dy = this.target.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            projectiles.push({
                type: projectileType,
                x: this.x,
                y: this.y,
                vx: (dx / dist) * this.config.projectileSpeed * this.grid.cellSize,
                vy: (dy / dist) * this.config.projectileSpeed * this.grid.cellSize,
                damage: this.config.damage,
                config: this.config,
                aoeRadius: this.config.aoeRadius ? this.config.aoeRadius * this.grid.cellSize : 0,
                penetration: this.config.penetration || false,
                hitEnemies: []
            });
        }
    }

    fireChainLightning(projectiles, game) {
        const targets = [this.target];
        let currentTarget = this.target;

        // Find chain targets
        for (let i = 1; i < this.config.chainTargets; i++) {
            const chainRange = this.config.chainRange * this.grid.cellSize;
            let nextTarget = null;
            let closestDist = Infinity;

            for (const enemy of game.enemies) {
                if (enemy.dead || targets.includes(enemy)) continue;

                const dist = Math.sqrt(
                    (currentTarget.x - enemy.x) ** 2 +
                    (currentTarget.y - enemy.y) ** 2
                );

                if (dist <= chainRange && dist < closestDist) {
                    nextTarget = enemy;
                    closestDist = dist;
                }
            }

            if (nextTarget) {
                targets.push(nextTarget);
                currentTarget = nextTarget;
            } else {
                break;
            }
        }

        // Apply damage and create visual effects
        let prevX = this.x;
        let prevY = this.y;

        for (const target of targets) {
            target.takeDamage(this.config.damage);

            projectiles.push({
                type: 'tesla',
                x: target.x,
                y: target.y,
                startX: prevX,
                startY: prevY,
                config: this.config,
                life: 0.15
            });

            prevX = target.x;
            prevY = target.y;
        }
    }

    fireFlame(projectiles) {
        // Create flame particles
        const spread = 0.3;
        const baseAngle = this.angle;

        for (let i = 0; i < 3; i++) {
            const angle = baseAngle + (Math.random() - 0.5) * spread;
            const speed = this.config.projectileSpeed || 5;

            projectiles.push({
                type: 'flame',
                x: this.x,
                y: this.y,
                vx: Math.cos(angle) * speed * this.grid.cellSize,
                vy: Math.sin(angle) * speed * this.grid.cellSize,
                damage: this.config.damage * 0.1,
                config: this.config,
                life: 0.3,
                dotDamage: this.config.dotDamage,
                dotDuration: this.config.dotDuration
            });
        }
    }

    getProjectileType() {
        if (this.type.includes('artillery')) return 'artillery';
        if (this.type.includes('sniper')) return 'sniper';
        return 'bullet';
    }

    getRange() {
        return this.range;
    }
}
