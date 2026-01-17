import { ENEMY_TYPES } from '../data/enemies.js';

export class Enemy {
    constructor(gridX, gridY, type, grid) {
        this.grid = grid;
        this.type = type;
        this.config = ENEMY_TYPES[type];

        const worldPos = grid.gridToWorld(gridX, gridY);
        this.x = worldPos.x;
        this.y = worldPos.y;
        this.gridX = gridX;
        this.gridY = gridY;

        this.maxHealth = this.config.health;
        this.health = this.maxHealth;
        this.speed = this.config.speed;
        this.damage = this.config.damage;
        this.angle = 0;

        this.path = [];
        this.pathIndex = 0;
        this.targetX = this.x;
        this.targetY = this.y;

        // Status effects
        this.burning = false;
        this.burnDamage = 0;
        this.burnTime = 0;
        this.slowMultiplier = 1;

        // For healer enemies
        this.healCooldown = 0;

        // For boss enemies
        this.minionCooldown = 0;

        this.dead = false;
        this.reachedNexus = false;

        // Spawn protection (brief invulnerability)
        this.spawnProtection = 0.5; // 0.5 seconds of protection

        // Wall attacking
        this.targetWall = null;
        this.attackCooldown = 0;
        this.attackRate = 1; // Attack every 1 second
        this.isAttackingWall = false;
    }

    setPath(path) {
        this.path = path;
        this.pathIndex = 0;
        this.isAttackingWall = false;
        this.targetWall = null;
        if (path && path.length > 0) {
            this.updateTarget();
        }
    }

    updateTarget() {
        if (this.pathIndex < this.path.length) {
            const target = this.path[this.pathIndex];
            const worldPos = this.grid.gridToWorld(target.x, target.y);
            this.targetX = worldPos.x;
            this.targetY = worldPos.y;
        }
    }

    update(deltaTime, nexus, enemies, game) {
        if (this.dead) return;

        // Spawn protection countdown
        if (this.spawnProtection > 0) {
            this.spawnProtection -= deltaTime;
        }

        // Handle burning damage over time
        if (this.burning) {
            this.burnTime -= deltaTime;
            this.takeDamage(this.burnDamage * deltaTime);

            if (this.burnTime <= 0) {
                this.burning = false;
            }
        }

        // Attack cooldown
        this.attackCooldown -= deltaTime;

        // If no path or stuck, find and attack nearest wall
        if ((!this.path || this.path.length === 0 || this.pathIndex >= this.path.length) && game) {
            this.findAndAttackWall(game, deltaTime, nexus);
        } else {
            this.isAttackingWall = false;

            // Movement
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 2) {
                const moveSpeed = this.speed * this.slowMultiplier * this.grid.cellSize * deltaTime;
                this.x += (dx / dist) * moveSpeed;
                this.y += (dy / dist) * moveSpeed;
                this.angle = Math.atan2(dy, dx);
            } else {
                // Reached current target
                this.pathIndex++;
                if (this.pathIndex < this.path.length) {
                    this.updateTarget();
                }
            }
        }

        // Update grid position
        const gridPos = this.grid.worldToGrid(this.x, this.y);
        this.gridX = gridPos.x;
        this.gridY = gridPos.y;

        // Check if reached nexus (only after spawn protection)
        if (this.spawnProtection <= 0) {
            const nexusDist = Math.sqrt((this.x - nexus.x) ** 2 + (this.y - nexus.y) ** 2);
            if (nexusDist < nexus.radius) {
                this.reachedNexus = true;
                nexus.takeDamage(this.damage);
                this.dead = true;

                // Kamikaze explosion
                if (this.config.explodeOnDeath) {
                    this.explode(enemies, game);
                }
            }
        }

        // Healer logic
        if (this.config.healAmount && this.healCooldown <= 0) {
            this.healNearbyEnemies(enemies);
            this.healCooldown = this.config.healRate || 1;
        }
        this.healCooldown -= deltaTime;

