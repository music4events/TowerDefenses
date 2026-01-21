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
        this.spawnProtection = 1.0; // 1 second of protection
        this.age = 0; // Track how long enemy has existed

        // Wall attacking
        this.targetWall = null;
        this.attackCooldown = 0;
        this.attackRate = 1; // Attack every 1 second
        this.isAttackingWall = false;

        // Turret attacking (while passing)
        this.turretAttackCooldown = 0;
        this.isAttackingTurret = false;

        // Flying enemy - visual flag
        this.isFlying = this.config.isFlying || false;

        // Frosted effect
        this.frosted = false;
    }

    update(deltaTime, nexus, enemies, game) {
        if (this.dead) return;

        // Track age
        this.age += deltaTime;

        // Spawn protection countdown
        if (this.spawnProtection > 0) {
            this.spawnProtection -= deltaTime;
        }

        // Force alive during spawn protection
        if (this.spawnProtection > 0) {
            this.dead = false;
        }

        // Handle burning damage over time
        if (this.burning) {
            this.burnTime -= deltaTime;
            this.takeDamage(this.burnDamage * deltaTime);

            if (this.burnTime <= 0) {
                this.burning = false;
            }
        }

        // Attack cooldowns
        this.attackCooldown -= deltaTime;
        this.turretAttackCooldown -= deltaTime;

        // Reset frosted each frame (reapplied by slowdown turrets)
        this.frosted = false;

        // NEW MOVEMENT LOGIC: All enemies rush directly toward nexus
        // Only walls can block ground enemies
        if (this.config.isFlying) {
            // Flying enemies ignore all obstacles
            this.moveTowardNexus(deltaTime, nexus);
        } else {
            // Ground enemies check for walls in their path
            this.moveWithWallCollision(deltaTime, nexus, game);
        }

        // Attack turrets while passing (if has turret attack capability)
        if (game && this.config.turretAttackRange > 0) {
            this.attackNearbyTurrets(game, deltaTime);
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

    // Direct movement toward nexus (for flying enemies)
    moveTowardNexus(deltaTime, nexus) {
        const dx = nexus.x - this.x;
        const dy = nexus.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 2) {
            const moveSpeed = this.speed * this.slowMultiplier * this.grid.cellSize * deltaTime;
            this.x += (dx / dist) * moveSpeed;
            this.y += (dy / dist) * moveSpeed;
            this.angle = Math.atan2(dy, dx);
        }

        this.isAttackingWall = false;
        this.targetWall = null;
    }

    // Ground movement with wall collision detection
    moveWithWallCollision(deltaTime, nexus, game) {
        if (!game) {
            this.moveTowardNexus(deltaTime, nexus);
            return;
        }

        // Direction toward nexus
        const dx = nexus.x - this.x;
        const dy = nexus.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= 2) return; // Already at nexus

        // Calculate next position
        const moveSpeed = this.speed * this.slowMultiplier * this.grid.cellSize * deltaTime;
        const nextX = this.x + (dx / dist) * moveSpeed;
        const nextY = this.y + (dy / dist) * moveSpeed;

        // Update angle regardless
        this.angle = Math.atan2(dy, dx);

        // Check if there's a wall blocking the path
        const blockingWall = this.findBlockingWall(nextX, nextY, game);

        if (blockingWall) {
            // Stop and attack the wall
            this.isAttackingWall = true;
            this.targetWall = blockingWall;

            // Face the wall
            const wallDx = blockingWall.x - this.x;
            const wallDy = blockingWall.y - this.y;
            this.angle = Math.atan2(wallDy, wallDx);

            // Attack the wall
            if (this.attackCooldown <= 0) {
                this.attackCooldown = this.attackRate;
                game.damageStructure(blockingWall, this.damage);
            }
        } else {
            // No wall blocking, move forward
            this.x = nextX;
            this.y = nextY;
            this.isAttackingWall = false;
            this.targetWall = null;
        }
    }

    // Find wall that blocks movement
    findBlockingWall(nextX, nextY, game) {
        const enemyRadius = this.grid.cellSize * 0.4; // Enemy collision radius

        for (const wall of game.walls) {
            if (wall.isDestroyed && wall.isDestroyed()) continue;
            if (wall.health <= 0) continue;

            // Wall position and size
            const wallHalfSize = this.grid.cellSize * 0.5;

            // Check collision between enemy circle and wall square
            const closestX = Math.max(wall.x - wallHalfSize, Math.min(nextX, wall.x + wallHalfSize));
            const closestY = Math.max(wall.y - wallHalfSize, Math.min(nextY, wall.y + wallHalfSize));

            const distX = nextX - closestX;
            const distY = nextY - closestY;
            const distSquared = distX * distX + distY * distY;

            if (distSquared < enemyRadius * enemyRadius) {
                return wall;
            }
        }

        return null;
    }

    takeDamage(amount, sourceX = null, sourceY = null) {
        // Ignore damage during spawn protection
        if (this.spawnProtection > 0) return;

        // Apply normal armor
        if (this.config.armor) {
            amount *= (1 - this.config.armor);
        }

        // Apply directional armor (armored-front)
        if (this.config.frontArmor !== undefined && sourceX !== null && sourceY !== null) {
            const angleToSource = Math.atan2(sourceY - this.y, sourceX - this.x);
            let angleDiff = Math.abs(angleToSource - this.angle);

            // Normalize to 0-PI range
            if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;

            // If hit from front (within 90 degrees of facing direction)
            if (angleDiff < Math.PI / 2) {
                amount *= (1 - this.config.frontArmor);
            } else if (this.config.backArmor !== undefined) {
                amount *= (1 - this.config.backArmor);
            }
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

    attackNearbyTurrets(game, deltaTime) {
        if (this.turretAttackCooldown > 0) {
            this.isAttackingTurret = false;
            return;
        }

        const attackRange = this.config.turretAttackRange * this.grid.cellSize;
        const attackDamage = this.config.turretAttackDamage || 5;
        const attackRate = this.config.turretAttackRate || 1.5;

        // Find nearest turret in range
        let nearestTurret = null;
        let nearestDist = Infinity;

        for (const turret of game.turrets) {
            if (turret.isDestroyed && turret.isDestroyed()) continue;

            const dist = Math.sqrt((this.x - turret.x) ** 2 + (this.y - turret.y) ** 2);
            if (dist <= attackRange && dist < nearestDist) {
                nearestTurret = turret;
                nearestDist = dist;
            }
        }

        if (nearestTurret) {
            this.isAttackingTurret = true;
            this.turretAttackCooldown = attackRate;

            // Deal damage to turret
            if (nearestTurret.takeDamage) {
                nearestTurret.takeDamage(attackDamage);
            }
        } else {
            this.isAttackingTurret = false;
        }
    }
}
