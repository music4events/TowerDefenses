import { TURRET_TYPES } from '../data/turrets.js';

export class Turret {
    constructor(gridX, gridY, type, grid) {
        this.grid = grid;
        this.type = type;
        this.config = { ...TURRET_TYPES[type] };
        this.baseConfig = TURRET_TYPES[type];

        // Calculate world position based on grid size
        const gridSize = this.config.gridSize || 1;
        let worldPos;
        if (gridSize > 1) {
            // Multi-cell turret: use gridToWorldMulti for proper centering
            worldPos = grid.gridToWorldMulti(gridX, gridY, gridSize);
        } else {
            worldPos = grid.gridToWorld(gridX, gridY);
        }
        this.x = worldPos.x;
        this.y = worldPos.y;
        this.gridX = gridX;
        this.gridY = gridY;

        this.angle = 0;
        this.target = null;
        this.cooldown = 0;

        this.level = 1;
        this.maxLevel = 100;
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
        const levelBonus = this.level - 1;

        // +2% of base damage per level (level 100: base * 2.98)
        this.config.damage = Math.floor(this.baseConfig.damage * (1 + levelBonus * 0.02));

        // +1% of base range per level (level 100: base * 1.99)
        this.config.range = this.baseConfig.range * (1 + levelBonus * 0.01);

        // -0.5% fire rate per level (level 100: ~33% faster)
        const fireRateBonus = 1 + levelBonus * 0.005;
        this.config.fireRate = Math.max(0.02, this.baseConfig.fireRate / fireRateBonus);

        // +2% of base health per level
        this.maxHealth = Math.floor((this.baseConfig.maxHealth || 100) * (1 + levelBonus * 0.02));
        this.health = Math.min(this.health + 10, this.maxHealth);

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
        // Calculate boosted values
        const rangeMult = 1 + (this.rangeBoostAmount || 0);
        const damageMult = 1 + (this.damageBoostAmount || 0);
        const speedMult = 1 + (this.speedBoostAmount || 0);

        const boostedDamage = Math.floor(this.config.damage * damageMult);
        const boostedRange = this.config.range * rangeMult;
        const boostedFireRate = this.config.fireRate / speedMult;

        return {
            name: this.config.name,
            level: this.level,
            maxLevel: this.maxLevel,
            damage: this.config.damage,
            boostedDamage: boostedDamage,
            range: this.config.range.toFixed(1),
            boostedRange: boostedRange.toFixed(1),
            fireRate: (1 / this.config.fireRate).toFixed(1) + '/s',
            boostedFireRate: (1 / boostedFireRate).toFixed(1) + '/s',
            health: this.health,
            maxHealth: this.maxHealth,
            // Boost flags
            speedBoosted: this.speedBoosted || false,
            damageBoosted: this.damageBoosted || false,
            rangeBoosted: this.rangeBoosted || false
        };
    }

