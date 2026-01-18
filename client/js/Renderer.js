import { RESOURCE_TYPES } from './data/buildings.js';

export class Renderer {
    constructor(canvas, grid) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.grid = grid;

        // Colors
        this.colors = {
            background: '#1a1a2e',
            gridLine: '#16213e',
            nexus: '#e94560',
            turret: '#0f3460',
            wall: '#533535',
            enemy: '#ff4444',
            projectile: '#ffff00',
            explosion: '#ff6600'
        };

        this.particles = [];
        this.explosions = [];
    }

    clear() {
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawGrid() {
        this.ctx.strokeStyle = this.colors.gridLine;
        this.ctx.lineWidth = 1;

        for (let x = 0; x <= this.grid.cols; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.grid.cellSize, 0);
            this.ctx.lineTo(x * this.grid.cellSize, this.canvas.height);
            this.ctx.stroke();
        }

        for (let y = 0; y <= this.grid.rows; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.grid.cellSize);
            this.ctx.lineTo(this.canvas.width, y * this.grid.cellSize);
            this.ctx.stroke();
        }
    }

    drawResources() {
        for (let y = 0; y < this.grid.rows; y++) {
            for (let x = 0; x < this.grid.cols; x++) {
                if (this.grid.cells[y][x] === 2) {
                    const resourceType = this.grid.resourceMap[y][x];
                    const resource = RESOURCE_TYPES[resourceType];

                    if (resource) {
                        const worldPos = this.grid.gridToWorld(x, y);
                        const size = this.grid.cellSize * 0.8;

                        // Background
                        this.ctx.fillStyle = resource.bgColor;
                        this.ctx.fillRect(
                            worldPos.x - size / 2,
                            worldPos.y - size / 2,
                            size, size
                        );

                        // Resource indicator
                        this.ctx.fillStyle = resource.color;
                        this.ctx.beginPath();
                        this.ctx.arc(worldPos.x, worldPos.y, size / 4, 0, Math.PI * 2);
                        this.ctx.fill();
                    }
                }
            }
        }
    }

    drawNexus(nexus) {
        const { x, y, health, maxHealth, radius } = nexus;

        // Pulsing effect
        const pulse = 1 + Math.sin(Date.now() / 500) * 0.05;
        const drawRadius = radius * pulse;

        // Hexagon shape
        this.ctx.fillStyle = this.colors.nexus;
        this.ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3 - Math.PI / 6;
            const px = x + drawRadius * Math.cos(angle);
            const py = y + drawRadius * Math.sin(angle);
            if (i === 0) {
                this.ctx.moveTo(px, py);
            } else {
                this.ctx.lineTo(px, py);
            }
        }
        this.ctx.closePath();
        this.ctx.fill();

        // Inner glow
        this.ctx.fillStyle = '#ff8080';
        this.ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3 - Math.PI / 6;
            const px = x + drawRadius * 0.6 * Math.cos(angle);
            const py = y + drawRadius * 0.6 * Math.sin(angle);
            if (i === 0) {
                this.ctx.moveTo(px, py);
            } else {
                this.ctx.lineTo(px, py);
            }
        }
        this.ctx.closePath();
        this.ctx.fill();

        // Health bar
        const barWidth = radius * 2;
        const barHeight = 6;
        const barY = y + radius + 10;

        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(x - barWidth / 2, barY, barWidth, barHeight);

        const healthPercent = health / maxHealth;
        this.ctx.fillStyle = healthPercent > 0.3 ? this.colors.nexus : '#ff0000';
        this.ctx.fillRect(x - barWidth / 2, barY, barWidth * healthPercent, barHeight);
    }

    drawTurret(turret, isSelected = false, mode = null) {
        const { x, y, angle, config, cooldown, level } = turret;
        // Fallback for synced turrets without full config
        const turretSize = config?.size || 0.8;
        const turretColor = config?.color || '#0f3460';
        const size = this.grid.cellSize * turretSize;

        // Draw drone connection line to home
        if (config?.isDrone && turret.homeX !== undefined) {
            this.ctx.strokeStyle = 'rgba(147, 112, 219, 0.3)';
            this.ctx.lineWidth = 1;
            this.ctx.setLineDash([3, 3]);
            this.ctx.beginPath();
            this.ctx.moveTo(turret.homeX, turret.homeY);
            this.ctx.lineTo(x, y);
            this.ctx.stroke();
            this.ctx.setLineDash([]);

            // Draw home base marker
            this.ctx.fillStyle = 'rgba(147, 112, 219, 0.5)';
            this.ctx.beginPath();
            this.ctx.arc(turret.homeX, turret.homeY, 6, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Draw slowdown zone
        if (config?.isSlowdown) {
            const slowRange = (config.aoeRange || config.range) * this.grid.cellSize;
            this.ctx.fillStyle = config.frostColor || 'rgba(136, 221, 255, 0.15)';
            this.ctx.beginPath();
            this.ctx.arc(x, y, slowRange, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.strokeStyle = config.frostColor || 'rgba(136, 221, 255, 0.4)';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }

        // Selection/mode highlight
        if (isSelected) {
            this.ctx.strokeStyle = mode === 'sell' ? '#e74c3c' : mode === 'upgrade' ? '#f39c12' : '#ffffff';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(x, y, size / 2 + 5, 0, Math.PI * 2);
            this.ctx.stroke();
        }

        // Base circle
        this.ctx.fillStyle = turretColor;
        this.ctx.beginPath();
        this.ctx.arc(x, y, size / 2, 0, Math.PI * 2);
        this.ctx.fill();

        // Darker ring
        this.ctx.strokeStyle = '#0a0a1a';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Barrel (triangle pointing at angle) - skip for healer/slowdown
        if (!config?.isHealer && !config?.isSlowdown) {
            this.ctx.fillStyle = '#ffffff';
            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.rotate(angle);

            this.ctx.beginPath();
            this.ctx.moveTo(size / 2 + 5, 0);
            this.ctx.lineTo(size / 4, -4);
            this.ctx.lineTo(size / 4, 4);
            this.ctx.closePath();
            this.ctx.fill();

            this.ctx.restore();
        }

        // Healer cross symbol
        if (config?.isHealer) {
            this.ctx.fillStyle = '#ffffff';
            const crossSize = size / 4;
            this.ctx.fillRect(x - crossSize / 4, y - crossSize, crossSize / 2, crossSize * 2);
            this.ctx.fillRect(x - crossSize, y - crossSize / 4, crossSize * 2, crossSize / 2);
        }

        // Slowdown snowflake indicator
        if (config?.isSlowdown) {
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(x, y, size / 6, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Cooldown indicator
        if (cooldown > 0) {
            this.ctx.globalAlpha = 0.3;
            this.ctx.fillStyle = '#000000';
            this.ctx.beginPath();
            this.ctx.arc(x, y, size / 2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
        }

        // Draw upgrade stars
        if (level && level > 1) {
            this.drawStars(x, y + size / 2 + 8, level - 1);
        }

        // Health bar when damaged
        const health = turret.health;
        const maxHealth = turret.maxHealth || config?.maxHealth || 100;
        if (health !== undefined && health < maxHealth) {
            const barWidth = size;
            const barHeight = 4;
            const barY = y - size / 2 - 6;

            this.ctx.fillStyle = '#333';
            this.ctx.fillRect(x - barWidth / 2, barY, barWidth, barHeight);

            const healthPercent = health / maxHealth;
            this.ctx.fillStyle = healthPercent > 0.5 ? '#44ff44' : healthPercent > 0.25 ? '#ffff00' : '#ff4444';
            this.ctx.fillRect(x - barWidth / 2, barY, barWidth * healthPercent, barHeight);
        }
    }

    drawHealerBeams(turret) {
        if (!turret.healTargets || turret.healTargets.length === 0) return;

        const beamColor = turret.config?.beamColor || '#88ff88';
        for (const target of turret.healTargets) {
            // Draw healing beam
            this.ctx.strokeStyle = beamColor;
            this.ctx.lineWidth = 3;
            this.ctx.globalAlpha = 0.7;
            this.ctx.beginPath();
            this.ctx.moveTo(turret.x, turret.y);
            this.ctx.lineTo(target.x, target.y);
            this.ctx.stroke();

            // Healing glow on target
            this.ctx.fillStyle = beamColor;
            this.ctx.globalAlpha = 0.4;
            this.ctx.beginPath();
            this.ctx.arc(target.x, target.y, 10, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.globalAlpha = 1;
        }
    }

    drawStars(x, y, count) {
        const starSize = 4;
        const spacing = 8;
        const startX = x - ((count - 1) * spacing) / 2;

        this.ctx.fillStyle = '#f39c12';
        for (let i = 0; i < count; i++) {
            this.drawStar(startX + i * spacing, y, starSize);
        }
    }

    drawStar(cx, cy, size) {
        const spikes = 5;
        const outerRadius = size;
        const innerRadius = size / 2;

        this.ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / spikes - Math.PI / 2;
            const x = cx + radius * Math.cos(angle);
            const y = cy + radius * Math.sin(angle);
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawWall(wall) {
        const { x, y, health } = wall;
        const maxHealth = wall.maxHealth || 200; // Fallback for synced walls
        const size = this.grid.cellSize * 0.9;

        // Wall block - color changes based on health
        const healthPercent = health / maxHealth;
        if (healthPercent > 0.6) {
            this.ctx.fillStyle = this.colors.wall;
        } else if (healthPercent > 0.3) {
            this.ctx.fillStyle = '#6b4423';
        } else {
            this.ctx.fillStyle = '#8b4513';
        }
        this.ctx.fillRect(x - size / 2, y - size / 2, size, size);

        // Damage cracks
        if (health < maxHealth * 0.7) {
            this.ctx.strokeStyle = '#2a1a1a';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(x - size / 4, y - size / 4);
            this.ctx.lineTo(x + size / 4, y + size / 4);
            this.ctx.stroke();
        }

        if (health < maxHealth * 0.4) {
            this.ctx.beginPath();
            this.ctx.moveTo(x + size / 4, y - size / 4);
            this.ctx.lineTo(x - size / 4, y + size / 4);
            this.ctx.stroke();
        }

        // Health bar when damaged
        if (health < maxHealth) {
            const barWidth = size;
            const barHeight = 4;
            const barY = y - size / 2 - 6;

            this.ctx.fillStyle = '#333';
            this.ctx.fillRect(x - barWidth / 2, barY, barWidth, barHeight);

            this.ctx.fillStyle = healthPercent > 0.5 ? '#44ff44' : healthPercent > 0.25 ? '#ffff00' : '#ff4444';
            this.ctx.fillRect(x - barWidth / 2, barY, barWidth * healthPercent, barHeight);
        }
    }

    drawExtractor(extractor) {
        const { x, y, resourceType, level } = extractor;
        const size = this.grid.cellSize * 0.8;

        const resource = RESOURCE_TYPES[resourceType];

        // Base
        this.ctx.fillStyle = '#4a5568';
        this.ctx.fillRect(x - size / 2, y - size / 2, size, size);

        // Rotating drill animation - faster with higher level
        const speedMultiplier = 1 + (level ? (level - 1) * 0.5 : 0);
        const rotation = (Date.now() / (500 / speedMultiplier)) % (Math.PI * 2);
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(rotation);

        this.ctx.fillStyle = resource ? resource.color : '#888';
        this.ctx.fillRect(-size / 6, -size / 3, size / 3, size / 1.5);

        this.ctx.restore();

        // Draw upgrade stars
        if (level && level > 1) {
            this.drawStars(x, y + size / 2 + 8, level - 1);
        }
    }

    drawEnemy(enemy) {
        const { x, y, health, maxHealth, config, angle } = enemy;
        // Fallback for synced enemies without full config
        const enemySize = config?.size || 0.8;
        const enemyColor = config?.color || '#ff4444';
        const size = this.grid.cellSize * enemySize;

        // Flying enemies - draw shadow on ground
        if (config?.isFlying || enemy.isFlying) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            this.ctx.beginPath();
            this.ctx.ellipse(x + 5, y + 5, size / 2, size / 4, 0, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Triangle pointing towards movement direction
        this.ctx.fillStyle = enemyColor;
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(angle);

        this.ctx.beginPath();
        this.ctx.moveTo(size / 2, 0);
        this.ctx.lineTo(-size / 2, -size / 2);
        this.ctx.lineTo(-size / 3, 0);
        this.ctx.lineTo(-size / 2, size / 2);
        this.ctx.closePath();
        this.ctx.fill();

        // Armored-front - draw front shield indicator
        if (config?.frontArmor) {
            this.ctx.strokeStyle = '#cccccc';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, size / 2 + 2, -Math.PI / 3, Math.PI / 3);
            this.ctx.stroke();
        }

        this.ctx.restore();

        // Flying wings indicator
        if (config?.isFlying || enemy.isFlying) {
            const wingSpan = size * 0.8;
            const wingFlap = Math.sin(Date.now() / 100) * 3;

            this.ctx.strokeStyle = enemyColor;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x - wingSpan / 2, y - wingSpan / 4 + wingFlap);
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x + wingSpan / 2, y - wingSpan / 4 + wingFlap);
            this.ctx.stroke();
        }

        // Health bar
        if (health < maxHealth) {
            const barWidth = size;
            const barHeight = 4;
            const barY = y - size / 2 - 8;

            this.ctx.fillStyle = '#333';
            this.ctx.fillRect(x - barWidth / 2, barY, barWidth, barHeight);

            const healthPercent = health / maxHealth;
            this.ctx.fillStyle = healthPercent > 0.5 ? '#44ff44' : healthPercent > 0.25 ? '#ffff00' : '#ff4444';
            this.ctx.fillRect(x - barWidth / 2, barY, barWidth * healthPercent, barHeight);
        }

        // Burning effect (DOT)
        if (enemy.burning) {
            this.ctx.fillStyle = 'rgba(255, 100, 0, 0.5)';
            this.ctx.beginPath();
            this.ctx.arc(x, y, size / 2 + 3, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Frosted/slowed effect
        if (enemy.frosted || enemy.slowMultiplier < 1) {
            this.ctx.strokeStyle = 'rgba(136, 221, 255, 0.8)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(x, y, size / 2 + 2, 0, Math.PI * 2);
            this.ctx.stroke();

            // Ice crystals
            this.ctx.fillStyle = 'rgba(200, 240, 255, 0.6)';
            for (let i = 0; i < 4; i++) {
                const crystalAngle = (i * Math.PI / 2) + Date.now() / 1000;
                const cx = x + Math.cos(crystalAngle) * (size / 2 + 5);
                const cy = y + Math.sin(crystalAngle) * (size / 2 + 5);
                this.ctx.beginPath();
                this.ctx.arc(cx, cy, 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }

        // Attacking turret indicator
        if (enemy.isAttackingTurret) {
            this.ctx.strokeStyle = '#ff0000';
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([2, 2]);
            this.ctx.beginPath();
            this.ctx.arc(x, y, size / 2 + 4, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }
    }

    drawProjectile(projectile) {
        const { x, y, config, type } = projectile;
        const projColor = config?.projectileColor || '#ffff00';

        if (type === 'artillery') {
            // Larger projectile for artillery
            this.ctx.fillStyle = projColor;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 6, 0, Math.PI * 2);
            this.ctx.fill();
        } else if (type === 'laser') {
            // Laser beam is drawn as a line
            this.ctx.strokeStyle = '#2ecc71';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(projectile.startX, projectile.startY);
            this.ctx.lineTo(x, y);
            this.ctx.stroke();
        } else if (type === 'tesla') {
            // Electric arc
            this.drawLightning(projectile.startX, projectile.startY, x, y, '#00d4ff');
        } else if (type === 'flame') {
            // Flame particle
            this.ctx.fillStyle = `rgba(255, ${100 + Math.random() * 100}, 0, ${projectile.life || 1})`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 4 + Math.random() * 4, 0, Math.PI * 2);
            this.ctx.fill();
        } else if (type === 'pellet') {
            // Small shotgun pellet
            this.ctx.fillStyle = projColor;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 2, 0, Math.PI * 2);
            this.ctx.fill();
        } else if (type === 'railgun') {
            // Piercing beam
            const beamColor = config?.beamColor || '#6495ed';
            const beamWidth = config?.beamWidth || 4;

            // Main beam
            this.ctx.strokeStyle = beamColor;
            this.ctx.lineWidth = beamWidth;
            this.ctx.beginPath();
            this.ctx.moveTo(projectile.startX, projectile.startY);
            this.ctx.lineTo(x, y);
            this.ctx.stroke();

            // Glow effect
            this.ctx.strokeStyle = 'rgba(100, 149, 237, 0.4)';
            this.ctx.lineWidth = beamWidth * 2;
            this.ctx.stroke();

            // Inner bright core
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        } else if (type === 'sniper') {
            // Sniper bullet (faster, longer trail)
            this.ctx.fillStyle = projColor;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 4, 0, Math.PI * 2);
            this.ctx.fill();
        } else {
            // Default bullet
            this.ctx.fillStyle = projColor;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    drawLightning(x1, y1, x2, y2, color) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);

        const segments = 5;
        const dx = (x2 - x1) / segments;
        const dy = (y2 - y1) / segments;

        for (let i = 1; i < segments; i++) {
            const offsetX = (Math.random() - 0.5) * 20;
            const offsetY = (Math.random() - 0.5) * 20;
            this.ctx.lineTo(x1 + dx * i + offsetX, y1 + dy * i + offsetY);
        }

        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();

        // Glow effect
        this.ctx.strokeStyle = 'rgba(0, 212, 255, 0.3)';
        this.ctx.lineWidth = 6;
        this.ctx.stroke();
    }

    addExplosion(x, y, radius, color = '#ff6600') {
        this.explosions.push({
            x, y,
            radius,
            maxRadius: radius,
            color,
            alpha: 1,
            time: 0
        });
    }

    drawExplosions(deltaTime) {
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            const exp = this.explosions[i];
            exp.time += deltaTime;
            exp.alpha = 1 - exp.time / 0.5;
            exp.radius = exp.maxRadius * (exp.time / 0.3);

            if (exp.alpha <= 0) {
                this.explosions.splice(i, 1);
                continue;
            }

            // Outer ring
            this.ctx.strokeStyle = exp.color;
            this.ctx.lineWidth = 3;
            this.ctx.globalAlpha = exp.alpha;
            this.ctx.beginPath();
            this.ctx.arc(exp.x, exp.y, exp.radius, 0, Math.PI * 2);
            this.ctx.stroke();

            // Inner fill
            this.ctx.fillStyle = exp.color;
            this.ctx.globalAlpha = exp.alpha * 0.3;
            this.ctx.fill();

            this.ctx.globalAlpha = 1;
        }
    }

    drawPlacementPreview(gridX, gridY, canPlace, buildingType) {
        const worldPos = this.grid.gridToWorld(gridX, gridY);
        const size = this.grid.cellSize * 0.9;

        this.ctx.globalAlpha = 0.5;
        this.ctx.fillStyle = canPlace ? '#44ff44' : '#ff4444';
        this.ctx.fillRect(
            worldPos.x - size / 2,
            worldPos.y - size / 2,
            size, size
        );
        this.ctx.globalAlpha = 1;
    }

    drawRangeIndicator(x, y, range) {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.arc(x, y, range * this.grid.cellSize, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }
}
