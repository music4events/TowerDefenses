import { RESOURCE_TYPES } from './data/buildings.js';

export class Renderer {
    constructor(canvas, grid, camera = null) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.grid = grid;
        this.camera = camera || { x: 0, y: 0, zoom: 1 };

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
        this.deathEffects = [];
    }

    // Apply camera transform
    applyCamera() {
        this.ctx.save();
        this.ctx.scale(this.camera.zoom, this.camera.zoom);
        this.ctx.translate(-this.camera.x, -this.camera.y);
    }

    // Restore camera transform
    restoreCamera() {
        this.ctx.restore();
    }

    clear() {
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawGrid() {
        // Calculate visible range for performance
        const startX = Math.max(0, Math.floor(this.camera.x / this.grid.cellSize) - 1);
        const endX = Math.min(this.grid.cols, Math.ceil((this.camera.x + this.canvas.width / this.camera.zoom) / this.grid.cellSize) + 1);
        const startY = Math.max(0, Math.floor(this.camera.y / this.grid.cellSize) - 1);
        const endY = Math.min(this.grid.rows, Math.ceil((this.camera.y + this.canvas.height / this.camera.zoom) / this.grid.cellSize) + 1);

        this.ctx.strokeStyle = this.colors.gridLine;
        this.ctx.lineWidth = 1;

        // Only draw visible grid lines
        for (let x = startX; x <= endX; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.grid.cellSize, startY * this.grid.cellSize);
            this.ctx.lineTo(x * this.grid.cellSize, endY * this.grid.cellSize);
            this.ctx.stroke();
        }

        for (let y = startY; y <= endY; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(startX * this.grid.cellSize, y * this.grid.cellSize);
            this.ctx.lineTo(endX * this.grid.cellSize, y * this.grid.cellSize);
            this.ctx.stroke();
        }

        // Draw border cells (non-buildable) - only visible ones
        this.ctx.fillStyle = 'rgba(50, 50, 80, 0.5)';
        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                if (this.grid.cells[y] && this.grid.cells[y][x] === 4) {
                    this.ctx.fillRect(
                        x * this.grid.cellSize,
                        y * this.grid.cellSize,
                        this.grid.cellSize,
                        this.grid.cellSize
                    );
                }
            }
        }

        // Draw main paths if visualization is enabled
        if (this.grid.showPaths) {
            this.drawMainPaths();
        }
    }

    drawMainPaths() {
        const colors = {
            north: '#ff4444',  // Red
            south: '#44ff44',  // Green
            east: '#4444ff',   // Blue
            west: '#ffff44'    // Yellow
        };

        for (const [direction, path] of Object.entries(this.grid.mainPaths)) {
            if (!path || path.length === 0) continue;

            const color = colors[direction] || '#ffffff';
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 3;
            this.ctx.globalAlpha = 0.6;

            // Draw path as a line
            this.ctx.beginPath();
            for (let i = 0; i < path.length; i++) {
                const point = path[i];
                const worldX = point.x * this.grid.cellSize + this.grid.cellSize / 2;
                const worldY = point.y * this.grid.cellSize + this.grid.cellSize / 2;

                if (i === 0) {
                    this.ctx.moveTo(worldX, worldY);
                } else {
                    this.ctx.lineTo(worldX, worldY);
                }
            }
            this.ctx.stroke();

            // Draw spawn point marker
            const startPoint = path[0];
            if (startPoint) {
                const startX = startPoint.x * this.grid.cellSize + this.grid.cellSize / 2;
                const startY = startPoint.y * this.grid.cellSize + this.grid.cellSize / 2;

                this.ctx.fillStyle = color;
                this.ctx.beginPath();
                this.ctx.arc(startX, startY, 10, 0, Math.PI * 2);
                this.ctx.fill();

                // Label
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = 'bold 12px sans-serif';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(direction.charAt(0).toUpperCase(), startX, startY + 4);
            }

            this.ctx.globalAlpha = 1;
        }
    }

    drawResources() {
        // Calculate visible range for performance
        const startX = Math.max(0, Math.floor(this.camera.x / this.grid.cellSize) - 1);
        const endX = Math.min(this.grid.cols, Math.ceil((this.camera.x + this.canvas.width / this.camera.zoom) / this.grid.cellSize) + 1);
        const startY = Math.max(0, Math.floor(this.camera.y / this.grid.cellSize) - 1);
        const endY = Math.min(this.grid.rows, Math.ceil((this.camera.y + this.canvas.height / this.camera.zoom) / this.grid.cellSize) + 1);

        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                if (this.grid.cells[y] && this.grid.cells[y][x] === 2) {
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

    // Draw boost/aura zones BEFORE turrets so they appear underneath
    drawTurretZone(turret) {
        const { x, y, config } = turret;
        if (!config) return;

        // Draw drone connection line to home
        if (config.isDrone && turret.homeX !== undefined) {
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
        if (config.isSlowdown) {
            const slowRange = (config.aoeRange || config.range) * this.grid.cellSize;
            this.ctx.fillStyle = 'rgba(136, 221, 255, 0.05)';
            this.ctx.beginPath();
            this.ctx.arc(x, y, slowRange, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.strokeStyle = 'rgba(136, 221, 255, 0.25)';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        }

        // Draw shockwave turret zone
        if (config.isShockwave) {
            const shockRange = (config.aoeRange || config.range) * this.grid.cellSize;
            const pulse = (Date.now() / 100) % (Math.PI * 2);
            const pulseAlpha = 0.1 + Math.sin(pulse) * 0.05;

            this.ctx.strokeStyle = `rgba(0, 212, 255, ${pulseAlpha})`;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(x, y, shockRange, 0, Math.PI * 2);
            this.ctx.stroke();
        }

        // Draw speed booster zone
        if (config.isSpeedBooster) {
            const boostRange = (config.range || 4) * this.grid.cellSize;
            this.ctx.fillStyle = config.boostColor || 'rgba(255, 170, 0, 0.08)';
            this.ctx.beginPath();
            this.ctx.arc(x, y, boostRange, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.strokeStyle = 'rgba(255, 170, 0, 0.3)';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        }

        // Draw damage booster zone
        if (config.isDamageBooster) {
            const boostRange = (config.range || 4) * this.grid.cellSize;
            this.ctx.fillStyle = config.boostColor || 'rgba(255, 68, 68, 0.08)';
            this.ctx.beginPath();
            this.ctx.arc(x, y, boostRange, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.strokeStyle = 'rgba(255, 68, 68, 0.3)';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        }
    }

    drawTurret(turret, isSelected = false, mode = null) {
        const { x, y, angle, config, cooldown, level } = turret;
        // Fallback for synced turrets without full config
        const turretSize = config?.size || 0.8;
        const turretColor = config?.color || '#0f3460';
        const size = this.grid.cellSize * turretSize;

        // Special rendering for 2x2 turrets
        if (config?.gridSize === 2) {
            this.drawTurret2x2(turret, isSelected, mode);
            return;
        }

        // Special rendering for 3x3 turrets
        if (config?.gridSize === 3) {
            this.drawTurret3x3(turret, isSelected, mode);
            return;
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

        // Shockwave lightning symbol
        if (config?.isShockwave) {
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(x - 3, y - 6);
            this.ctx.lineTo(x + 1, y - 1);
            this.ctx.lineTo(x - 1, y + 1);
            this.ctx.lineTo(x + 3, y + 6);
            this.ctx.stroke();
        }

        // Speed booster arrow symbol
        if (config?.isSpeedBooster) {
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.moveTo(x + 6, y);
            this.ctx.lineTo(x - 3, y - 5);
            this.ctx.lineTo(x - 3, y + 5);
            this.ctx.closePath();
            this.ctx.fill();
        }

        // Damage booster sword symbol
        if (config?.isDamageBooster) {
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(x - 5, y + 5);
            this.ctx.lineTo(x + 5, y - 5);
            this.ctx.moveTo(x + 3, y - 3);
            this.ctx.lineTo(x + 5, y - 1);
            this.ctx.moveTo(x + 3, y - 3);
            this.ctx.lineTo(x + 1, y - 5);
            this.ctx.stroke();
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

        // Boost indicators
        if (turret.speedBoosted) {
            // Orange glow for speed boost
            this.ctx.strokeStyle = 'rgba(255, 170, 0, 0.6)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(x, y, size / 2 + 3, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        if (turret.damageBoosted) {
            // Red glow for damage boost
            this.ctx.strokeStyle = 'rgba(255, 68, 68, 0.6)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(x, y, size / 2 + (turret.speedBoosted ? 6 : 3), 0, Math.PI * 2);
            this.ctx.stroke();
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

    drawTurret2x2(turret, isSelected = false, mode = null) {
        const { x, y, angle, config, level } = turret;
        const cellSize = this.grid.cellSize;
        const totalSize = cellSize * 2;
        const turretColor = config?.color || '#696969';

        // Selection highlight
        if (isSelected) {
            this.ctx.strokeStyle = mode === 'sell' ? '#e74c3c' : mode === 'upgrade' ? '#f39c12' : '#ffffff';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(x - totalSize / 2 - 2, y - totalSize / 2 - 2, totalSize + 4, totalSize + 4);
        }

        // Base platform
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(x - totalSize / 2, y - totalSize / 2, totalSize, totalSize);

        // Main body
        this.ctx.fillStyle = turretColor;
        this.ctx.beginPath();
        this.ctx.arc(x, y, totalSize / 2 - 4, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.strokeStyle = '#0a0a1a';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Type-specific rendering
        if (config?.isMissile) {
            // Missile launcher - dual missile pods
            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.rotate(angle);

            // Missile tubes
            this.ctx.fillStyle = '#555555';
            this.ctx.fillRect(-8, -15, 30, 10);
            this.ctx.fillRect(-8, 5, 30, 10);

            // Missile tips
            this.ctx.fillStyle = '#ff4400';
            this.ctx.beginPath();
            this.ctx.moveTo(22, -10);
            this.ctx.lineTo(28, -10);
            this.ctx.lineTo(25, -7);
            this.ctx.lineTo(25, -13);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.beginPath();
            this.ctx.moveTo(22, 10);
            this.ctx.lineTo(28, 10);
            this.ctx.lineTo(25, 13);
            this.ctx.lineTo(25, 7);
            this.ctx.closePath();
            this.ctx.fill();

            this.ctx.restore();
        } else if (config?.isPlasma) {
            // Plasma cannon - glowing orb
            const pulse = Math.sin(Date.now() / 100) * 0.3 + 0.7;
            this.ctx.fillStyle = `rgba(218, 112, 214, ${pulse})`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 12, 0, Math.PI * 2);
            this.ctx.fill();

            // Glow effect
            const gradient = this.ctx.createRadialGradient(x, y, 5, x, y, 20);
            gradient.addColorStop(0, 'rgba(148, 0, 211, 0.5)');
            gradient.addColorStop(1, 'rgba(148, 0, 211, 0)');
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 20, 0, Math.PI * 2);
            this.ctx.fill();

            // Barrel
            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.rotate(angle);
            this.ctx.fillStyle = '#666666';
            this.ctx.fillRect(10, -6, 25, 12);
            this.ctx.restore();
        } else if (config?.isCryo) {
            // Cryo tower - ice crystal look
            this.ctx.fillStyle = '#00ffff';
            // Crystal shape
            this.ctx.beginPath();
            this.ctx.moveTo(x, y - 15);
            this.ctx.lineTo(x + 10, y);
            this.ctx.lineTo(x, y + 15);
            this.ctx.lineTo(x - 10, y);
            this.ctx.closePath();
            this.ctx.fill();

            // Inner glow
            this.ctx.fillStyle = 'rgba(170, 255, 255, 0.6)';
            this.ctx.beginPath();
            this.ctx.moveTo(x, y - 8);
            this.ctx.lineTo(x + 5, y);
            this.ctx.lineTo(x, y + 8);
            this.ctx.lineTo(x - 5, y);
            this.ctx.closePath();
            this.ctx.fill();

            // Ice particles effect
            this.ctx.fillStyle = 'rgba(170, 255, 255, 0.4)';
            for (let i = 0; i < 6; i++) {
                const particleAngle = (Date.now() / 1000 + i) % (Math.PI * 2);
                const px = x + Math.cos(particleAngle) * 18;
                const py = y + Math.sin(particleAngle) * 18;
                this.ctx.beginPath();
                this.ctx.arc(px, py, 3, 0, Math.PI * 2);
                this.ctx.fill();
            }
        } else if (config?.isGatling) {
            // Gatling gun - rotating barrels
            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.rotate(angle);

            // Barrel housing
            this.ctx.fillStyle = '#555555';
            this.ctx.fillRect(-5, -12, 35, 24);

            // Rotating barrels
            const spinAngle = turret.spinAngle || 0;
            this.ctx.save();
            this.ctx.translate(15, 0);
            this.ctx.rotate(spinAngle);

            this.ctx.fillStyle = '#333333';
            for (let i = 0; i < 6; i++) {
                const bAngle = (i / 6) * Math.PI * 2;
                this.ctx.fillRect(
                    Math.cos(bAngle) * 6 - 2,
                    Math.sin(bAngle) * 6 - 2,
                    20, 4
                );
            }
            this.ctx.restore();
            this.ctx.restore();
        } else if (config?.isEMP) {
            // EMP tower - electric coils
            // Center sphere
            const pulse = Math.sin(Date.now() / 150) * 0.3 + 0.7;
            this.ctx.fillStyle = `rgba(100, 149, 237, ${pulse})`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 15, 0, Math.PI * 2);
            this.ctx.fill();

            // Electric arcs
            this.ctx.strokeStyle = '#6495ed';
            this.ctx.lineWidth = 2;
            for (let i = 0; i < 4; i++) {
                const arcAngle = (Date.now() / 500 + i * Math.PI / 2) % (Math.PI * 2);
                this.ctx.beginPath();
                this.ctx.arc(x, y, 22, arcAngle, arcAngle + 0.5);
                this.ctx.stroke();
            }

            // Coil rings
            this.ctx.strokeStyle = 'rgba(100, 149, 237, 0.5)';
            this.ctx.beginPath();
            this.ctx.arc(x, y, 25, 0, Math.PI * 2);
            this.ctx.stroke();
        }

        // Level stars
        if (level > 1) {
            const starY = y + totalSize / 2 + 10;
            this.drawStars(x, starY, level - 1);
        }

        // Health bar
        const health = turret.health;
        const maxHealth = turret.maxHealth || config?.maxHealth || 200;
        if (health < maxHealth) {
            const barWidth = totalSize - 8;
            const barHeight = 5;
            const barY = y + totalSize / 2 + 3;

            this.ctx.fillStyle = '#333';
            this.ctx.fillRect(x - barWidth / 2, barY, barWidth, barHeight);

            const healthPercent = health / maxHealth;
            this.ctx.fillStyle = healthPercent > 0.5 ? '#44ff44' : healthPercent > 0.25 ? '#ffff00' : '#ff4444';
            this.ctx.fillRect(x - barWidth / 2, barY, barWidth * healthPercent, barHeight);
        }
    }

    drawTurret3x3(turret, isSelected = false, mode = null) {
        const { x, y, angle, config, level } = turret;
        const cellSize = this.grid.cellSize;
        const totalSize = cellSize * 3;
        const turretColor = config?.color || '#2a5caa';

        // Selection highlight for 3x3
        if (isSelected) {
            this.ctx.strokeStyle = mode === 'sell' ? '#e74c3c' : mode === 'upgrade' ? '#f39c12' : '#ffffff';
            this.ctx.lineWidth = 4;
            this.ctx.strokeRect(
                x - totalSize / 2 - 3,
                y - totalSize / 2 - 3,
                totalSize + 6,
                totalSize + 6
            );
        }

        // Base platform (darker rectangle)
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(x - totalSize / 2, y - totalSize / 2, totalSize, totalSize);

        // Main body (octagonal or circular)
        this.ctx.fillStyle = turretColor;
        this.ctx.beginPath();
        this.ctx.arc(x, y, totalSize / 2 - 5, 0, Math.PI * 2);
        this.ctx.fill();

        // Darker ring
        this.ctx.strokeStyle = '#0a0a1a';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        // Inner detail ring
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y, totalSize / 3, 0, Math.PI * 2);
        this.ctx.stroke();

        // Double barrels (for FLAK)
        if (config?.barrelCount === 2) {
            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.rotate(angle);

            const barrelLength = totalSize / 2 + 15;
            const barrelWidth = 8;
            const barrelSpacing = 12;

            // Left barrel
            this.ctx.fillStyle = '#444444';
            this.ctx.fillRect(0, -barrelSpacing - barrelWidth / 2, barrelLength, barrelWidth);
            this.ctx.strokeStyle = '#222222';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(0, -barrelSpacing - barrelWidth / 2, barrelLength, barrelWidth);

            // Right barrel
            this.ctx.fillStyle = '#444444';
            this.ctx.fillRect(0, barrelSpacing - barrelWidth / 2, barrelLength, barrelWidth);
            this.ctx.strokeStyle = '#222222';
            this.ctx.strokeRect(0, barrelSpacing - barrelWidth / 2, barrelLength, barrelWidth);

            // Barrel tips (muzzle)
            this.ctx.fillStyle = '#666666';
            this.ctx.beginPath();
            this.ctx.arc(barrelLength, -barrelSpacing, barrelWidth / 2 + 2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.beginPath();
            this.ctx.arc(barrelLength, barrelSpacing, barrelWidth / 2 + 2, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.restore();
        }

        // Anti-air symbol (radar dish icon)
        if (config?.isAntiAir) {
            this.ctx.strokeStyle = '#00ddff';
            this.ctx.lineWidth = 2;
            for (let i = 1; i <= 3; i++) {
                this.ctx.globalAlpha = 0.3 + (i * 0.2);
                this.ctx.beginPath();
                this.ctx.arc(x, y, 10 + i * 8, -Math.PI / 3, Math.PI / 3);
                this.ctx.stroke();
            }
            this.ctx.globalAlpha = 1;
        }

        // Type-specific 3x3 rendering
        if (config?.isMegaTesla) {
            // Tesla coils
            for (let i = 0; i < 3; i++) {
                const coilAngle = (i / 3) * Math.PI * 2 + Date.now() / 1000;
                const coilX = x + Math.cos(coilAngle) * 25;
                const coilY = y + Math.sin(coilAngle) * 25;

                this.ctx.fillStyle = '#00ffff';
                this.ctx.beginPath();
                this.ctx.arc(coilX, coilY, 8, 0, Math.PI * 2);
                this.ctx.fill();

                // Electric arcs
                this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.6)';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(x, y);
                this.ctx.lineTo(coilX, coilY);
                this.ctx.stroke();
            }

            // Center orb
            const pulse = Math.sin(Date.now() / 100) * 0.3 + 0.7;
            this.ctx.fillStyle = `rgba(0, 255, 255, ${pulse})`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 15, 0, Math.PI * 2);
            this.ctx.fill();
        } else if (config?.isMegaRailgun) {
            // Massive barrel
            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.rotate(angle);

            // Main barrel
            this.ctx.fillStyle = '#1e90ff';
            this.ctx.fillRect(-10, -8, 60, 16);

            // Rails
            this.ctx.fillStyle = '#4169e1';
            this.ctx.fillRect(-10, -12, 55, 4);
            this.ctx.fillRect(-10, 8, 55, 4);

            // Capacitor glow
            const charge = Math.sin(Date.now() / 200) * 0.5 + 0.5;
            this.ctx.fillStyle = `rgba(0, 191, 255, ${charge})`;
            this.ctx.beginPath();
            this.ctx.arc(-5, 0, 12, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.restore();
        } else if (config?.isRocketArray || config?.isMissileBattery) {
            // Multiple rocket tubes
            const tubes = config?.isMissileBattery ? 12 : 6;
            const rows = config?.isMissileBattery ? 3 : 2;
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < tubes / rows; c++) {
                    const tx = x - 20 + c * 12;
                    const ty = y - 15 + r * 15;
                    this.ctx.fillStyle = '#333333';
                    this.ctx.beginPath();
                    this.ctx.arc(tx, ty, 5, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.fillStyle = '#ff4500';
                    this.ctx.beginPath();
                    this.ctx.arc(tx, ty, 3, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }
        } else if (config?.isLaserArray) {
            // Multiple laser emitters
            for (let i = 0; i < 4; i++) {
                const emitterAngle = (i / 4) * Math.PI * 2;
                const ex = x + Math.cos(emitterAngle) * 20;
                const ey = y + Math.sin(emitterAngle) * 20;

                this.ctx.fillStyle = '#32cd32';
                this.ctx.beginPath();
                this.ctx.arc(ex, ey, 6, 0, Math.PI * 2);
                this.ctx.fill();

                // Glow
                this.ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
                this.ctx.beginPath();
                this.ctx.arc(ex, ey, 10, 0, Math.PI * 2);
                this.ctx.fill();
            }
        } else if (config?.isParticle) {
            // Particle accelerator rings
            this.ctx.strokeStyle = '#ff1493';
            this.ctx.lineWidth = 3;
            const rot = Date.now() / 500;
            for (let i = 0; i < 2; i++) {
                this.ctx.beginPath();
                this.ctx.ellipse(x, y, 25, 15, rot + i * Math.PI / 2, 0, Math.PI * 2);
                this.ctx.stroke();
            }

            // Center particle
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(x, y, 8, 0, Math.PI * 2);
            this.ctx.fill();
        } else if (config?.isNuclear) {
            // Nuclear symbol
            this.ctx.fillStyle = '#ffff00';
            this.ctx.beginPath();
            this.ctx.arc(x, y, 10, 0, Math.PI * 2);
            this.ctx.fill();

            // Radiation symbol
            this.ctx.fillStyle = '#000000';
            for (let i = 0; i < 3; i++) {
                const segAngle = (i / 3) * Math.PI * 2 - Math.PI / 2;
                this.ctx.beginPath();
                this.ctx.moveTo(x, y);
                this.ctx.arc(x, y, 20, segAngle - 0.4, segAngle + 0.4);
                this.ctx.closePath();
                this.ctx.fill();
            }

            // Warning glow
            const pulse = Math.sin(Date.now() / 300) * 0.3 + 0.4;
            this.ctx.fillStyle = `rgba(255, 255, 0, ${pulse})`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 30, 0, Math.PI * 2);
            this.ctx.fill();
        } else if (config?.isStorm) {
            // Storm cloud
            this.ctx.fillStyle = '#4b0082';
            for (let i = 0; i < 5; i++) {
                const cx = x + (Math.random() - 0.5) * 30;
                const cy = y + (Math.random() - 0.5) * 20;
                this.ctx.beginPath();
                this.ctx.arc(cx, cy, 12, 0, Math.PI * 2);
                this.ctx.fill();
            }

            // Lightning
            if (Math.random() > 0.7) {
                this.ctx.strokeStyle = '#da70d6';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(x, y);
                this.ctx.lineTo(x + (Math.random() - 0.5) * 40, y + 30);
                this.ctx.stroke();
            }
        } else if (config?.isDeathRay) {
            // Death ray emitter
            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.rotate(angle);

            // Main emitter
            this.ctx.fillStyle = '#8b0000';
            this.ctx.fillRect(-5, -15, 50, 30);

            // Heat vents
            const heat = turret.heatLevel || 0;
            this.ctx.fillStyle = `rgb(${100 + heat * 1.5}, ${50 - heat * 0.5}, 0)`;
            for (let i = 0; i < 3; i++) {
                this.ctx.fillRect(10 + i * 12, -18, 8, 36);
            }

            this.ctx.restore();
        } else if (config?.isOrbital) {
            // Satellite dish
            this.ctx.fillStyle = '#ffd700';
            this.ctx.beginPath();
            this.ctx.arc(x, y, 20, Math.PI, Math.PI * 2);
            this.ctx.fill();

            // Dish details
            this.ctx.strokeStyle = '#daa520';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 15, Math.PI, Math.PI * 2);
            this.ctx.stroke();

            // Antenna
            this.ctx.fillStyle = '#ffd700';
            this.ctx.fillRect(x - 2, y - 25, 4, 25);

            // Signal rings
            const signalPhase = (Date.now() / 500) % 1;
            this.ctx.strokeStyle = `rgba(255, 215, 0, ${1 - signalPhase})`;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(x, y - 25, 10 + signalPhase * 20, 0, Math.PI * 2);
            this.ctx.stroke();
        } else if (!config?.isAntiAir && !config?.barrelCount) {
            // Default 3x3 barrel
            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.rotate(angle);
            this.ctx.fillStyle = '#444444';
            this.ctx.fillRect(0, -6, totalSize / 2 + 10, 12);
            this.ctx.restore();
        }

        // Level stars (bigger for 3x3)
        if (level > 1) {
            const starY = y + totalSize / 2 + 12;
            this.drawStars(x, starY, level - 1);
        }

        // Health bar (wider for 3x3)
        const health = turret.health;
        const maxHealth = turret.maxHealth || config?.maxHealth || 400;
        if (health < maxHealth) {
            const barWidth = totalSize - 10;
            const barHeight = 6;
            const barY = y + totalSize / 2 + 5;

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
        // Safety check - skip invalid projectiles
        if (!projectile || !isFinite(projectile.x) || !isFinite(projectile.y)) {
            return;
        }

        const { x, y, config, type } = projectile;
        const projColor = projectile.color || config?.projectileColor || '#ffff00';

        if (type === 'bullet') {
            // Enhanced bullet with trail
            const dx = projectile.vx || 0;
            const dy = projectile.vy || 0;
            const speed = Math.sqrt(dx * dx + dy * dy);

            // Tracer trail
            if (speed > 0) {
                const trailLen = 8;
                this.ctx.strokeStyle = projColor;
                this.ctx.lineWidth = 2;
                this.ctx.lineCap = 'round';
                this.ctx.beginPath();
                this.ctx.moveTo(x - (dx / speed) * trailLen, y - (dy / speed) * trailLen);
                this.ctx.lineTo(x, y);
                this.ctx.stroke();
            }

            // Bright tip
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(x, y, 2, 0, Math.PI * 2);
            this.ctx.fill();
        } else if (type === 'artillery') {
            // Artillery shell with arc trail
            const dx = projectile.vx || 0;
            const dy = projectile.vy || 0;
            const speed = Math.sqrt(dx * dx + dy * dy);

            // Smoke puff trail
            if (speed > 0) {
                const trailLen = 10;
                this.ctx.fillStyle = 'rgba(100, 100, 100, 0.4)';
                for (let i = 0; i < 3; i++) {
                    const t = (i + 1) / 4;
                    const px = x - (dx / speed) * trailLen * t + (Math.random() - 0.5) * 4;
                    const py = y - (dy / speed) * trailLen * t + (Math.random() - 0.5) * 4;
                    this.ctx.beginPath();
                    this.ctx.arc(px, py, 3 - i, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }

            // Shell body
            this.ctx.fillStyle = projColor;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 5, 0, Math.PI * 2);
            this.ctx.fill();

            // Highlight
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(x - 1, y - 1, 2, 0, Math.PI * 2);
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
            // Epic flame particle with gradient and glow
            const lifeRatio = Math.max(0, Math.min(1, projectile.life || 0));
            const size = (projectile.size || 10) * (0.3 + lifeRatio * 0.7);

            // Skip if size is invalid
            if (!isFinite(size) || size <= 0) return;

            // Color transitions from white/yellow -> orange -> red as it fades
            const r = 255;
            const g = Math.floor(255 * lifeRatio * lifeRatio);  // Yellow fades faster
            const b = Math.floor(100 * lifeRatio * lifeRatio * lifeRatio);

            // Outer glow
            const glowGradient = this.ctx.createRadialGradient(x, y, 0, x, y, size * 1.5);
            glowGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${lifeRatio * 0.8})`);
            glowGradient.addColorStop(0.5, `rgba(255, ${Math.floor(g * 0.6)}, 0, ${lifeRatio * 0.4})`);
            glowGradient.addColorStop(1, `rgba(255, 50, 0, 0)`);
            this.ctx.fillStyle = glowGradient;
            this.ctx.beginPath();
            this.ctx.arc(x, y, size * 1.5, 0, Math.PI * 2);
            this.ctx.fill();

            // Core flame
            const coreGradient = this.ctx.createRadialGradient(x, y, 0, x, y, size);
            coreGradient.addColorStop(0, `rgba(255, 255, 200, ${lifeRatio})`);
            coreGradient.addColorStop(0.3, `rgba(255, ${g}, 50, ${lifeRatio * 0.9})`);
            coreGradient.addColorStop(1, `rgba(255, 100, 0, ${lifeRatio * 0.5})`);
            this.ctx.fillStyle = coreGradient;
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();

            // Sparks
            if (Math.random() > 0.7) {
                this.ctx.fillStyle = `rgba(255, 255, 100, ${lifeRatio})`;
                const sparkX = x + (Math.random() - 0.5) * size * 2;
                const sparkY = y + (Math.random() - 0.5) * size * 2;
                this.ctx.beginPath();
                this.ctx.arc(sparkX, sparkY, 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
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
        } else if (type === 'flak') {
            // FLAK tracer - small fast projectile with trail
            const dx = projectile.vx || 0;
            const dy = projectile.vy || 0;
            const speed = Math.sqrt(dx * dx + dy * dy);

            // Calculate trail direction (opposite of movement)
            const trailLength = 12;
            let trailX = x;
            let trailY = y;
            if (speed > 0) {
                trailX = x - (dx / speed) * trailLength;
                trailY = y - (dy / speed) * trailLength;
            }

            // Draw tracer line
            this.ctx.strokeStyle = projColor;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(trailX, trailY);
            this.ctx.lineTo(x, y);
            this.ctx.stroke();

            // Bright tip
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(x, y, 2, 0, Math.PI * 2);
            this.ctx.fill();
        } else if (type === 'missile' || type === 'rocket' || type === 'battery-missile') {
            // OPTIMIZED HOMING MISSILE - satisfying trail effect
            const dx = projectile.vx || 0;
            const dy = projectile.vy || 0;
            const angle = Math.atan2(dy, dx);

            const isBattery = type === 'battery-missile';
            const missileLength = isBattery ? 12 : 16;
            const missileWidth = isBattery ? 3 : 4;

            // Fast trail rendering - simple colored line segments (NO gradients!)
            if (projectile.trail && projectile.trail.length > 1) {
                // Draw trail as connected lines with fading colors
                this.ctx.lineCap = 'round';
                for (let i = 1; i < projectile.trail.length; i++) {
                    const t = projectile.trail[i];
                    const prev = projectile.trail[i - 1];
                    const progress = i / projectile.trail.length;
                    const alpha = t.life * (1 - progress * 0.3);

                    if (alpha > 0.1) {
                        // Fire color based on position in trail
                        const r = Math.floor(255 - progress * 55);
                        const g = Math.floor(200 * (1 - progress * 0.7));
                        const b = Math.floor(50 * (1 - progress));

                        this.ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
                        this.ctx.lineWidth = (isBattery ? 4 : 6) * t.life;
                        this.ctx.beginPath();
                        this.ctx.moveTo(prev.x, prev.y);
                        this.ctx.lineTo(t.x, t.y);
                        this.ctx.stroke();
                    }
                    t.life -= 0.12;
                }
                // Clean up dead particles
                while (projectile.trail.length > 0 && projectile.trail[0].life <= 0) {
                    projectile.trail.shift();
                }
            }

            // Missile glow - simple circle
            const glowSize = isBattery ? 10 : 14;
            this.ctx.fillStyle = 'rgba(255, 150, 50, 0.4)';
            this.ctx.beginPath();
            this.ctx.arc(x, y, glowSize, 0, Math.PI * 2);
            this.ctx.fill();

            // Missile body
            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.rotate(angle);

            // Body - simple metallic look
            this.ctx.fillStyle = '#aaaaaa';
            this.ctx.fillRect(-missileLength, -missileWidth/2, missileLength, missileWidth);

            // Highlight stripe
            this.ctx.fillStyle = '#dddddd';
            this.ctx.fillRect(-missileLength, -missileWidth/4, missileLength, missileWidth/2);

            // Warhead (colored tip)
            this.ctx.fillStyle = projColor;
            this.ctx.beginPath();
            this.ctx.moveTo(3, 0);
            this.ctx.lineTo(-1, -missileWidth);
            this.ctx.lineTo(-1, missileWidth);
            this.ctx.closePath();
            this.ctx.fill();

            // Fins
            this.ctx.fillStyle = '#666666';
            this.ctx.fillRect(-missileLength + 1, -missileWidth - 2, 3, 2);
            this.ctx.fillRect(-missileLength + 1, missileWidth, 3, 2);

            // Exhaust flame - simple animated triangle
            const flameLength = 8 + Math.random() * 6;

            // Outer flame (orange)
            this.ctx.fillStyle = '#ff6600';
            this.ctx.beginPath();
            this.ctx.moveTo(-missileLength, -2);
            this.ctx.lineTo(-missileLength - flameLength, 0);
            this.ctx.lineTo(-missileLength, 2);
            this.ctx.closePath();
            this.ctx.fill();

            // Inner flame (yellow/white)
            this.ctx.fillStyle = '#ffff88';
            this.ctx.beginPath();
            this.ctx.moveTo(-missileLength, -1);
            this.ctx.lineTo(-missileLength - flameLength * 0.5, 0);
            this.ctx.lineTo(-missileLength, 1);
            this.ctx.closePath();
            this.ctx.fill();

            this.ctx.restore();
        } else if (type === 'plasma') {
            // Plasma ball with pulsing glow
            const pulse = Math.sin(Date.now() / 50 + (projectile.pulsePhase || 0)) * 0.3 + 0.7;
            const size = (projectile.plasmaSize || 15) * pulse;

            // Skip if size is invalid
            if (!isFinite(size) || size <= 0) return;

            // Outer glow
            const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, size * 1.5);
            gradient.addColorStop(0, 'rgba(218, 112, 214, 0.8)');
            gradient.addColorStop(0.5, 'rgba(148, 0, 211, 0.4)');
            gradient.addColorStop(1, 'rgba(148, 0, 211, 0)');
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(x, y, size * 1.5, 0, Math.PI * 2);
            this.ctx.fill();

            // Core
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
            this.ctx.fill();

            // Trail
            if (projectile.trail) {
                projectile.trail.push({ x, y, life: 1 });
                if (projectile.trail.length > 10) projectile.trail.shift();
            }
        } else if (type === 'cryo-beam') {
            // Cryo beam with ice particles
            this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.6)';
            this.ctx.lineWidth = 6;
            this.ctx.beginPath();
            this.ctx.moveTo(projectile.startX, projectile.startY);
            this.ctx.lineTo(x, y);
            this.ctx.stroke();

            // Inner beam
            this.ctx.strokeStyle = 'rgba(170, 255, 255, 0.9)';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // Ice particles along beam
            const dx = x - projectile.startX;
            const dy = y - projectile.startY;
            for (let i = 0; i < 8; i++) {
                const t = Math.random();
                const px = projectile.startX + dx * t + (Math.random() - 0.5) * 10;
                const py = projectile.startY + dy * t + (Math.random() - 0.5) * 10;
                this.ctx.fillStyle = 'rgba(200, 255, 255, 0.8)';
                this.ctx.beginPath();
                this.ctx.arc(px, py, 2 + Math.random() * 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
        } else if (type === 'gatling') {
            // Fast tracer
            const dx = projectile.vx || 0;
            const dy = projectile.vy || 0;
            const speed = Math.sqrt(dx * dx + dy * dy);
            const trailLength = 15;

            this.ctx.strokeStyle = projColor;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            if (speed > 0) {
                this.ctx.moveTo(x - (dx / speed) * trailLength, y - (dy / speed) * trailLength);
            } else {
                this.ctx.moveTo(x, y);
            }
            this.ctx.lineTo(x, y);
            this.ctx.stroke();
        } else if (type === 'emp-wave') {
            // EMP expanding wave
            const progress = 1 - projectile.life / 0.5;
            const radius = projectile.maxRadius * progress;

            for (let w = 0; w < (projectile.waveCount || 3); w++) {
                const waveRadius = radius - w * 15;
                if (waveRadius > 0) {
                    this.ctx.strokeStyle = `rgba(100, 149, 237, ${(1 - progress) * 0.8})`;
                    this.ctx.lineWidth = 4 - w;
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, waveRadius, 0, Math.PI * 2);
                    this.ctx.stroke();
                }
            }

            // Electric sparks
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 1;
            for (let i = 0; i < 8; i++) {
                const sparkAngle = (i / 8) * Math.PI * 2 + Date.now() / 100;
                const sparkR = radius * 0.8;
                this.ctx.beginPath();
                this.ctx.moveTo(x + Math.cos(sparkAngle) * sparkR * 0.8, y + Math.sin(sparkAngle) * sparkR * 0.8);
                this.ctx.lineTo(x + Math.cos(sparkAngle) * sparkR, y + Math.sin(sparkAngle) * sparkR);
                this.ctx.stroke();
            }
        } else if (type === 'mega-tesla') {
            // Giant lightning bolt with branches
            this.drawMegaLightning(projectile.startX, projectile.startY, x, y, projectile.boltWidth || 6, projectile.branches || 2);
        } else if (type === 'mega-railgun') {
            // Massive beam with charge effect
            const beamWidth = projectile.coreWidth || 12;

            // Outer glow
            this.ctx.strokeStyle = 'rgba(0, 191, 255, 0.3)';
            this.ctx.lineWidth = beamWidth * 3;
            this.ctx.beginPath();
            this.ctx.moveTo(projectile.startX, projectile.startY);
            this.ctx.lineTo(x, y);
            this.ctx.stroke();

            // Main beam
            this.ctx.strokeStyle = config?.beamColor || '#00bfff';
            this.ctx.lineWidth = beamWidth;
            this.ctx.stroke();

            // Core
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = beamWidth / 3;
            this.ctx.stroke();

            // Impact flash
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.beginPath();
            this.ctx.arc(x, y, beamWidth, 0, Math.PI * 2);
            this.ctx.fill();
        } else if (type === 'laser-array') {
            // Multiple colored laser beams
            const colors = ['#00ff00', '#00ff44', '#44ff00', '#00ff88'];
            const color = colors[projectile.laserIndex % colors.length];

            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(projectile.startX, projectile.startY);
            this.ctx.lineTo(x, y);
            this.ctx.stroke();

            // Glow
            this.ctx.strokeStyle = `${color}44`;
            this.ctx.lineWidth = 8;
            this.ctx.stroke();
        } else if (type === 'particle-beam') {
            // Particle beam with floating particles
            const beamColor = config?.beamColor || '#ff69b4';

            // Main beam
            this.ctx.strokeStyle = beamColor;
            this.ctx.lineWidth = config?.beamWidth || 8;
            this.ctx.beginPath();
            this.ctx.moveTo(projectile.startX, projectile.startY);
            this.ctx.lineTo(x, y);
            this.ctx.stroke();

            // Core
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // Particles
            const dx = x - projectile.startX;
            const dy = y - projectile.startY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            for (let i = 0; i < (projectile.particleCount || 50); i++) {
                const t = Math.random();
                const offset = (Math.random() - 0.5) * 20;
                const px = projectile.startX + dx * t + (-dy / dist) * offset;
                const py = projectile.startY + dy * t + (dx / dist) * offset;

                this.ctx.fillStyle = `rgba(255, 105, 180, ${Math.random() * 0.8})`;
                this.ctx.beginPath();
                this.ctx.arc(px, py, 1 + Math.random() * 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
        } else if (type === 'nuclear') {
            // OPTIMIZED Nuclear ICBM - impressive but performant
            const dx = projectile.vx || 0;
            const dy = projectile.vy || 0;
            const angle = Math.atan2(dy, dx);

            // Simplified radiation trail - line segments instead of gradients
            if (projectile.trail && projectile.trail.length > 1) {
                this.ctx.lineCap = 'round';
                for (let i = 1; i < projectile.trail.length; i++) {
                    const t = projectile.trail[i];
                    const prev = projectile.trail[i - 1];
                    const progress = i / projectile.trail.length;
                    const alpha = t.life * (1 - progress * 0.4);

                    if (alpha > 0.1) {
                        // Radiation color (green -> yellow -> orange)
                        const g = Math.floor(255 * (1 - progress * 0.3));
                        const r = Math.floor(200 + progress * 55);

                        this.ctx.strokeStyle = `rgba(${r}, ${g}, 50, ${alpha})`;
                        this.ctx.lineWidth = 10 * t.life * (1 - progress * 0.5);
                        this.ctx.beginPath();
                        this.ctx.moveTo(prev.x, prev.y);
                        this.ctx.lineTo(t.x, t.y);
                        this.ctx.stroke();
                    }
                    t.life -= 0.08;
                }
                // Clean up
                while (projectile.trail.length > 0 && projectile.trail[0].life <= 0) {
                    projectile.trail.shift();
                }
            }

            // Simple radioactive glow (pulsing)
            const pulse = Math.sin(Date.now() / 50) * 0.3 + 0.7;
            const glowSize = 25 * pulse;

            // Outer glow (yellow/green)
            this.ctx.fillStyle = `rgba(200, 255, 50, ${0.4 * pulse})`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, glowSize, 0, Math.PI * 2);
            this.ctx.fill();

            // Inner glow
            this.ctx.fillStyle = `rgba(255, 255, 100, ${0.6 * pulse})`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, glowSize * 0.5, 0, Math.PI * 2);
            this.ctx.fill();

            // ICBM body
            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.rotate(angle);

            const bodyLength = 28;
            const bodyWidth = 7;

            // Body - simple metallic
            this.ctx.fillStyle = '#777777';
            this.ctx.fillRect(-bodyLength, -bodyWidth/2, bodyLength, bodyWidth);

            // Highlight
            this.ctx.fillStyle = '#aaaaaa';
            this.ctx.fillRect(-bodyLength, -bodyWidth/4, bodyLength, bodyWidth/2);

            // Warhead cone (yellow radiation)
            this.ctx.fillStyle = '#ffcc00';
            this.ctx.beginPath();
            this.ctx.moveTo(10, 0);
            this.ctx.lineTo(-4, -bodyWidth - 1);
            this.ctx.lineTo(-4, bodyWidth + 1);
            this.ctx.closePath();
            this.ctx.fill();

            // Radiation hazard stripes
            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(-2, -bodyWidth/2 - 1, 2, bodyWidth + 2);
            this.ctx.fillRect(-6, -bodyWidth/2 - 1, 2, bodyWidth + 2);

            // Fins
            this.ctx.fillStyle = '#555555';
            this.ctx.fillRect(-bodyLength + 2, -bodyWidth - 4, 5, 4);
            this.ctx.fillRect(-bodyLength + 2, bodyWidth, 5, 4);

            // Massive exhaust flame
            const flameLength = 20 + Math.random() * 12;

            // Outer flame (orange)
            this.ctx.fillStyle = '#ff6600';
            this.ctx.beginPath();
            this.ctx.moveTo(-bodyLength, -4);
            this.ctx.lineTo(-bodyLength - flameLength, 0);
            this.ctx.lineTo(-bodyLength, 4);
            this.ctx.closePath();
            this.ctx.fill();

            // Middle flame (yellow)
            this.ctx.fillStyle = '#ffcc00';
            this.ctx.beginPath();
            this.ctx.moveTo(-bodyLength, -2);
            this.ctx.lineTo(-bodyLength - flameLength * 0.6, 0);
            this.ctx.lineTo(-bodyLength, 2);
            this.ctx.closePath();
            this.ctx.fill();

            // Core (white)
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.moveTo(-bodyLength, -1);
            this.ctx.lineTo(-bodyLength - flameLength * 0.3, 0);
            this.ctx.lineTo(-bodyLength, 1);
            this.ctx.closePath();
            this.ctx.fill();

            this.ctx.restore();
        } else if (type === 'storm-cloud') {
            // Storm cloud effect
            this.ctx.fillStyle = `rgba(75, 0, 130, ${projectile.life * 0.3})`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, projectile.radius, 0, Math.PI * 2);
            this.ctx.fill();

            // Swirling effect
            this.ctx.strokeStyle = `rgba(138, 43, 226, ${projectile.life * 0.5})`;
            this.ctx.lineWidth = 3;
            const swirl = Date.now() / 200;
            this.ctx.beginPath();
            this.ctx.arc(x, y, projectile.radius * 0.7, swirl, swirl + Math.PI);
            this.ctx.stroke();
        } else if (type === 'storm-bolt') {
            // Lightning from sky
            if (projectile.delay <= 0) {
                this.drawMegaLightning(projectile.startX, projectile.startY, x, y, 4, 3);
            }
        } else if (type === 'death-ray') {
            // Continuous death beam with heat effect
            const heat = projectile.heatLevel || 0;
            const heatColor = `rgb(${155 + heat}, ${50 - heat * 0.5}, ${50 - heat * 0.5})`;

            // Outer heat glow
            this.ctx.strokeStyle = `rgba(255, 0, 0, ${0.2 + heat / 200})`;
            this.ctx.lineWidth = (config?.beamWidth || 10) + heat / 10;
            this.ctx.beginPath();
            this.ctx.moveTo(projectile.startX, projectile.startY);
            this.ctx.lineTo(x, y);
            this.ctx.stroke();

            // Main beam
            this.ctx.strokeStyle = heatColor;
            this.ctx.lineWidth = config?.beamWidth || 10;
            this.ctx.stroke();

            // Core
            this.ctx.strokeStyle = config?.coreColor || '#ffff00';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
        } else if (type === 'orbital-warning') {
            // EPIC Warning with targeting animation
            const progress = projectile.life / 1.2;
            const shrinkRadius = projectile.radius * progress;
            const pulse = Math.sin(Date.now() / 30) * 0.4 + 0.6;

            // Outer warning circle (shrinking)
            this.ctx.strokeStyle = `rgba(255, 0, 0, ${pulse})`;
            this.ctx.lineWidth = 4;
            this.ctx.setLineDash([15, 10]);
            this.ctx.beginPath();
            this.ctx.arc(x, y, shrinkRadius, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.setLineDash([]);

            // Inner targeting circle
            this.ctx.strokeStyle = `rgba(255, 100, 0, ${pulse * 0.8})`;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(x, y, shrinkRadius * 0.6, 0, Math.PI * 2);
            this.ctx.stroke();

            // Rotating targeting lines
            const rotAngle = Date.now() / 200;
            this.ctx.strokeStyle = '#ff0000';
            this.ctx.lineWidth = 2;
            for (let i = 0; i < 4; i++) {
                const lineAngle = rotAngle + (i * Math.PI / 2);
                const innerR = shrinkRadius * 0.3;
                const outerR = shrinkRadius * 0.9;
                this.ctx.beginPath();
                this.ctx.moveTo(x + Math.cos(lineAngle) * innerR, y + Math.sin(lineAngle) * innerR);
                this.ctx.lineTo(x + Math.cos(lineAngle) * outerR, y + Math.sin(lineAngle) * outerR);
                this.ctx.stroke();
            }

            // Center crosshairs
            const crossSize = 15 + Math.sin(Date.now() / 100) * 5;
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(x - crossSize, y);
            this.ctx.lineTo(x + crossSize, y);
            this.ctx.moveTo(x, y - crossSize);
            this.ctx.lineTo(x, y + crossSize);
            this.ctx.stroke();

            // "INCOMING" text effect - flashing
            if (Math.floor(Date.now() / 200) % 2 === 0) {
                this.ctx.fillStyle = '#ff0000';
                this.ctx.font = 'bold 12px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('⚠ STRIKE', x, y - shrinkRadius - 10);
            }

        } else if (type === 'orbital-strike') {
            // EPIC Orbital beam from sky
            if (projectile.delay <= 0) {
                const strikeProgress = Math.min(1, (1.2 - projectile.life) / 0.3);
                const fadeOut = Math.max(0, projectile.life / 0.5);

                // Beam width animation
                const beamWidth = projectile.maxBeamWidth * strikeProgress * fadeOut;

                if (beamWidth > 0) {
                    // Outer glow beam
                    const outerGradient = this.ctx.createLinearGradient(x - beamWidth * 1.5, 0, x + beamWidth * 1.5, 0);
                    outerGradient.addColorStop(0, 'rgba(255, 200, 100, 0)');
                    outerGradient.addColorStop(0.3, `rgba(255, 200, 100, ${fadeOut * 0.3})`);
                    outerGradient.addColorStop(0.5, `rgba(255, 255, 200, ${fadeOut * 0.5})`);
                    outerGradient.addColorStop(0.7, `rgba(255, 200, 100, ${fadeOut * 0.3})`);
                    outerGradient.addColorStop(1, 'rgba(255, 200, 100, 0)');
                    this.ctx.fillStyle = outerGradient;
                    this.ctx.fillRect(x - beamWidth * 1.5, -100, beamWidth * 3, y + 100);

                    // Main beam
                    const beamGradient = this.ctx.createLinearGradient(x - beamWidth, 0, x + beamWidth, 0);
                    beamGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
                    beamGradient.addColorStop(0.2, `rgba(255, 220, 150, ${fadeOut * 0.8})`);
                    beamGradient.addColorStop(0.5, `rgba(255, 255, 255, ${fadeOut})`);
                    beamGradient.addColorStop(0.8, `rgba(255, 220, 150, ${fadeOut * 0.8})`);
                    beamGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                    this.ctx.fillStyle = beamGradient;
                    this.ctx.fillRect(x - beamWidth, -100, beamWidth * 2, y + 100);

                    // Core beam (white)
                    this.ctx.fillStyle = `rgba(255, 255, 255, ${fadeOut})`;
                    this.ctx.fillRect(x - beamWidth * 0.2, -100, beamWidth * 0.4, y + 100);
                }

                // Ground impact explosion
                const impactRadius = (projectile.radius || 50) * 2 * strikeProgress;
                if (impactRadius > 0 && isFinite(impactRadius)) {
                    const impactGradient = this.ctx.createRadialGradient(x, y, 0, x, y, impactRadius);
                    impactGradient.addColorStop(0, `rgba(255, 255, 255, ${fadeOut})`);
                    impactGradient.addColorStop(0.2, `rgba(255, 255, 200, ${fadeOut * 0.9})`);
                    impactGradient.addColorStop(0.5, `rgba(255, 180, 50, ${fadeOut * 0.6})`);
                    impactGradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
                    this.ctx.fillStyle = impactGradient;
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, impactRadius, 0, Math.PI * 2);
                    this.ctx.fill();
                }

                // Expanding shockwave rings
                const shockTime = (1.2 - projectile.life) / 1.2;
                for (let ring = 0; ring < 3; ring++) {
                    const ringProgress = Math.max(0, shockTime - ring * 0.1);
                    const ringRadius = projectile.radius * 3 * ringProgress;
                    const ringAlpha = (1 - ringProgress) * fadeOut * 0.6;

                    if (ringAlpha > 0 && ringRadius > 0) {
                        this.ctx.strokeStyle = `rgba(255, 200, 100, ${ringAlpha})`;
                        this.ctx.lineWidth = 5 - ring * 1.5;
                        this.ctx.beginPath();
                        this.ctx.arc(x, y, ringRadius, 0, Math.PI * 2);
                        this.ctx.stroke();
                    }
                }

                // Flying debris
                this.ctx.fillStyle = `rgba(255, 200, 100, ${fadeOut})`;
                for (let d = 0; d < 25; d++) {
                    const dAngle = (d / 25) * Math.PI * 2 + strikeProgress * 2;
                    const dDist = strikeProgress * 180 + Math.sin(d * 5) * 30;
                    const dx = x + Math.cos(dAngle) * dDist;
                    const dy = y + Math.sin(dAngle) * dDist * 0.4 - strikeProgress * 80;
                    this.ctx.beginPath();
                    this.ctx.arc(dx, dy, 2 + Math.random() * 3, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }
        } else if (type === 'shockwave') {
            // Expanding electric ring
            const progress = 1 - projectile.life / 0.4;
            const radius = projectile.maxRadius * progress;

            this.ctx.strokeStyle = `rgba(0, 212, 255, ${1 - progress})`;
            this.ctx.lineWidth = 4;
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2);
            this.ctx.stroke();

            // Inner ring
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - progress) * 0.5})`;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius * 0.8, 0, Math.PI * 2);
            this.ctx.stroke();
        } else if (type === 'sniper') {
            // Sniper tracer - long elegant line
            const dx = projectile.vx || 0;
            const dy = projectile.vy || 0;
            const speed = Math.sqrt(dx * dx + dy * dy);

            if (speed > 0) {
                const trailLen = 20;

                // Outer glow
                this.ctx.strokeStyle = `rgba(255, 0, 255, 0.3)`;
                this.ctx.lineWidth = 6;
                this.ctx.lineCap = 'round';
                this.ctx.beginPath();
                this.ctx.moveTo(x - (dx / speed) * trailLen, y - (dy / speed) * trailLen);
                this.ctx.lineTo(x, y);
                this.ctx.stroke();

                // Main tracer
                this.ctx.strokeStyle = projColor;
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(x - (dx / speed) * trailLen, y - (dy / speed) * trailLen);
                this.ctx.lineTo(x, y);
                this.ctx.stroke();
            }

            // Bright tip
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(x, y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        } else if (type === 'pellet') {
            // Shotgun pellet - small fast tracer
            const dx = projectile.vx || 0;
            const dy = projectile.vy || 0;
            const speed = Math.sqrt(dx * dx + dy * dy);

            if (speed > 0) {
                const trailLen = 6;
                this.ctx.strokeStyle = projColor;
                this.ctx.lineWidth = 2;
                this.ctx.lineCap = 'round';
                this.ctx.beginPath();
                this.ctx.moveTo(x - (dx / speed) * trailLen, y - (dy / speed) * trailLen);
                this.ctx.lineTo(x, y);
                this.ctx.stroke();
            }

            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(x, y, 2, 0, Math.PI * 2);
            this.ctx.fill();
        } else {
            // Default bullet with small trail
            const dx = projectile.vx || 0;
            const dy = projectile.vy || 0;
            const speed = Math.sqrt(dx * dx + dy * dy);

            if (speed > 0) {
                const trailLen = 5;
                this.ctx.strokeStyle = projColor;
                this.ctx.lineWidth = 2;
                this.ctx.lineCap = 'round';
                this.ctx.beginPath();
                this.ctx.moveTo(x - (dx / speed) * trailLen, y - (dy / speed) * trailLen);
                this.ctx.lineTo(x, y);
                this.ctx.stroke();
            }

            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(x, y, 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    drawMegaLightning(x1, y1, x2, y2, width, branches) {
        // Main bolt
        this.ctx.strokeStyle = '#00ffff';
        this.ctx.lineWidth = width;
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);

        const segments = 8;
        const dx = (x2 - x1) / segments;
        const dy = (y2 - y1) / segments;
        const points = [{ x: x1, y: y1 }];

        for (let i = 1; i < segments; i++) {
            const offsetX = (Math.random() - 0.5) * 40;
            const offsetY = (Math.random() - 0.5) * 40;
            const px = x1 + dx * i + offsetX;
            const py = y1 + dy * i + offsetY;
            points.push({ x: px, y: py });
            this.ctx.lineTo(px, py);
        }

        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();

        // Glow
        this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
        this.ctx.lineWidth = width * 3;
        this.ctx.stroke();

        // Core
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = width / 3;
        this.ctx.stroke();

        // Branches
        for (let b = 0; b < branches; b++) {
            const branchPoint = points[Math.floor(Math.random() * (points.length - 1)) + 1];
            if (branchPoint) {
                const branchAngle = Math.random() * Math.PI * 2;
                const branchLen = 20 + Math.random() * 30;
                const bx = branchPoint.x + Math.cos(branchAngle) * branchLen;
                const by = branchPoint.y + Math.sin(branchAngle) * branchLen;

                this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.6)';
                this.ctx.lineWidth = width / 2;
                this.ctx.beginPath();
                this.ctx.moveTo(branchPoint.x, branchPoint.y);
                this.ctx.lineTo(bx, by);
                this.ctx.stroke();
            }
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

    addShockwave(x, y, radius, color = '#00d4ff') {
        // Shockwave is an expanding electric ring
        this.explosions.push({
            x, y,
            radius: 0,
            maxRadius: radius,
            color: color,
            alpha: 1,
            time: 0,
            isShockwave: true
        });
    }

    addMissileExplosion(x, y, radius, color = '#ff6600') {
        // Epic missile explosion with fire, debris and shockwave
        this.explosions.push({
            x, y,
            radius: 0,
            maxRadius: radius,
            color: color,
            alpha: 1,
            time: 0,
            isMissileExplosion: true,
            particles: [],
            debris: []
        });

        // Create fire particles
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 30 + Math.random() * 80;
            const exp = this.explosions[this.explosions.length - 1];
            exp.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 20,
                size: 5 + Math.random() * 10,
                color: Math.random() > 0.5 ? '#ff6600' : '#ffaa00'
            });
        }

        // Create debris
        for (let i = 0; i < 12; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 50 + Math.random() * 100;
            const exp = this.explosions[this.explosions.length - 1];
            exp.debris.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 30,
                size: 2 + Math.random() * 4,
                rotation: Math.random() * Math.PI * 2
            });
        }
    }

    addNuclearExplosion(x, y, radius) {
        // Massive nuclear explosion with mushroom cloud
        this.explosions.push({
            x, y,
            radius: 0,
            maxRadius: radius,
            alpha: 1,
            time: 0,
            isNuclear: true,
            cloudHeight: 0,
            ringRadius: 0,
            flashAlpha: 1
        });
    }

    addOrbitalBeam(x, y, radius) {
        // Orbital strike beam from sky
        this.explosions.push({
            x, y,
            radius: radius,
            maxRadius: radius,
            alpha: 1,
            time: 0,
            isOrbitalBeam: true,
            beamWidth: 5,
            maxBeamWidth: 40,
            impactRadius: 0
        });
    }

    addFlakExplosion(x, y, radius) {
        // Small flak burst explosion
        this.explosions.push({
            x, y,
            radius: 0,
            maxRadius: radius,
            alpha: 1,
            time: 0,
            isFlakExplosion: true
        });
    }

    addMuzzleFlash(x, y, angle, color = '#ffff00', size = 10) {
        this.particles.push({
            x, y,
            vx: Math.cos(angle) * 50,
            vy: Math.sin(angle) * 50,
            size: size,
            color: color,
            life: 0.15,
            isMuzzleFlash: true,
            angle: angle
        });
    }

    addShotgunBlast(x, y, angle, spread = 0.5, color = '#ffcc00') {
        // Shotgun blast with multiple particles
        for (let i = 0; i < 8; i++) {
            const particleAngle = angle + (Math.random() - 0.5) * spread;
            this.particles.push({
                x, y,
                vx: Math.cos(particleAngle) * (80 + Math.random() * 40),
                vy: Math.sin(particleAngle) * (80 + Math.random() * 40),
                size: 4 + Math.random() * 4,
                color: color,
                life: 0.2,
                isShotgunBlast: true
            });
        }
    }

    addCannonFire(x, y, angle, color = '#ff6600') {
        // Artillery cannon smoke ring
        this.particles.push({
            x, y,
            vx: Math.cos(angle) * 30,
            vy: Math.sin(angle) * 30,
            size: 20,
            color: '#888888',
            life: 0.4,
            isCannonSmoke: true,
            angle: angle
        });
        // Fire flash
        this.particles.push({
            x, y,
            vx: Math.cos(angle) * 60,
            vy: Math.sin(angle) * 60,
            size: 15,
            color: color,
            life: 0.15,
            isMuzzleFlash: true,
            angle: angle
        });
    }

    addLaserPulse(x, y, color = '#2ecc71') {
        // Laser charging pulse
        this.particles.push({
            x, y,
            vx: 0,
            vy: 0,
            size: 20,
            color: color,
            life: 0.2,
            isLaserPulse: true
        });
    }

    addElectricSpark(x, y, color = '#00d4ff') {
        // Electric sparks around tesla turret
        for (let i = 0; i < 6; i++) {
            const angle = Math.random() * Math.PI * 2;
            this.particles.push({
                x: x + Math.cos(angle) * 10,
                y: y + Math.sin(angle) * 10,
                vx: Math.cos(angle) * (40 + Math.random() * 30),
                vy: Math.sin(angle) * (40 + Math.random() * 30),
                size: 3 + Math.random() * 3,
                color: color,
                life: 0.25,
                isElectricSpark: true
            });
        }
    }

    addBossDeathEffect(x, y, bossSize = 1.5, color = '#880088') {
        // Epic boss death explosion with screen shake, multiple rings, and particles
        const baseRadius = this.grid.cellSize * bossSize * 2;

        this.explosions.push({
            x, y,
            radius: 0,
            maxRadius: baseRadius,
            color: color,
            alpha: 1,
            time: 0,
            isBossDeath: true,
            bossSize: bossSize,
            rings: [],
            particles: [],
            lightningBolts: [],
            flashAlpha: 1,
            shakeIntensity: 15 * bossSize
        });

        const exp = this.explosions[this.explosions.length - 1];

        // Create expanding rings
        for (let r = 0; r < 5; r++) {
            exp.rings.push({
                delay: r * 0.1,
                radius: 0,
                maxRadius: baseRadius * (1 + r * 0.3),
                color: r % 2 === 0 ? color : '#ffffff',
                alpha: 1
            });
        }

        // Create explosion particles
        const particleCount = Math.floor(40 * bossSize);
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 100 + Math.random() * 200 * bossSize;
            exp.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 50,
                size: 5 + Math.random() * 10 * bossSize,
                color: Math.random() > 0.5 ? color : '#ffaa00',
                alpha: 1
            });
        }

        // Create lightning bolts
        for (let l = 0; l < 8; l++) {
            const angle = (l / 8) * Math.PI * 2;
            exp.lightningBolts.push({
                angle: angle,
                length: baseRadius * 1.5,
                segments: [],
                alpha: 1
            });
            // Generate lightning segments
            let lx = x, ly = y;
            const bolt = exp.lightningBolts[l];
            for (let s = 0; s < 10; s++) {
                const segLen = bolt.length / 10;
                const nx = lx + Math.cos(bolt.angle + (Math.random() - 0.5) * 0.5) * segLen;
                const ny = ly + Math.sin(bolt.angle + (Math.random() - 0.5) * 0.5) * segLen;
                bolt.segments.push({ x1: lx, y1: ly, x2: nx, y2: ny });
                lx = nx;
                ly = ny;
            }
        }
    }

    drawExplosions(deltaTime) {
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            const exp = this.explosions[i];
            exp.time += deltaTime;

            if (exp.isShockwave) {
                // Shockwave: electric ring expanding outward
                const duration = 0.4;
                exp.alpha = 1 - exp.time / duration;
                exp.radius = exp.maxRadius * (exp.time / duration);

                if (exp.alpha <= 0) {
                    this.explosions.splice(i, 1);
                    continue;
                }

                // Multiple rings for electric effect
                for (let r = 0; r < 3; r++) {
                    const ringRadius = exp.radius - r * 5;
                    if (ringRadius <= 0) continue;

                    this.ctx.strokeStyle = exp.color;
                    this.ctx.lineWidth = 3 - r;
                    this.ctx.globalAlpha = exp.alpha * (1 - r * 0.3);
                    this.ctx.beginPath();
                    this.ctx.arc(exp.x, exp.y, ringRadius, 0, Math.PI * 2);
                    this.ctx.stroke();
                }

                // Electric sparks
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = 1;
                this.ctx.globalAlpha = exp.alpha;
                for (let s = 0; s < 8; s++) {
                    const angle = (s / 8) * Math.PI * 2 + exp.time * 5;
                    const sparkX = exp.x + Math.cos(angle) * exp.radius;
                    const sparkY = exp.y + Math.sin(angle) * exp.radius;
                    const sparkLen = 8;

                    this.ctx.beginPath();
                    this.ctx.moveTo(sparkX, sparkY);
                    this.ctx.lineTo(
                        sparkX + Math.cos(angle) * sparkLen,
                        sparkY + Math.sin(angle) * sparkLen
                    );
                    this.ctx.stroke();
                }
            } else if (exp.isMissileExplosion) {
                // Epic missile explosion
                const duration = 0.8;
                exp.alpha = 1 - exp.time / duration;

                if (exp.alpha <= 0) {
                    this.explosions.splice(i, 1);
                    continue;
                }

                // Expanding fire ring
                exp.radius = (exp.maxRadius || 50) * Math.min(1, exp.time / 0.2);
                if (exp.radius > 0 && isFinite(exp.radius)) {
                    const gradient = this.ctx.createRadialGradient(exp.x, exp.y, 0, exp.x, exp.y, exp.radius);
                    gradient.addColorStop(0, `rgba(255, 255, 200, ${exp.alpha})`);
                    gradient.addColorStop(0.3, `rgba(255, 150, 0, ${exp.alpha * 0.8})`);
                    gradient.addColorStop(0.6, `rgba(255, 80, 0, ${exp.alpha * 0.5})`);
                    gradient.addColorStop(1, `rgba(100, 20, 0, 0)`);
                    this.ctx.fillStyle = gradient;
                    this.ctx.beginPath();
                    this.ctx.arc(exp.x, exp.y, exp.radius, 0, Math.PI * 2);
                    this.ctx.fill();
                }

                // Shockwave ring
                const shockRadius = exp.maxRadius * 1.5 * (exp.time / 0.4);
                if (shockRadius < exp.maxRadius * 2) {
                    this.ctx.strokeStyle = `rgba(255, 200, 100, ${exp.alpha * 0.6})`;
                    this.ctx.lineWidth = 4;
                    this.ctx.beginPath();
                    this.ctx.arc(exp.x, exp.y, shockRadius, 0, Math.PI * 2);
                    this.ctx.stroke();
                }

                // Fire particles
                for (const p of exp.particles) {
                    p.x += p.vx * deltaTime;
                    p.y += p.vy * deltaTime;
                    p.vy += 50 * deltaTime; // gravity
                    p.size *= 0.97;

                    if (p.size > 1) {
                        this.ctx.fillStyle = p.color;
                        this.ctx.globalAlpha = exp.alpha;
                        this.ctx.beginPath();
                        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                        this.ctx.fill();
                    }
                }

                // Debris
                this.ctx.fillStyle = '#333';
                for (const d of exp.debris) {
                    d.x += d.vx * deltaTime;
                    d.y += d.vy * deltaTime;
                    d.vy += 150 * deltaTime; // gravity
                    d.rotation += 10 * deltaTime;

                    this.ctx.globalAlpha = exp.alpha;
                    this.ctx.save();
                    this.ctx.translate(d.x, d.y);
                    this.ctx.rotate(d.rotation);
                    this.ctx.fillRect(-d.size / 2, -d.size / 2, d.size, d.size);
                    this.ctx.restore();
                }

            } else if (exp.isNuclear) {
                // NUCLEAR EXPLOSION - Epic mushroom cloud
                const duration = 2.5;
                exp.alpha = 1 - exp.time / duration;

                if (exp.alpha <= 0) {
                    this.explosions.splice(i, 1);
                    continue;
                }

                // Initial flash (first 0.1s)
                if (exp.time < 0.15) {
                    exp.flashAlpha = 1 - exp.time / 0.15;
                    this.ctx.fillStyle = `rgba(255, 255, 255, ${exp.flashAlpha * 0.8})`;
                    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                }

                // Ground explosion radius
                exp.radius = exp.maxRadius * Math.min(1.5, exp.time / 0.3);

                // Ground fire
                const groundGradient = this.ctx.createRadialGradient(exp.x, exp.y, 0, exp.x, exp.y, exp.radius);
                groundGradient.addColorStop(0, `rgba(255, 255, 200, ${exp.alpha})`);
                groundGradient.addColorStop(0.2, `rgba(255, 200, 50, ${exp.alpha * 0.9})`);
                groundGradient.addColorStop(0.5, `rgba(255, 100, 0, ${exp.alpha * 0.7})`);
                groundGradient.addColorStop(0.8, `rgba(200, 50, 0, ${exp.alpha * 0.4})`);
                groundGradient.addColorStop(1, `rgba(50, 0, 0, 0)`);
                this.ctx.fillStyle = groundGradient;
                this.ctx.beginPath();
                this.ctx.arc(exp.x, exp.y, exp.radius, 0, Math.PI * 2);
                this.ctx.fill();

                // Mushroom cloud stem
                exp.cloudHeight = Math.min(150, exp.time * 200);
                const stemWidth = 20 + exp.time * 15;
                const stemGradient = this.ctx.createLinearGradient(exp.x - stemWidth, exp.y, exp.x + stemWidth, exp.y);
                stemGradient.addColorStop(0, `rgba(80, 40, 0, ${exp.alpha * 0.8})`);
                stemGradient.addColorStop(0.5, `rgba(150, 80, 20, ${exp.alpha * 0.9})`);
                stemGradient.addColorStop(1, `rgba(80, 40, 0, ${exp.alpha * 0.8})`);
                this.ctx.fillStyle = stemGradient;
                this.ctx.beginPath();
                this.ctx.moveTo(exp.x - stemWidth * 0.5, exp.y);
                this.ctx.lineTo(exp.x + stemWidth * 0.5, exp.y);
                this.ctx.lineTo(exp.x + stemWidth, exp.y - exp.cloudHeight);
                this.ctx.lineTo(exp.x - stemWidth, exp.y - exp.cloudHeight);
                this.ctx.closePath();
                this.ctx.fill();

                // Mushroom cap
                const capRadius = 30 + exp.time * 40;
                const capY = exp.y - exp.cloudHeight - capRadius * 0.3;
                const capGradient = this.ctx.createRadialGradient(exp.x, capY, 0, exp.x, capY, capRadius);
                capGradient.addColorStop(0, `rgba(255, 200, 100, ${exp.alpha})`);
                capGradient.addColorStop(0.3, `rgba(255, 120, 50, ${exp.alpha * 0.9})`);
                capGradient.addColorStop(0.6, `rgba(180, 60, 20, ${exp.alpha * 0.8})`);
                capGradient.addColorStop(1, `rgba(80, 30, 10, ${exp.alpha * 0.5})`);
                this.ctx.fillStyle = capGradient;
                this.ctx.beginPath();
                this.ctx.ellipse(exp.x, capY, capRadius, capRadius * 0.6, 0, 0, Math.PI * 2);
                this.ctx.fill();

                // Rolling fire ring on ground
                exp.ringRadius = exp.maxRadius * 2 * (exp.time / 0.8);
                if (exp.ringRadius < exp.maxRadius * 3) {
                    this.ctx.strokeStyle = `rgba(255, 150, 50, ${exp.alpha * 0.7})`;
                    this.ctx.lineWidth = 8;
                    this.ctx.beginPath();
                    this.ctx.arc(exp.x, exp.y, exp.ringRadius, 0, Math.PI * 2);
                    this.ctx.stroke();

                    // Secondary ring
                    this.ctx.strokeStyle = `rgba(255, 100, 0, ${exp.alpha * 0.4})`;
                    this.ctx.lineWidth = 15;
                    this.ctx.beginPath();
                    this.ctx.arc(exp.x, exp.y, exp.ringRadius * 0.8, 0, Math.PI * 2);
                    this.ctx.stroke();
                }

                // Radiation particles
                this.ctx.fillStyle = `rgba(255, 255, 0, ${exp.alpha * 0.6})`;
                for (let p = 0; p < 15; p++) {
                    const pAngle = (p / 15) * Math.PI * 2 + exp.time * 2;
                    const pDist = exp.radius * 0.5 + Math.sin(exp.time * 10 + p) * 20;
                    const px = exp.x + Math.cos(pAngle) * pDist;
                    const py = exp.y + Math.sin(pAngle) * pDist;
                    this.ctx.beginPath();
                    this.ctx.arc(px, py, 3 + Math.random() * 3, 0, Math.PI * 2);
                    this.ctx.fill();
                }

            } else if (exp.isFlakExplosion) {
                // FLAK burst - cyan/orange anti-air explosion
                const duration = 0.35;
                exp.alpha = 1 - exp.time / duration;
                exp.radius = exp.maxRadius * Math.min(1, exp.time / 0.08);

                if (exp.alpha <= 0) {
                    this.explosions.splice(i, 1);
                    continue;
                }

                // Main flash burst
                const flashGradient = this.ctx.createRadialGradient(exp.x, exp.y, 0, exp.x, exp.y, exp.radius);
                flashGradient.addColorStop(0, `rgba(255, 255, 255, ${exp.alpha})`);
                flashGradient.addColorStop(0.2, `rgba(255, 200, 100, ${exp.alpha * 0.9})`);
                flashGradient.addColorStop(0.5, `rgba(0, 221, 255, ${exp.alpha * 0.7})`);
                flashGradient.addColorStop(0.8, `rgba(255, 100, 0, ${exp.alpha * 0.4})`);
                flashGradient.addColorStop(1, `rgba(0, 100, 200, 0)`);
                this.ctx.fillStyle = flashGradient;
                this.ctx.beginPath();
                this.ctx.arc(exp.x, exp.y, exp.radius, 0, Math.PI * 2);
                this.ctx.fill();

                // Shockwave ring
                this.ctx.strokeStyle = `rgba(0, 200, 255, ${exp.alpha * 0.8})`;
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.arc(exp.x, exp.y, exp.radius * 1.3, 0, Math.PI * 2);
                this.ctx.stroke();

                // Multiple sparks flying outward
                const sparkCount = 8;
                for (let s = 0; s < sparkCount; s++) {
                    const sparkAngle = (s / sparkCount) * Math.PI * 2 + exp.time * 5;
                    const sparkDist = exp.radius * (0.5 + exp.time * 3);
                    const sx = exp.x + Math.cos(sparkAngle) * sparkDist;
                    const sy = exp.y + Math.sin(sparkAngle) * sparkDist;

                    // Spark trail
                    this.ctx.strokeStyle = `rgba(255, 200, 100, ${exp.alpha * 0.8})`;
                    this.ctx.lineWidth = 2;
                    this.ctx.beginPath();
                    this.ctx.moveTo(exp.x + Math.cos(sparkAngle) * exp.radius * 0.3, exp.y + Math.sin(sparkAngle) * exp.radius * 0.3);
                    this.ctx.lineTo(sx, sy);
                    this.ctx.stroke();

                    // Spark head
                    this.ctx.fillStyle = `rgba(255, 255, 255, ${exp.alpha})`;
                    this.ctx.beginPath();
                    this.ctx.arc(sx, sy, 3, 0, Math.PI * 2);
                    this.ctx.fill();
                }

                // Small debris particles
                this.ctx.fillStyle = `rgba(100, 100, 100, ${exp.alpha * 0.6})`;
                for (let d = 0; d < 6; d++) {
                    const debrisAngle = Math.random() * Math.PI * 2;
                    const debrisDist = exp.radius * (0.3 + Math.random() * 0.7);
                    const dx = exp.x + Math.cos(debrisAngle) * debrisDist;
                    const dy = exp.y + Math.sin(debrisAngle) * debrisDist + exp.time * 50;
                    this.ctx.beginPath();
                    this.ctx.arc(dx, dy, 2 + Math.random() * 2, 0, Math.PI * 2);
                    this.ctx.fill();
                }

            } else if (exp.isOrbitalBeam) {
                // ORBITAL BEAM - Massive beam from sky
                const duration = 1.2;
                exp.alpha = 1 - exp.time / duration;

                if (exp.alpha <= 0) {
                    this.explosions.splice(i, 1);
                    continue;
                }

                // Beam width animation
                if (exp.time < 0.2) {
                    exp.beamWidth = exp.maxBeamWidth * (exp.time / 0.2);
                } else if (exp.time > duration - 0.3) {
                    exp.beamWidth = exp.maxBeamWidth * ((duration - exp.time) / 0.3);
                } else {
                    exp.beamWidth = exp.maxBeamWidth;
                }

                // Main beam from sky
                const beamGradient = this.ctx.createLinearGradient(exp.x - exp.beamWidth, 0, exp.x + exp.beamWidth, 0);
                beamGradient.addColorStop(0, `rgba(255, 255, 255, 0)`);
                beamGradient.addColorStop(0.3, `rgba(255, 220, 150, ${exp.alpha * 0.8})`);
                beamGradient.addColorStop(0.5, `rgba(255, 255, 255, ${exp.alpha})`);
                beamGradient.addColorStop(0.7, `rgba(255, 220, 150, ${exp.alpha * 0.8})`);
                beamGradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
                this.ctx.fillStyle = beamGradient;
                this.ctx.fillRect(exp.x - exp.beamWidth, -50, exp.beamWidth * 2, exp.y + 50);

                // Beam core
                this.ctx.fillStyle = `rgba(255, 255, 255, ${exp.alpha})`;
                this.ctx.fillRect(exp.x - exp.beamWidth * 0.2, -50, exp.beamWidth * 0.4, exp.y + 50);

                // Impact explosion at ground
                exp.impactRadius = exp.maxRadius * Math.min(2, exp.time / 0.3);
                const impactGradient = this.ctx.createRadialGradient(exp.x, exp.y, 0, exp.x, exp.y, exp.impactRadius);
                impactGradient.addColorStop(0, `rgba(255, 255, 255, ${exp.alpha})`);
                impactGradient.addColorStop(0.3, `rgba(255, 220, 100, ${exp.alpha * 0.9})`);
                impactGradient.addColorStop(0.6, `rgba(255, 150, 50, ${exp.alpha * 0.6})`);
                impactGradient.addColorStop(1, `rgba(255, 100, 0, 0)`);
                this.ctx.fillStyle = impactGradient;
                this.ctx.beginPath();
                this.ctx.arc(exp.x, exp.y, exp.impactRadius, 0, Math.PI * 2);
                this.ctx.fill();

                // Expanding shockwave ring
                const shockRadius = exp.maxRadius * 3 * (exp.time / 0.6);
                if (shockRadius < exp.maxRadius * 4) {
                    this.ctx.strokeStyle = `rgba(255, 200, 100, ${exp.alpha * 0.5})`;
                    this.ctx.lineWidth = 6;
                    this.ctx.beginPath();
                    this.ctx.arc(exp.x, exp.y, shockRadius, 0, Math.PI * 2);
                    this.ctx.stroke();
                }

                // Debris flying outward
                this.ctx.fillStyle = `rgba(255, 200, 100, ${exp.alpha})`;
                for (let d = 0; d < 20; d++) {
                    const dAngle = (d / 20) * Math.PI * 2;
                    const dDist = exp.time * 150 + Math.sin(d * 3) * 20;
                    const dx = exp.x + Math.cos(dAngle) * dDist;
                    const dy = exp.y + Math.sin(dAngle) * dDist * 0.5 - exp.time * 50;
                    if (dy < exp.y + 50) {
                        this.ctx.beginPath();
                        this.ctx.arc(dx, dy, 3, 0, Math.PI * 2);
                        this.ctx.fill();
                    }
                }

            } else if (exp.isBossDeath) {
                // EPIC Boss death explosion
                const duration = 2.0;
                exp.alpha = 1 - exp.time / duration;

                if (exp.alpha <= 0) {
                    this.explosions.splice(i, 1);
                    continue;
                }

                // Screen shake effect (store for camera)
                if (exp.time < 0.5 && exp.shakeIntensity > 0) {
                    this.screenShake = {
                        x: (Math.random() - 0.5) * exp.shakeIntensity * (1 - exp.time * 2),
                        y: (Math.random() - 0.5) * exp.shakeIntensity * (1 - exp.time * 2)
                    };
                }

                // Initial flash
                if (exp.flashAlpha > 0) {
                    this.ctx.fillStyle = `rgba(255, 255, 255, ${exp.flashAlpha * 0.8})`;
                    this.ctx.fillRect(
                        exp.x - this.grid.cellSize * 10,
                        exp.y - this.grid.cellSize * 10,
                        this.grid.cellSize * 20,
                        this.grid.cellSize * 20
                    );
                    exp.flashAlpha -= deltaTime * 3;
                }

                // Draw expanding rings
                for (const ring of exp.rings) {
                    if (exp.time >= ring.delay) {
                        const ringTime = exp.time - ring.delay;
                        ring.radius = ring.maxRadius * Math.min(1, ringTime / 0.4);
                        ring.alpha = 1 - ringTime / 0.8;

                        if (ring.alpha > 0 && ring.radius > 0) {
                            this.ctx.strokeStyle = ring.color;
                            this.ctx.lineWidth = 5 * ring.alpha;
                            this.ctx.globalAlpha = ring.alpha;
                            this.ctx.beginPath();
                            this.ctx.arc(exp.x, exp.y, ring.radius, 0, Math.PI * 2);
                            this.ctx.stroke();

                            // Inner glow
                            const gradient = this.ctx.createRadialGradient(
                                exp.x, exp.y, ring.radius * 0.5,
                                exp.x, exp.y, ring.radius
                            );
                            gradient.addColorStop(0, `rgba(255, 255, 255, ${ring.alpha * 0.3})`);
                            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                            this.ctx.fillStyle = gradient;
                            this.ctx.beginPath();
                            this.ctx.arc(exp.x, exp.y, ring.radius, 0, Math.PI * 2);
                            this.ctx.fill();
                        }
                    }
                }

                // Draw lightning bolts
                for (const bolt of exp.lightningBolts) {
                    bolt.alpha = Math.max(0, 1 - exp.time / 0.6);
                    if (bolt.alpha > 0) {
                        this.ctx.strokeStyle = '#ffffff';
                        this.ctx.lineWidth = 3;
                        this.ctx.globalAlpha = bolt.alpha;
                        this.ctx.shadowColor = exp.color;
                        this.ctx.shadowBlur = 10;

                        for (const seg of bolt.segments) {
                            this.ctx.beginPath();
                            this.ctx.moveTo(seg.x1, seg.y1);
                            this.ctx.lineTo(seg.x2, seg.y2);
                            this.ctx.stroke();
                        }
                        this.ctx.shadowBlur = 0;
                    }
                }

                // Draw particles
                for (const p of exp.particles) {
                    p.x += p.vx * deltaTime;
                    p.y += p.vy * deltaTime;
                    p.vy += 200 * deltaTime; // Gravity
                    p.alpha = Math.max(0, 1 - exp.time / duration);
                    p.size *= 0.98;

                    if (p.alpha > 0 && p.size > 1) {
                        this.ctx.fillStyle = p.color;
                        this.ctx.globalAlpha = p.alpha;

                        // Draw with glow
                        this.ctx.shadowColor = p.color;
                        this.ctx.shadowBlur = 8;
                        this.ctx.beginPath();
                        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                        this.ctx.fill();
                        this.ctx.shadowBlur = 0;
                    }
                }

                // Central explosion core
                const coreRadius = exp.maxRadius * Math.min(1, exp.time / 0.3) * (1 - exp.time / duration * 0.5);
                if (coreRadius > 0) {
                    const coreGradient = this.ctx.createRadialGradient(
                        exp.x, exp.y, 0,
                        exp.x, exp.y, coreRadius
                    );
                    coreGradient.addColorStop(0, `rgba(255, 255, 200, ${exp.alpha})`);
                    coreGradient.addColorStop(0.3, `rgba(255, 150, 0, ${exp.alpha * 0.8})`);
                    // Parse hex color to rgba
                    let r = 136, g = 0, b = 136; // Default purple
                    if (exp.color.startsWith('#')) {
                        r = parseInt(exp.color.slice(1, 3), 16);
                        g = parseInt(exp.color.slice(3, 5), 16);
                        b = parseInt(exp.color.slice(5, 7), 16);
                    }
                    coreGradient.addColorStop(0.6, `rgba(${r}, ${g}, ${b}, ${exp.alpha * 0.5})`);
                    coreGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                    this.ctx.fillStyle = coreGradient;
                    this.ctx.globalAlpha = exp.alpha;
                    this.ctx.beginPath();
                    this.ctx.arc(exp.x, exp.y, coreRadius, 0, Math.PI * 2);
                    this.ctx.fill();
                }

                // Skull icon for mega bosses (size >= 2)
                if (exp.bossSize >= 2 && exp.time > 0.3 && exp.time < 1.2) {
                    const skullAlpha = Math.min(1, (exp.time - 0.3) / 0.3) * (1 - (exp.time - 0.3) / 0.9);
                    if (skullAlpha > 0) {
                        this.ctx.globalAlpha = skullAlpha;
                        this.ctx.font = `${40 * exp.bossSize}px Arial`;
                        this.ctx.fillStyle = '#ffffff';
                        this.ctx.textAlign = 'center';
                        this.ctx.textBaseline = 'middle';
                        this.ctx.shadowColor = exp.color;
                        this.ctx.shadowBlur = 20;
                        this.ctx.fillText('💀', exp.x, exp.y);
                        this.ctx.shadowBlur = 0;
                    }
                }

            } else {
                // Normal explosion
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
            }

            this.ctx.globalAlpha = 1;
        }
    }

    addDeathEffect(x, y, color = '#ff4444') {
        // Create particles for death
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const speed = 50 + Math.random() * 50;
            this.deathEffects.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: color,
                alpha: 1,
                size: 4 + Math.random() * 4,
                time: 0
            });
        }
    }

    drawDeathEffects(deltaTime) {
        for (let i = this.deathEffects.length - 1; i >= 0; i--) {
            const p = this.deathEffects[i];
            p.time += deltaTime;
            p.x += p.vx * deltaTime;
            p.y += p.vy * deltaTime;
            p.alpha = 1 - p.time / 0.5;
            p.size *= 0.95;

            if (p.alpha <= 0 || p.size < 1) {
                this.deathEffects.splice(i, 1);
                continue;
            }

            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.alpha;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.globalAlpha = 1;
    }

    drawParticles(deltaTime) {
        // Update and draw muzzle flash particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= deltaTime;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            // Update position
            p.x += p.vx * deltaTime;
            p.y += p.vy * deltaTime;

            const alpha = Math.min(1, p.life * 4); // Quick fade

            if (p.isMuzzleFlash) {
                // Muzzle flash - bright expanding star
                this.ctx.save();
                this.ctx.translate(p.x, p.y);
                this.ctx.rotate(p.angle);

                // Glow
                this.ctx.fillStyle = p.color;
                this.ctx.globalAlpha = alpha * 0.6;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, p.size * 1.5, 0, Math.PI * 2);
                this.ctx.fill();

                // Core flash
                this.ctx.fillStyle = '#ffffff';
                this.ctx.globalAlpha = alpha;
                this.ctx.beginPath();
                this.ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
                this.ctx.fill();

                this.ctx.restore();
            } else if (p.isShotgunBlast) {
                // Shotgun sparks
                this.ctx.fillStyle = p.color;
                this.ctx.globalAlpha = alpha;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
                this.ctx.fill();
            } else if (p.isCannonSmoke) {
                // Artillery smoke ring
                this.ctx.fillStyle = p.color;
                this.ctx.globalAlpha = alpha * 0.4;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size * (1.5 - alpha), 0, Math.PI * 2);
                this.ctx.fill();
            } else if (p.isLaserPulse) {
                // Laser charge pulse
                const pulseSize = p.size * (1 - p.life * 3);
                this.ctx.strokeStyle = p.color;
                this.ctx.lineWidth = 2;
                this.ctx.globalAlpha = alpha;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, pulseSize, 0, Math.PI * 2);
                this.ctx.stroke();

                // Center glow
                this.ctx.fillStyle = '#ffffff';
                this.ctx.globalAlpha = alpha * 0.8;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
                this.ctx.fill();
            } else if (p.isElectricSpark) {
                // Electric sparks
                this.ctx.fillStyle = p.color;
                this.ctx.globalAlpha = alpha;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
                this.ctx.fill();

                // Add glow
                this.ctx.fillStyle = '#ffffff';
                this.ctx.globalAlpha = alpha * 0.6;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size * alpha * 0.5, 0, Math.PI * 2);
                this.ctx.fill();
            } else {
                // Generic particle
                this.ctx.fillStyle = p.color;
                this.ctx.globalAlpha = alpha;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
        this.ctx.globalAlpha = 1;
    }

    drawPlacementPreview(gridX, gridY, canPlace, buildingType, gridSize = 1) {
        const cellSize = this.grid.cellSize;

        if (gridSize > 1) {
            // Multi-cell preview (3x3)
            const offset = Math.floor(gridSize / 2);
            this.ctx.globalAlpha = 0.5;

            for (let dy = -offset; dy <= offset; dy++) {
                for (let dx = -offset; dx <= offset; dx++) {
                    const x = gridX + dx;
                    const y = gridY + dy;
                    const cellCanPlace = this.grid.canPlace(x, y);
                    const worldPos = this.grid.gridToWorld(x, y);
                    const size = cellSize * 0.9;

                    this.ctx.fillStyle = cellCanPlace ? '#44ff44' : '#ff4444';
                    this.ctx.fillRect(
                        worldPos.x - size / 2,
                        worldPos.y - size / 2,
                        size, size
                    );
                }
            }

            // Draw outline around the whole footprint
            const centerWorldPos = this.grid.gridToWorld(gridX, gridY);
            const totalSize = cellSize * gridSize;
            this.ctx.strokeStyle = canPlace ? '#00ff00' : '#ff0000';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(
                centerWorldPos.x - totalSize / 2,
                centerWorldPos.y - totalSize / 2,
                totalSize, totalSize
            );

            this.ctx.globalAlpha = 1;
        } else {
            // Single cell preview
            const worldPos = this.grid.gridToWorld(gridX, gridY);
            const size = cellSize * 0.9;

            this.ctx.globalAlpha = 0.5;
            this.ctx.fillStyle = canPlace ? '#44ff44' : '#ff4444';
            this.ctx.fillRect(
                worldPos.x - size / 2,
                worldPos.y - size / 2,
                size, size
            );
            this.ctx.globalAlpha = 1;
        }
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