    update(deltaTime, enemies, projectiles, game) {
        if (this.isDestroyed()) return;

        // Apply speed boost to cooldown reduction
        const speedMult = 1 + (this.speedBoostAmount || 0);
        this.cooldown -= deltaTime * speedMult;

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
            const healAmount = this.config.healAmount || 10;
            // Apply range boost
            const rangeMult = 1 + (this.rangeBoostAmount || 0);
            const boostedRange = this.range * rangeMult;

            // Heal turrets
            for (const turret of game.turrets) {
                if (turret === this) continue;
                if (turret.isDestroyed()) continue;
                if (turret.health >= turret.maxHealth) continue;

                const dist = Math.sqrt((this.x - turret.x) ** 2 + (this.y - turret.y) ** 2);
                if (dist <= boostedRange) {
                    turret.heal(healAmount);
                    this.healTargets.push(turret);
                }
            }

            // Heal walls
            for (const wall of game.walls) {
                if (!wall || wall.health <= 0) continue;
                if (wall.health >= (wall.maxHealth || 200)) continue;

                const dist = Math.sqrt((this.x - wall.x) ** 2 + (this.y - wall.y) ** 2);
                if (dist <= boostedRange) {
                    wall.health = Math.min(wall.maxHealth || 200, wall.health + healAmount);
                    this.healTargets.push(wall);
                }
            }
        }
    }

    updateSlowdown(deltaTime, enemies) {
        // Apply range boost
        const rangeMult = 1 + (this.rangeBoostAmount || 0);
        const slowRange = (this.config.aoeRange || this.config.range) * this.grid.cellSize * rangeMult;

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

        // Apply range boost
        const rangeMult = 1 + (this.rangeBoostAmount || 0);
        const boostedRange = this.range * rangeMult;

        if (this.target && !this.target.dead) {
            // Move towards target
            const dx = this.target.x - this.droneX;
            const dy = this.target.y - this.droneY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > boostedRange * 0.5) {
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
        // Apply range boost
        const rangeMult = 1 + (this.rangeBoostAmount || 0);
        const boostedRange = this.range * rangeMult;

        for (const enemy of enemies) {
            if (enemy.dead) continue;

            // Anti-air turrets only target flying enemies
            if (this.config.isAntiAir) {
                if (!enemy.config?.isFlying) continue;
            }

            const dist = Math.sqrt((this.x - enemy.x) ** 2 + (this.y - enemy.y) ** 2);

            // Check minimum range (for mortar)
            if (dist < minRange) continue;

            if (dist <= boostedRange && dist < closestDist) {
                closest = enemy;
                closestDist = dist;
            }
        }

        return closest;
    }

    // Get damage with boost applied
    getBoostedDamage() {
        const damageMult = 1 + (this.damageBoostAmount || 0);
        return this.config.damage * damageMult;
    }

    fire(projectiles, game) {
        if (!this.target) return;

        const projectileType = this.getProjectileType();
        const boostedDamage = this.getBoostedDamage();

        // === TOURELLES 2x2 ===
        if (this.config.isMissile && !this.config.isRocketArray && !this.config.isMissileBattery) {
            this.fireMissile(projectiles);
            return;
        }
        if (this.config.isPlasma) {
            this.firePlasma(projectiles);
            return;
        }
        if (this.config.isCryo) {
            this.fireCryo(projectiles, game);
            return;
        }
        if (this.config.isGatling) {
            this.fireGatling(projectiles);
            return;
        }
        if (this.config.isEMP) {
            this.fireEMP(projectiles, game);
            return;
        }

        // === TOURELLES 3x3 ===
        if (this.config.flakCount) {
            this.fireFlak(projectiles);
            return;
        }
        if (this.config.isMegaTesla) {
            this.fireMegaTesla(projectiles, game);
            return;
        }
        if (this.config.isMegaRailgun) {
            this.fireMegaRailgun(projectiles, game);
            return;
        }
        if (this.config.isRocketArray) {
            this.fireRocketArray(projectiles);
            return;
        }
        if (this.config.isLaserArray) {
            this.fireLaserArray(projectiles, game);
            return;
        }
        if (this.config.isParticle) {
            this.fireParticle(projectiles, game);
            return;
        }
        if (this.config.isNuclear) {
            this.fireNuclear(projectiles, game);
            return;
        }
        if (this.config.isStorm) {
            this.fireStorm(projectiles, game);
            return;
        }
        if (this.config.isDeathRay) {
            this.fireDeathRay(projectiles, game);
            return;
        }
        if (this.config.isMissileBattery) {
            this.fireMissileBattery(projectiles, game);
            return;
        }
        if (this.config.isOrbital) {
            this.fireOrbital(projectiles, game);
            return;
        }
        if (this.config.isShockwave) {
            this.fireShockwave(projectiles, game);
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
            this.target.takeDamage(boostedDamage);
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
                damage: boostedDamage,
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
        const boostedDamage = this.getBoostedDamage();

        for (let i = 0; i < pellets; i++) {
            const pelletAngle = baseAngle + (i - (pellets - 1) / 2) * (spread / (pellets - 1));
            const speed = (this.config.projectileSpeed || 12) * this.grid.cellSize;

            projectiles.push({
                type: 'pellet',
                x: this.x,
                y: this.y,
                vx: Math.cos(pelletAngle) * speed,
                vy: Math.sin(pelletAngle) * speed,
                damage: boostedDamage,
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
        const boostedDamage = this.getBoostedDamage();

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
                damage: boostedDamage,
                config: this.config,
                aoeRadius: (this.config.aoeRadius || 1.5) * this.grid.cellSize,
                sourceX: this.x,
                sourceY: this.y,
                hitEnemies: []
            });
        }
    }

    fireRailgun(projectiles, game) {
        const boostedDamage = this.getBoostedDamage();
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
                enemy.takeDamage(boostedDamage);
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
        const boostedDamage = this.getBoostedDamage();
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
            target.takeDamage(boostedDamage);

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
        const boostedDamage = this.getBoostedDamage();
        const spread = this.config.flameSpread || 0.4;
        const baseAngle = this.angle;
        const flameCount = this.config.flameCount || 5;  // Plus de particules!
        const flameLife = this.config.flameLife || 0.8;  // Durée plus longue!

        for (let i = 0; i < flameCount; i++) {
            const angle = baseAngle + (Math.random() - 0.5) * spread;
            const speed = (this.config.projectileSpeed || 6) * (0.8 + Math.random() * 0.4);
            const size = 8 + Math.random() * 12;  // Taille variable

            projectiles.push({
                type: 'flame',
                x: this.x + Math.cos(baseAngle) * this.grid.cellSize * 0.3,
                y: this.y + Math.sin(baseAngle) * this.grid.cellSize * 0.3,
                vx: Math.cos(angle) * speed * this.grid.cellSize,
                vy: Math.sin(angle) * speed * this.grid.cellSize,
                damage: boostedDamage * 0.1,
                config: this.config,
                life: flameLife * (0.7 + Math.random() * 0.6),  // Durée variable
                dotDamage: this.config.dotDamage,
                dotDuration: this.config.dotDuration,
                size: size,
                startSize: size
            });
        }
    }

    fireFlak(projectiles) {
        const boostedDamage = this.getBoostedDamage();
        const flakCount = this.config.flakCount || 16;
        const spreadRadius = (this.config.flakSpread || 3) * this.grid.cellSize;
        const barrels = this.config.barrelCount || 2;
        const speed = (this.config.projectileSpeed || 40) * this.grid.cellSize;

        const barrelOffset = this.grid.cellSize * 0.5;

        for (let i = 0; i < flakCount; i++) {
            const barrelSide = (i % barrels === 0) ? -1 : 1;
            const perpAngle = this.angle + Math.PI / 2;

            const startX = this.x + Math.cos(perpAngle) * barrelOffset * barrelSide + Math.cos(this.angle) * this.grid.cellSize * 0.8;
            const startY = this.y + Math.sin(perpAngle) * barrelOffset * barrelSide + Math.sin(this.angle) * this.grid.cellSize * 0.8;

            // Spread targets in a cone towards the enemy
            const spreadAngle = this.angle + (Math.random() - 0.5) * 0.8;
            const spreadDist = Math.random() * spreadRadius;
            const targetX = this.target.x + Math.cos(spreadAngle) * spreadDist;
            const targetY = this.target.y + Math.sin(spreadAngle) * spreadDist;

            const dx = targetX - startX;
            const dy = targetY - startY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            const delay = (i / flakCount) * 0.08;  // Very fast salvo

            projectiles.push({
                type: 'flak',
                x: startX,
                y: startY,
                vx: (dx / dist) * speed,
                vy: (dy / dist) * speed,
                damage: boostedDamage,
                config: this.config,
                sourceX: startX,
                sourceY: startY,
                targetX: targetX,
                targetY: targetY,
                hitEnemies: [],
                delay: delay,
                life: 1.2,
                // AOE explosion on impact - ALWAYS enabled
                aoeRadius: (this.config.flakExplosionRadius || 0.8) * this.grid.cellSize,
                isFlak: true
            });
        }
    }

    // === TOURELLES 2x2 ===
    fireMissile(projectiles) {
        const boostedDamage = this.getBoostedDamage();
        const missileCount = this.config.missileCount || 2;
        const speed = (this.config.projectileSpeed || 8) * this.grid.cellSize;

        for (let i = 0; i < missileCount; i++) {
            const offsetAngle = this.angle + (i - (missileCount - 1) / 2) * 0.3;
            const startX = this.x + Math.cos(offsetAngle) * this.grid.cellSize * 0.3;
            const startY = this.y + Math.sin(offsetAngle) * this.grid.cellSize * 0.3;

            const dx = this.target.x - startX;
            const dy = this.target.y - startY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            projectiles.push({
                type: 'missile',
                x: startX,
                y: startY,
                vx: (dx / dist) * speed,
                vy: (dy / dist) * speed,
                damage: boostedDamage,
                config: this.config,
                target: this.target,
                homingStrength: this.config.homingStrength || 0.15,
                aoeRadius: (this.config.explosionRadius || 1.5) * this.grid.cellSize,
                sourceX: startX,
                sourceY: startY,
                hitEnemies: [],
                life: 3.0,
                trail: []
            });
        }
    }

    firePlasma(projectiles) {
        const boostedDamage = this.getBoostedDamage();
        const speed = (this.config.projectileSpeed || 12) * this.grid.cellSize;
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        projectiles.push({
            type: 'plasma',
            x: this.x,
            y: this.y,
            vx: (dx / dist) * speed,
            vy: (dy / dist) * speed,
            damage: boostedDamage,
            config: this.config,
            aoeRadius: (this.config.aoeRadius || 1.2) * this.grid.cellSize,
            plasmaSize: this.config.plasmaSize || 15,
            sourceX: this.x,
            sourceY: this.y,
            hitEnemies: [],
            life: 2.0,
            trail: [],
            pulsePhase: 0
        });
    }

    fireCryo(projectiles, game) {
        const boostedDamage = this.getBoostedDamage();
        // Continuous beam that slows and sometimes freezes
        for (const enemy of game.enemies) {
            if (enemy.dead) continue;
            const dist = Math.sqrt((this.x - enemy.x) ** 2 + (this.y - enemy.y) ** 2);

            if (dist <= this.range) {
                enemy.takeDamage(boostedDamage * 0.1);
                if (enemy.applySlow) {
                    enemy.applySlow(this.config.slowAmount || 0.6);
                }
                enemy.frosted = true;

                // Chance to freeze completely
                if (Math.random() < (this.config.freezeChance || 0.1)) {
                    enemy.frozen = true;
                    enemy.frozenTime = 1.0;
                }
            }
        }

        // Visual beam to target
        projectiles.push({
            type: 'cryo-beam',
            x: this.target.x,
            y: this.target.y,
            startX: this.x,
            startY: this.y,
            config: this.config,
            life: 0.1,
            particles: []
        });
    }

    fireGatling(projectiles) {
        const boostedDamage = this.getBoostedDamage();
        const spread = this.config.spread || 0.15;
        const speed = (this.config.projectileSpeed || 25) * this.grid.cellSize;
        const angle = this.angle + (Math.random() - 0.5) * spread;

        projectiles.push({
            type: 'gatling',
            x: this.x + Math.cos(this.angle) * this.grid.cellSize * 0.5,
            y: this.y + Math.sin(this.angle) * this.grid.cellSize * 0.5,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            damage: boostedDamage,
            config: this.config,
            sourceX: this.x,
            sourceY: this.y,
            hitEnemies: [],
            life: 0.5
        });

        // Update spin animation
        if (!this.spinAngle) this.spinAngle = 0;
        this.spinAngle += this.config.spinSpeed || 0.5;
    }

    fireEMP(projectiles, game) {
        const boostedDamage = this.getBoostedDamage();
        const empRadius = (this.config.empRadius || 4) * this.grid.cellSize;

        // Damage and stun all enemies in radius
        for (const enemy of game.enemies) {
            if (enemy.dead) continue;
            const dist = Math.sqrt((this.x - enemy.x) ** 2 + (this.y - enemy.y) ** 2);

            if (dist <= empRadius) {
                enemy.takeDamage(boostedDamage);
                enemy.stunned = true;
                enemy.stunnedTime = this.config.stunDuration || 2.0;
            }
        }

        // EMP wave effect
        projectiles.push({
            type: 'emp-wave',
            x: this.x,
            y: this.y,
            radius: 0,
            maxRadius: empRadius,
            config: this.config,
            life: 0.5,
            waveCount: this.config.waveCount || 3
        });
    }

    // === TOURELLES 3x3 ===
    fireMegaTesla(projectiles, game) {
        const boostedDamage = this.getBoostedDamage();
        const targets = [];
        const arcCount = this.config.arcCount || 3;
        const chainTargets = this.config.chainTargets || 8;

        // Find multiple initial targets
        const sortedEnemies = [...game.enemies]
            .filter(e => !e.dead)
            .map(e => ({ enemy: e, dist: Math.sqrt((this.x - e.x) ** 2 + (this.y - e.y) ** 2) }))
            .filter(e => e.dist <= this.range)
            .sort((a, b) => a.dist - b.dist);

        for (let arc = 0; arc < Math.min(arcCount, sortedEnemies.length); arc++) {
            const chainList = [sortedEnemies[arc].enemy];
            let current = sortedEnemies[arc].enemy;

            // Chain to additional targets
            for (let i = 1; i < Math.ceil(chainTargets / arcCount); i++) {
                const chainRange = (this.config.chainRange || 4) * this.grid.cellSize;
                let next = null;
                let closestDist = Infinity;

                for (const e of game.enemies) {
                    if (e.dead || chainList.includes(e)) continue;
                    const dist = Math.sqrt((current.x - e.x) ** 2 + (current.y - e.y) ** 2);
                    if (dist <= chainRange && dist < closestDist) {
                        next = e;
                        closestDist = dist;
                    }
                }

                if (next) {
                    chainList.push(next);
                    current = next;
                }
            }

            targets.push(chainList);
        }

        // Create lightning for each chain
        for (const chain of targets) {
            let prevX = this.x;
            let prevY = this.y;

            for (const enemy of chain) {
                enemy.takeDamage(boostedDamage);

                projectiles.push({
                    type: 'mega-tesla',
                    x: enemy.x,
                    y: enemy.y,
                    startX: prevX,
                    startY: prevY,
                    config: this.config,
                    life: 0.25,
                    boltWidth: this.config.boltWidth || 6,
                    branches: Math.floor(Math.random() * 3) + 1
                });

                prevX = enemy.x;
                prevY = enemy.y;
            }
        }
    }

    fireMegaRailgun(projectiles, game) {
        const boostedDamage = this.getBoostedDamage();
        const beamEndX = this.x + Math.cos(this.angle) * this.range * 1.5;
        const beamEndY = this.y + Math.sin(this.angle) * this.range * 1.5;

        // Hit all enemies in line with massive damage
        for (const enemy of game.enemies) {
            if (enemy.dead) continue;
            const dist = this.pointToLineDistance(enemy.x, enemy.y, this.x, this.y, beamEndX, beamEndY);
            const enemySize = (enemy.config?.size || 0.6) * this.grid.cellSize / 2;

            if (dist <= enemySize + 15) {
                enemy.takeDamage(boostedDamage);
            }
        }

        // Massive visual beam
        projectiles.push({
            type: 'mega-railgun',
            x: beamEndX,
            y: beamEndY,
            startX: this.x,
            startY: this.y,
            config: this.config,
            life: 0.4,
            chargePhase: 0,
            coreWidth: this.config.beamWidth || 12
        });
    }

    fireRocketArray(projectiles) {
        const boostedDamage = this.getBoostedDamage();
        const rocketCount = this.config.rocketCount || 6;
        const speed = (this.config.projectileSpeed || 10) * this.grid.cellSize;
        const salvoDelay = this.config.salvoDelay || 0.1;

        for (let i = 0; i < rocketCount; i++) {
            const offsetAngle = (i / rocketCount) * Math.PI * 2;
            const startOffset = this.grid.cellSize * 0.8;
            const startX = this.x + Math.cos(offsetAngle) * startOffset;
            const startY = this.y + Math.sin(offsetAngle) * startOffset;

            const dx = this.target.x - startX;
            const dy = this.target.y - startY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            projectiles.push({
                type: 'rocket',
                x: startX,
                y: startY,
                vx: (dx / dist) * speed,
                vy: (dy / dist) * speed,
                damage: boostedDamage,
                config: this.config,
                target: this.target,
                homingStrength: this.config.homingStrength || 0.12,
                aoeRadius: (this.config.explosionRadius || 1.8) * this.grid.cellSize,
                sourceX: startX,
                sourceY: startY,
                hitEnemies: [],
                life: 4.0,
                trail: [],
                delay: i * salvoDelay
            });
        }
    }

    fireLaserArray(projectiles, game) {
        const boostedDamage = this.getBoostedDamage();
        const laserCount = this.config.laserCount || 4;
        const sortedEnemies = [...game.enemies]
            .filter(e => !e.dead)
            .map(e => ({ enemy: e, dist: Math.sqrt((this.x - e.x) ** 2 + (this.y - e.y) ** 2) }))
            .filter(e => e.dist <= this.range)
            .sort((a, b) => a.dist - b.dist);

        for (let i = 0; i < Math.min(laserCount, sortedEnemies.length); i++) {
            const enemy = sortedEnemies[i].enemy;
            enemy.takeDamage(boostedDamage);

            projectiles.push({
                type: 'laser-array',
                x: enemy.x,
                y: enemy.y,
                startX: this.x,
                startY: this.y,
                config: this.config,
                life: 0.15,
                laserIndex: i
            });
        }
    }

    fireParticle(projectiles, game) {
        const boostedDamage = this.getBoostedDamage();
        const beamEndX = this.x + Math.cos(this.angle) * this.range;
        const beamEndY = this.y + Math.sin(this.angle) * this.range;

        // Hit enemies in line
        for (const enemy of game.enemies) {
            if (enemy.dead) continue;
            const dist = this.pointToLineDistance(enemy.x, enemy.y, this.x, this.y, beamEndX, beamEndY);
            if (dist <= 20) {
                enemy.takeDamage(boostedDamage);
            }
        }

        projectiles.push({
            type: 'particle-beam',
            x: beamEndX,
            y: beamEndY,
            startX: this.x,
            startY: this.y,
            config: this.config,
            life: 0.3,
            particles: [],
            particleCount: this.config.particleCount || 50
        });
    }

    fireNuclear(projectiles, game) {
        const boostedDamage = this.getBoostedDamage();
        // Target the STRONGEST enemy (highest HP) in range
        let strongestEnemy = null;
        let maxHealth = 0;

        for (const enemy of game.enemies) {
            if (enemy.dead) continue;
            const dist = Math.sqrt((this.x - enemy.x) ** 2 + (this.y - enemy.y) ** 2);
            if (dist <= this.range && enemy.health > maxHealth) {
                maxHealth = enemy.health;
                strongestEnemy = enemy;
            }
        }

        const target = strongestEnemy || this.target;
        const speed = (this.config.projectileSpeed || 6) * this.grid.cellSize;

        // Initial upward launch direction (then homes in)
        const launchAngle = this.angle - Math.PI / 6; // Slightly up from target direction

        projectiles.push({
            type: 'nuclear',
            x: this.x,
            y: this.y,
            vx: Math.cos(launchAngle) * speed * 0.5,
            vy: Math.sin(launchAngle) * speed * 0.5 - speed * 0.3, // Upward initial boost
            maxSpeed: speed * 1.5,
            damage: boostedDamage,
            config: this.config,
            aoeRadius: (this.config.aoeRadius || 5) * this.grid.cellSize,
            target: target, // HOMING TARGET
            targetX: target.x,
            targetY: target.y,
            sourceX: this.x,
            sourceY: this.y,
            hitEnemies: [],
            life: 8.0,
            homingStrength: this.config.homingStrength || 0.08, // GUIDED MISSILE
            // Particle trail effect
            trail: [],
            particles: [],
            glowSize: 20,
            isNuclearMissile: true
        });
    }

    fireStorm(projectiles, game) {
        const boostedDamage = this.getBoostedDamage();
        const stormRadius = (this.config.stormRadius || 5) * this.grid.cellSize;
        const lightningStrikes = this.config.lightningStrikes || 5;

        // Create storm cloud effect
        projectiles.push({
            type: 'storm-cloud',
            x: this.target.x,
            y: this.target.y,
            radius: stormRadius,
            config: this.config,
            life: 1.0,
            strikes: []
        });

        // Strike random enemies in the storm area
        const enemiesInRange = game.enemies.filter(e => {
            if (e.dead) return false;
            const dist = Math.sqrt((this.target.x - e.x) ** 2 + (this.target.y - e.y) ** 2);
            return dist <= stormRadius;
        });

        for (let i = 0; i < Math.min(lightningStrikes, enemiesInRange.length); i++) {
            const enemy = enemiesInRange[Math.floor(Math.random() * enemiesInRange.length)];
            if (enemy) {
                enemy.takeDamage(boostedDamage);

                projectiles.push({
                    type: 'storm-bolt',
                    x: enemy.x,
                    y: enemy.y,
                    startX: enemy.x,
                    startY: enemy.y - 200,
                    config: this.config,
                    life: 0.2,
                    delay: i * 0.1
                });
            }
        }
    }

    fireDeathRay(projectiles, game) {
        const boostedDamage = this.getBoostedDamage();
        if (!this.heatLevel) this.heatLevel = 0;

        const beamEndX = this.x + Math.cos(this.angle) * this.range;
        const beamEndY = this.y + Math.sin(this.angle) * this.range;

        // Continuous damage to all in line
        for (const enemy of game.enemies) {
            if (enemy.dead) continue;
            const dist = this.pointToLineDistance(enemy.x, enemy.y, this.x, this.y, beamEndX, beamEndY);
            if (dist <= 15) {
                enemy.takeDamage(boostedDamage * 0.1);
            }
        }

        // Heat buildup visual
        this.heatLevel = Math.min(100, this.heatLevel + 2);

        projectiles.push({
            type: 'death-ray',
            x: beamEndX,
            y: beamEndY,
            startX: this.x,
            startY: this.y,
            config: this.config,
            life: 0.05,
            heatLevel: this.heatLevel
        });
    }

    fireMissileBattery(projectiles, game) {
        const boostedDamage = this.getBoostedDamage();
        // Target the STRONGEST enemy (highest HP) in range
        let strongestEnemy = null;
        let maxHealth = 0;

        if (game && game.enemies) {
            for (const enemy of game.enemies) {
                if (enemy.dead) continue;
                const dist = Math.sqrt((this.x - enemy.x) ** 2 + (this.y - enemy.y) ** 2);
                if (dist <= this.range && enemy.health > maxHealth) {
                    maxHealth = enemy.health;
                    strongestEnemy = enemy;
                }
            }
        }

        const target = strongestEnemy || this.target;
        const missileCount = this.config.missileCount || 8; // Reduced from 12
        const speed = (this.config.projectileSpeed || 14) * this.grid.cellSize;
        const salvoDelay = this.config.salvoDelay || 0.06; // Slower salvo for visual effect
        const spreadRadius = (this.config.spreadRadius || 2) * this.grid.cellSize;

        for (let i = 0; i < missileCount; i++) {
            // Missiles launch from different positions on the turret
            const launchAngle = (i / missileCount) * Math.PI * 2;
            const launchOffset = this.grid.cellSize * 0.6;
            const startX = this.x + Math.cos(launchAngle) * launchOffset;
            const startY = this.y + Math.sin(launchAngle) * launchOffset;

            // Each missile targets a random position around the main target
            const targetSpreadAngle = Math.random() * Math.PI * 2;
            const targetSpreadDist = Math.random() * spreadRadius;
            const targetX = target.x + Math.cos(targetSpreadAngle) * targetSpreadDist;
            const targetY = target.y + Math.sin(targetSpreadAngle) * targetSpreadDist;

            const dx = targetX - startX;
            const dy = targetY - startY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Initial upward launch then homes in
            const initialAngle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.6;

            projectiles.push({
                type: 'battery-missile',
                x: startX,
                y: startY,
                vx: Math.cos(initialAngle) * speed * 0.5,
                vy: Math.sin(initialAngle) * speed * 0.5 - speed * 0.2, // Slight upward boost
                maxSpeed: speed,
                damage: boostedDamage,
                config: this.config,
                target: target,
                targetX: targetX,
                targetY: targetY,
                homingStrength: this.config.homingStrength || 0.25,
                aoeRadius: (this.config.explosionRadius || 1.5) * this.grid.cellSize,
                sourceX: startX,
                sourceY: startY,
                hitEnemies: [],
                life: 4.0,
                trail: [],
                delay: i * salvoDelay
            });
        }
    }

    fireOrbital(projectiles, game) {
        const boostedDamage = this.getBoostedDamage();
        // Target the STRONGEST enemy (highest HP) in range for maximum impact
        let strongestEnemy = null;
        let maxHealth = 0;

        for (const enemy of game.enemies) {
            if (enemy.dead) continue;
            const dist = Math.sqrt((this.x - enemy.x) ** 2 + (this.y - enemy.y) ** 2);
            if (dist <= this.range && enemy.health > maxHealth) {
                maxHealth = enemy.health;
                strongestEnemy = enemy;
            }
        }

        const target = strongestEnemy || this.target;
        const strikeRadius = (this.config.strikeRadius || 4) * this.grid.cellSize;
        const strikeDelay = this.config.strikeDelay || 1.2;

        // Warning marker with targeting animation
        projectiles.push({
            type: 'orbital-warning',
            x: target.x,
            y: target.y,
            radius: strikeRadius * 1.5,
            config: this.config,
            life: strikeDelay,
            phase: 0,
            targetingLines: true
        });

        // The orbital beam strike
        projectiles.push({
            type: 'orbital-strike',
            x: target.x,
            y: target.y,
            radius: strikeRadius,
            damage: boostedDamage,
            config: this.config,
            life: strikeDelay + 1.5,
            delay: strikeDelay,
            triggered: false,
            targetEnemies: [...game.enemies.filter(e => !e.dead)],
            // Epic beam effect data
            beamWidth: 0,
            maxBeamWidth: 50,
            impactPhase: 0,
            shockwaveRadius: 0
        });
    }

    fireShockwave(projectiles, game) {
        const boostedDamage = this.getBoostedDamage();
        // Apply range boost
        const rangeMult = 1 + (this.rangeBoostAmount || 0);
        const aoeRange = (this.config.aoeRange || 3) * this.grid.cellSize * rangeMult;

        // Damage all enemies in range
        for (const enemy of game.enemies) {
            if (enemy.dead) continue;
            const dist = Math.sqrt((this.x - enemy.x) ** 2 + (this.y - enemy.y) ** 2);
            if (dist <= aoeRange) {
                enemy.takeDamage(boostedDamage);
            }
        }

        // Shockwave visual effect
        projectiles.push({
            type: 'shockwave',
            x: this.x,
            y: this.y,
            radius: 0,
            maxRadius: aoeRange,
            config: this.config,
            life: 0.4
        });
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