        // Boss minion spawning
        if (this.config.spawnMinions && this.minionCooldown <= 0 && game) {
            game.spawnEnemy(this.gridX, this.gridY, this.config.minionType);
            this.minionCooldown = this.config.minionRate || 5;
        }
        this.minionCooldown -= deltaTime;

        // Reset slow each frame (reapplied by effects)
        this.slowMultiplier = 1;
    }

    findAndAttackWall(game, deltaTime, nexus) {
        // Find nearest wall or blocking structure
        let nearestWall = null;
        let nearestDist = Infinity;

        for (const wall of game.walls) {
            const dist = Math.sqrt((this.x - wall.x) ** 2 + (this.y - wall.y) ** 2);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearestWall = wall;
            }
        }

        // Also check turrets as obstacles
        for (const turret of game.turrets) {
            const dist = Math.sqrt((this.x - turret.x) ** 2 + (this.y - turret.y) ** 2);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearestWall = turret;
            }
        }

        if (nearestWall && nearestDist < this.grid.cellSize * 1.5) {
            // Close enough to attack
            this.isAttackingWall = true;
            this.targetWall = nearestWall;

            // Face the wall
            const dx = nearestWall.x - this.x;
            const dy = nearestWall.y - this.y;
            this.angle = Math.atan2(dy, dx);

            // Attack
            if (this.attackCooldown <= 0) {
                this.attackCooldown = this.attackRate;
                game.damageStructure(nearestWall, this.damage);
            }
        } else if (nearestWall) {
            // Move towards nearest wall
            this.isAttackingWall = false;
            const dx = nearestWall.x - this.x;
            const dy = nearestWall.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            const moveSpeed = this.speed * this.slowMultiplier * this.grid.cellSize * deltaTime;
            this.x += (dx / dist) * moveSpeed;
            this.y += (dy / dist) * moveSpeed;
            this.angle = Math.atan2(dy, dx);
        } else {
            // No walls, try to recalculate path
            const path = this.grid.findPath(this.gridX, this.gridY, nexus.gridX, nexus.gridY);
            if (path) {
                this.setPath(path);
            } else {
                // No path found, move directly towards nexus
                const dx = nexus.x - this.x;
                const dy = nexus.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 2) {
                    const moveSpeed = this.speed * this.slowMultiplier * this.grid.cellSize * deltaTime;
                    this.x += (dx / dist) * moveSpeed;
                    this.y += (dy / dist) * moveSpeed;
                    this.angle = Math.atan2(dy, dx);
                }
            }
        }
    }

    takeDamage(amount) {
        // Ignore damage during spawn protection
        if (this.spawnProtection > 0) return;

        // Apply armor
        if (this.config.armor) {
            amount *= (1 - this.config.armor);
        }

        this.health -= amount;

        if (this.health <= 0) {
            this.dead = true;
        }
    }

    applyBurn(damage, duration) {
        this.burning = true;
        this.burnDamage = damage;
        this.burnTime = duration;
    }

    applySlow(multiplier) {
        this.slowMultiplier = Math.min(this.slowMultiplier, multiplier);
    }

    explode(enemies, game) {
        if (!this.config.explosionRadius) return;

        const radius = this.config.explosionRadius * this.grid.cellSize;

        // Damage nearby enemies (friendly fire for kamikazes is off)
        // But damage structures in radius if implemented

        // Add explosion effect
        if (game && game.renderer) {
            game.renderer.addExplosion(this.x, this.y, radius, '#ffaa00');
        }
    }

    healNearbyEnemies(enemies) {
        const range = (this.config.healRange || 2) * this.grid.cellSize;

        for (const enemy of enemies) {
            if (enemy === this || enemy.dead) continue;

            const dist = Math.sqrt((this.x - enemy.x) ** 2 + (this.y - enemy.y) ** 2);
            if (dist <= range) {
                enemy.health = Math.min(enemy.maxHealth, enemy.health + this.config.healAmount);
            }
        }
    }

    getReward() {
        return this.config.reward || { iron: 5 };
    }
}
