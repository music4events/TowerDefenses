import { TURRET_TYPES } from '../data/turrets.js';

export class Turret {
    constructor(gridX, gridY, type, grid) {
        this.grid = grid;
        this.type = type;
        this.config = { ...TURRET_TYPES[type] };
        this.baseConfig = TURRET_TYPES[type];

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

        // Health system
        this.health = this.config.health || 100;
        this.maxHealth = this.config.maxHealth || this.config.health || 100;
        this.destroyed = false;

        // Healer turret
        this.healTargets = [];

        // Drone turret
        if (this.config.isDrone) {
            this.homeX = this.x;
            this.homeY = this.y;
            this.droneX = this.x;
            this.droneY = this.y;
            this.patrolAngle = 0;
            this.patrolRadius = (this.config.patrolRadius || 4) * grid.cellSize;
        }
    }

    calculateTotalCost(cost) {
        let total = 0;
        for (const amount of Object.values(cost)) {
            total += amount;
        }
        return total;
    }

    // Health methods
    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            this.destroyed = true;
        }
    }

    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }

    isDestroyed() {
        return this.destroyed || this.health <= 0;
    }

    getUpgradeCost() {
        if (this.level >= this.maxLevel) return null;
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
        const bonus = 1 + (this.level - 1) * 0.15;

        this.config.damage = Math.floor(this.baseConfig.damage * bonus);
        this.config.range = this.baseConfig.range * (1 + (this.level - 1) * 0.1);
        this.config.fireRate = this.baseConfig.fireRate / (1 + (this.level - 1) * 0.1);

        // Upgrade health too
        this.maxHealth = Math.floor((this.baseConfig.maxHealth || 100) * bonus);
        this.health = Math.min(this.health + 20, this.maxHealth);

        this.range = this.config.range * this.grid.cellSize;

        const upgradeCost = this.getUpgradeCost();
        if (upgradeCost) {
            this.totalInvested += this.calculateTotalCost(upgradeCost);
        }

        return true;
    }

    getSellValue() {
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
            fireRate: (1 / this.config.fireRate).toFixed(1) + '/s',
            health: this.health,
            maxHealth: this.maxHealth
        };
    }

    update(deltaTime, enemies, projectiles, game) {
        if (this.isDestroyed()) return;

        this.cooldown -= deltaTime;

        // Healer turret - heals other turrets
        if (this.config.isHealer) {
            this.updateHealer(deltaTime, game);
            return;
        }

        // Slowdown turret - slows enemies in range
        if (this.config.isSlowdown) {
            this.updateSlowdown(deltaTime, enemies);
            return;
        }

        // Drone turret - moves around
        if (this.config.isDrone) {
            this.updateDrone(deltaTime, enemies);
        }

        // Find target
        this.target = this.findTarget(enemies);

        if (this.target) {
            // Rotate towards target
            const dx = this.target.x - this.x;
            const dy = this.target.y - this.y;
            this.angle = Math.atan2(dy, dx);

            if (this.cooldown <= 0) {
                this.fire(projectiles, game);
                this.cooldown = this.config.fireRate;
            }
        }
    }

    updateHealer(deltaTime, game) {
        this.healTargets = [];
        if (this.cooldown <= 0) {
            this.cooldown = this.config.fireRate;

            for (const turret of game.turrets) {
                if (turret === this) continue;
                if (turret.isDestroyed()) continue;
                if (turret.health >= turret.maxHealth) continue;

                const dist = Math.sqrt((this.x - turret.x) ** 2 + (this.y - turret.y) ** 2);
                if (dist <= this.range) {
                    turret.heal(this.config.healAmount || 10);
                    this.healTargets.push(turret);
                }
            }
        }
    }

    updateSlowdown(deltaTime, enemies) {
        const slowRange = (this.config.aoeRange || this.config.range) * this.grid.cellSize;

        for (const enemy of enemies) {
            if (enemy.dead) continue;
            const dist = Math.sqrt((this.x - enemy.x) ** 2 + (this.y - enemy.y) ** 2);
            if (dist <= slowRange) {
                enemy.frosted = true;
                if (enemy.applySlow) {
                    enemy.applySlow(this.config.slowAmount || 0.5);
                } else {
                    enemy.slowMultiplier = this.config.slowAmount || 0.5;
                }
            }
        }
    }

    updateDrone(deltaTime, enemies) {
        this.patrolAngle += deltaTime * 0.5;

        if (this.target && !this.target.dead) {
            // Move towards target
            const dx = this.target.x - this.droneX;
            const dy = this.target.y - this.droneY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > this.range * 0.5) {
                const moveSpeed = (this.config.moveSpeed || 2) * this.grid.cellSize * deltaTime;
                const newX = this.droneX + (dx / dist) * moveSpeed;
                const newY = this.droneY + (dy / dist) * moveSpeed;

                const distFromHome = Math.sqrt((newX - this.homeX) ** 2 + (newY - this.homeY) ** 2);
                if (distFromHome <= this.patrolRadius) {
                    this.droneX = newX;
                    this.droneY = newY;
                }
            }
        } else {
            // Circular patrol
            this.droneX = this.homeX + Math.cos(this.patrolAngle) * this.patrolRadius * 0.5;
            this.droneY = this.homeY + Math.sin(this.patrolAngle) * this.patrolRadius * 0.5;
        }

        // Update turret position for firing
        this.x = this.droneX;
        this.y = this.droneY;
    }

    findTarget(enemies) {
        let closest = null;
        let closestDist = Infinity;
        const minRange = (this.config.minRange || 0) * this.grid.cellSize;

        for (const enemy of enemies) {
            if (enemy.dead) continue;

            // Anti-air turrets only target flying enemies
            if (this.config.isAntiAir) {
                if (!enemy.config?.isFlying) continue;
            }

            const dist = Math.sqrt((this.x - enemy.x) ** 2 + (this.y - enemy.y) ** 2);

            // Check minimum range (for mortar)
            if (dist < minRange) continue;

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

        // FLAK Anti-Air - rain of projectiles
        if (this.config.flakCount) {
            this.fireFlak(projectiles);
            return;
        }

        // Shotgun - multiple pellets
        if (this.config.pelletCount) {
            this.fireShotgun(projectiles);
            return;
        }

        // Multi-Artillery - multiple shells
        if (this.config.shellCount) {
            this.fireMultiArtillery(projectiles);
            return;
        }

        // Railgun - piercing beam
        if (this.config.piercingBeam) {
            this.fireRailgun(projectiles, game);
            return;
        }

        if (this.config.instantHit) {
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
            this.fireChainLightning(projectiles, game);
        } else if (this.config.continuous) {
            this.fireFlame(projectiles);
        } else {
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
                sourceX: this.x,
                sourceY: this.y,
                hitEnemies: []
            });
        }
    }

    fireShotgun(projectiles) {
        const pellets = this.config.pelletCount || 6;
        const spread = this.config.spreadAngle || 0.5;
        const baseAngle = this.angle;

        for (let i = 0; i < pellets; i++) {
            const pelletAngle = baseAngle + (i - (pellets - 1) / 2) * (spread / (pellets - 1));
            const speed = (this.config.projectileSpeed || 12) * this.grid.cellSize;

            projectiles.push({
                type: 'pellet',
                x: this.x,
                y: this.y,
                vx: Math.cos(pelletAngle) * speed,
                vy: Math.sin(pelletAngle) * speed,
                damage: this.config.damage,
                config: this.config,
                sourceX: this.x,
                sourceY: this.y,
                hitEnemies: []
            });
        }
    }

    fireMultiArtillery(projectiles) {
        const shells = this.config.shellCount || 3;
        const spread = (this.config.shellSpread || 1.5) * this.grid.cellSize;

        for (let i = 0; i < shells; i++) {
            const offsetX = (Math.random() - 0.5) * spread;
            const offsetY = (Math.random() - 0.5) * spread;
            const targetX = this.target.x + offsetX;
            const targetY = this.target.y + offsetY;

            const dx = targetX - this.x;
            const dy = targetY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            projectiles.push({
                type: 'artillery',
                x: this.x,
                y: this.y,
                vx: (dx / dist) * (this.config.projectileSpeed || 7) * this.grid.cellSize,
                vy: (dy / dist) * (this.config.projectileSpeed || 7) * this.grid.cellSize,
                damage: this.config.damage,
                config: this.config,
                aoeRadius: (this.config.aoeRadius || 1.5) * this.grid.cellSize,
                sourceX: this.x,
                sourceY: this.y,
                hitEnemies: []
            });
        }
    }

    fireRailgun(projectiles, game) {
        const beamEndX = this.x + Math.cos(this.angle) * this.range;
        const beamEndY = this.y + Math.sin(this.angle) * this.range;

        // Hit all enemies in line
        for (const enemy of game.enemies) {
            if (enemy.dead) continue;

            const dist = this.pointToLineDistance(
                enemy.x, enemy.y,
                this.x, this.y,
                beamEndX, beamEndY
            );

            const enemySize = (enemy.config?.size || 0.6) * this.grid.cellSize / 2;
            if (dist <= enemySize + 5) {
                enemy.takeDamage(this.config.damage);
            }
        }

        // Visual beam
        projectiles.push({
            type: 'railgun',
            x: beamEndX,
            y: beamEndY,
            startX: this.x,
            startY: this.y,
            config: this.config,
            life: 0.2
        });
    }

    pointToLineDistance(px, py, x1, y1, x2, y2) {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;

        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;

        if (lenSq !== 0) param = dot / lenSq;

        let xx, yy;
        if (param < 0) { xx = x1; yy = y1; }
        else if (param > 1) { xx = x2; yy = y2; }
        else { xx = x1 + param * C; yy = y1 + param * D; }

        return Math.sqrt((px - xx) ** 2 + (py - yy) ** 2);
    }

    fireChainLightning(projectiles, game) {
        const targets = [this.target];
        let currentTarget = this.target;

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

    fireFlak(projectiles) {
        const flakCount = this.config.flakCount || 12;
        const spreadRadius = (this.config.flakSpread || 1.5) * this.grid.cellSize;
        const barrels = this.config.barrelCount || 2;
        const speed = (this.config.projectileSpeed || 25) * this.grid.cellSize;

        // Offset for double barrel (left and right of center)
        const barrelOffset = this.grid.cellSize * 0.3;

        for (let i = 0; i < flakCount; i++) {
            // Alternate between barrels
            const barrelSide = (i % barrels === 0) ? -1 : 1;
            const perpAngle = this.angle + Math.PI / 2;

            // Starting position from one of the barrels
            const startX = this.x + Math.cos(perpAngle) * barrelOffset * barrelSide;
            const startY = this.y + Math.sin(perpAngle) * barrelOffset * barrelSide;

            // Target position with random spread
            const spreadAngle = Math.random() * Math.PI * 2;
            const spreadDist = Math.random() * spreadRadius;
            const targetX = this.target.x + Math.cos(spreadAngle) * spreadDist;
            const targetY = this.target.y + Math.sin(spreadAngle) * spreadDist;

            const dx = targetX - startX;
            const dy = targetY - startY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Small delay between projectiles for rain effect
            const delay = (i / flakCount) * 0.2;

            projectiles.push({
                type: 'flak',
                x: startX,
                y: startY,
                vx: (dx / dist) * speed,
                vy: (dy / dist) * speed,
                damage: this.config.damage,
                config: this.config,
                sourceX: startX,
                sourceY: startY,
                targetX: targetX,
                targetY: targetY,
                hitEnemies: [],
                delay: delay,
                life: 1.0
            });
        }
    }

    getProjectileType() {
        if (this.type.includes('artillery')) return 'artillery';
        if (this.type.includes('sniper')) return 'sniper';
        if (this.type.includes('mortar')) return 'artillery';
        return 'bullet';
    }

    getRange() {
        return this.range;
    }
}
