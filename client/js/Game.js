import { Grid } from './Grid.js';
import { Renderer } from './Renderer.js';
import { InputHandler } from './InputHandler.js';
import { UI } from './UI.js';
import { WaveManager } from './WaveManager.js';
import { Nexus } from './entities/Nexus.js';
import { Enemy } from './entities/Enemy.js';
import { Turret } from './entities/Turret.js';
import { Wall } from './entities/Wall.js';
import { Extractor } from './entities/Extractor.js';
import { TURRET_TYPES } from './data/turrets.js';
import { BUILDING_TYPES } from './data/buildings.js';
import { ENEMY_TYPES } from './data/enemies.js';

export class Game {
    constructor(canvas, isMultiplayer = false, network = null, initialState = null, gameMode = 'waves') {
        this.canvas = canvas;
        this.cellSize = 32;
        this.isMultiplayer = isMultiplayer;
        this.network = network;
        this.gameMode = gameMode; // 'waves' or 'endless'

        // Map size (3x larger: 150x114 cells)
        this.mapWidth = 150 * this.cellSize;  // 4800
        this.mapHeight = 114 * this.cellSize; // 3648

        // Viewport/canvas size - responsive to window
        this.updateCanvasSize();

        // Listen for window resize
        window.addEventListener('resize', () => this.handleResize());

        // Camera/viewport position and zoom
        this.camera = {
            x: 0,
            y: 0,
            zoom: 0.5,  // Start zoomed out to see more of the map
            minZoom: 0.2,
            maxZoom: 2,
            isPanning: false,
            lastMouseX: 0,
            lastMouseY: 0
        };

        // Initialize systems with map size (not canvas size)
        this.grid = new Grid(this.mapWidth, this.mapHeight, this.cellSize);
        this.renderer = new Renderer(this.canvas, this.grid, this.camera);
        this.inputHandler = new InputHandler(this.canvas, this.grid, this.camera);

        // Setup zoom and pan controls
        this.setupCameraControls();

        // Game state
        this.resources = {
            iron: 500,
            copper: 0,
            coal: 0,
            gold: 0
        };

        this.turrets = [];
        this.walls = [];
        this.extractors = [];
        this.enemies = [];
        this.projectiles = [];

        this.waveNumber = 0;
        this.totalKills = 0;
        this.totalScore = 0;
        this.gameOver = false;
        this.lastTime = 0;
        this.gameSpeed = 1; // Speed multiplier (1, 2, 5, 10)

        // Action modes
        this.actionMode = null; // null, 'sell', 'upgrade'
        this.selectedTurret = null;
        this.hoveredTurret = null;

        // Apply initial state if multiplayer
        if (initialState) {
            this.resources = initialState.resources;
            this.grid.cells = initialState.grid;
            this.grid.resourceMap = initialState.resourceMap;
        }

        // Create Nexus at center
        const centerX = initialState?.nexusX || Math.floor(this.grid.cols / 2);
        const centerY = initialState?.nexusY || Math.floor(this.grid.rows / 2);
        const nexusWorldPos = this.grid.gridToWorld(centerX, centerY);
        this.nexus = new Nexus(nexusWorldPos.x, nexusWorldPos.y, this.cellSize);
        if (!initialState) {
            this.grid.setNexus(centerX, centerY);
        }

        // Wave manager (only active in solo mode)
        this.waveManager = new WaveManager(this, this.gameMode);

        // UI
        this.ui = new UI(this);

        // Setup input callbacks
        this.inputHandler.onPlace = (x, y, building) => this.handleClick(x, y, building);
        this.inputHandler.onSelect = (x, y) => this.handleClick(x, y, null);

        // Center camera on nexus
        this.centerCameraOnNexus();

        // Start game loop
        this.start();
    }

    setupCameraControls() {
        // Mouse wheel for zoom
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
            const newZoom = Math.max(this.camera.minZoom, Math.min(this.camera.maxZoom, this.camera.zoom * zoomFactor));

            // Zoom towards mouse position
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            // Calculate world position under mouse before zoom
            const worldX = (mouseX / this.camera.zoom) + this.camera.x;
            const worldY = (mouseY / this.camera.zoom) + this.camera.y;

            this.camera.zoom = newZoom;

            // Adjust camera to keep mouse position stable
            this.camera.x = worldX - (mouseX / this.camera.zoom);
            this.camera.y = worldY - (mouseY / this.camera.zoom);

            this.clampCamera();
        });

        // Middle mouse button for panning
        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button === 1) { // Middle mouse button
                e.preventDefault();
                this.camera.isPanning = true;
                this.camera.lastMouseX = e.clientX;
                this.camera.lastMouseY = e.clientY;
                this.canvas.style.cursor = 'grabbing';
            }
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (this.camera.isPanning) {
                const deltaX = e.clientX - this.camera.lastMouseX;
                const deltaY = e.clientY - this.camera.lastMouseY;
                this.camera.x -= deltaX / this.camera.zoom;
                this.camera.y -= deltaY / this.camera.zoom;
                this.camera.lastMouseX = e.clientX;
                this.camera.lastMouseY = e.clientY;
                this.clampCamera();
            }
        });

        this.canvas.addEventListener('mouseup', (e) => {
            if (e.button === 1) {
                this.camera.isPanning = false;
                this.canvas.style.cursor = 'crosshair';
            }
        });

        // Also stop panning if mouse leaves canvas
        this.canvas.addEventListener('mouseleave', () => {
            this.camera.isPanning = false;
            this.canvas.style.cursor = 'crosshair';
        });

        // Prevent context menu on middle click
        this.canvas.addEventListener('auxclick', (e) => {
            if (e.button === 1) e.preventDefault();
        });
    }

    clampCamera() {
        // Clamp camera to map bounds
        const maxX = Math.max(0, this.mapWidth - (this.canvas.width / this.camera.zoom));
        const maxY = Math.max(0, this.mapHeight - (this.canvas.height / this.camera.zoom));
        this.camera.x = Math.max(0, Math.min(maxX, this.camera.x));
        this.camera.y = Math.max(0, Math.min(maxY, this.camera.y));
    }

    centerCameraOnNexus() {
        // Center camera on nexus position
        const nexusWorldX = this.nexus.x;
        const nexusWorldY = this.nexus.y;
        this.camera.x = nexusWorldX - (this.canvas.width / this.camera.zoom / 2);
        this.camera.y = nexusWorldY - (this.canvas.height / this.camera.zoom / 2);
        this.clampCamera();
    }

    updateCanvasSize() {
        // Get actual available space from the canvas element's bounding rect
        const rect = this.canvas.getBoundingClientRect();

        // If rect is valid (element is visible), use it
        if (rect.width > 0 && rect.height > 0) {
            this.canvas.width = Math.floor(rect.width);
            this.canvas.height = Math.floor(rect.height);
        } else {
            // Fallback: window minus UI panel width
            const uiWidth = 260;
            this.canvas.width = window.innerWidth - uiWidth - 4;
            this.canvas.height = window.innerHeight - 4;
        }

        // Schedule another update on next frame if sizes are small (layout not ready yet)
        if (this.canvas.width < 100 || this.canvas.height < 100) {
            requestAnimationFrame(() => this.updateCanvasSize());
        }
    }

    handleResize() {
        this.updateCanvasSize();
        this.clampCamera();
        // Re-center on nexus if view is significantly changed
        if (this.nexus) {
            this.centerCameraOnNexus();
        }
    }

    setGameSpeed(speed) {
        const validSpeeds = [1, 2, 5, 10];
        if (!validSpeeds.includes(speed)) return;

        if (this.isMultiplayer && this.network) {
            // In multiplayer, send to server (only host can change)
            this.network.setGameSpeed(speed);
        } else {
            // In solo, change directly
            this.gameSpeed = speed;
            // Update button states
            document.querySelectorAll('.speed-btn').forEach(btn => {
                btn.classList.toggle('active', parseInt(btn.dataset.speed) === speed);
            });
        }
    }

    setActionMode(mode) {
        if (this.actionMode === mode) {
            this.actionMode = null;
        } else {
            this.actionMode = mode;
            this.inputHandler.setSelectedBuilding(null);
        }
        this.selectedTurret = null;
    }

    handleClick(gridX, gridY, building) {
        // If we have a building selected, try to place it
        if (building) {
            this.placeBuilding(gridX, gridY, building);
            return;
        }

        // Check if clicking on a building (turret, extractor, wall)
        const turret = this.getTurretAt(gridX, gridY);
        const extractor = this.extractors.find(e => e.gridX === gridX && e.gridY === gridY);
        const wall = this.walls.find(w => w.gridX === gridX && w.gridY === gridY);
        const hasBuilding = turret || extractor || wall;

        if (this.actionMode === 'sell' && hasBuilding) {
            this.sellBuilding(gridX, gridY);
            this.selectedTurret = null;
        } else if (this.actionMode === 'upgrade' && (turret || extractor)) {
            this.upgradeBuilding(gridX, gridY);
            this.selectedTurret = turret || null;
        } else if (turret) {
            this.selectedTurret = turret;
        } else {
            this.selectedTurret = null;
        }
    }

    getTurretAt(gridX, gridY) {
        for (const turret of this.turrets) {
            const size = turret.config?.gridSize || 1;
            if (size > 1) {
                // Multi-cell turret - check if click is within footprint
                const offset = Math.floor(size / 2);
                const minX = turret.gridX - offset;
                const maxX = turret.gridX + offset;
                const minY = turret.gridY - offset;
                const maxY = turret.gridY + offset;

                if (gridX >= minX && gridX <= maxX && gridY >= minY && gridY <= maxY) {
                    return turret;
                }
            } else if (turret.gridX === gridX && turret.gridY === gridY) {
                return turret;
            }
        }
        return null;
    }

    getHoveredTurret() {
        const gridPos = this.inputHandler.getMouseGridPosition();
        return this.getTurretAt(gridPos.x, gridPos.y);
    }

    sellBuilding(gridX, gridY) {
        // In multiplayer, send to server
        if (this.isMultiplayer && this.network) {
            this.network.sellBuilding(gridX, gridY);
            return;
        }

        // Solo mode: handle locally
        const turret = this.getTurretAt(gridX, gridY);
        if (turret) {
            this.sellTurret(turret);
            return;
        }

        // Check for extractor
        const extractor = this.extractors.find(e => e.gridX === gridX && e.gridY === gridY);
        if (extractor) {
            // Refund based on level
            const sellValue = extractor.getSellValue ? extractor.getSellValue() : { iron: 37 };
            for (const [resource, amount] of Object.entries(sellValue)) {
                this.resources[resource] = (this.resources[resource] || 0) + amount;
            }
            const index = this.extractors.indexOf(extractor);
            if (index > -1) this.extractors.splice(index, 1);
            this.grid.removeBuilding(gridX, gridY);
            return;
        }

        // Check for wall
        const wall = this.walls.find(w => w.gridX === gridX && w.gridY === gridY);
        if (wall) {
            this.resources.iron = (this.resources.iron || 0) + 15;
            const index = this.walls.indexOf(wall);
            if (index > -1) this.walls.splice(index, 1);
            this.grid.removeBuilding(gridX, gridY);
            this.recalculateEnemyPaths();
        }
    }

    sellTurret(turret) {
        if (!turret.getSellValue) return;
        const sellValue = turret.getSellValue();

        // Add resources
        for (const [resource, amount] of Object.entries(sellValue)) {
            this.resources[resource] = (this.resources[resource] || 0) + amount;
        }

        // Remove turret
        const index = this.turrets.indexOf(turret);
        if (index > -1) {
            this.turrets.splice(index, 1);
        }

        // Free grid cell(s) - handle multi-cell turrets
        const size = turret.config?.gridSize || 1;
        if (size > 1) {
            this.grid.removeMultiBuilding(turret.gridX, turret.gridY, size);
        } else {
            this.grid.removeBuilding(turret.gridX, turret.gridY);
        }

        // Recalculate enemy paths
        this.recalculateEnemyPaths();

        this.selectedTurret = null;
    }

    upgradeBuilding(gridX, gridY) {
        // In multiplayer, send to server
        if (this.isMultiplayer && this.network) {
            this.network.upgradeBuilding(gridX, gridY);
            return;
        }

        // Solo mode: handle locally
        const turret = this.getTurretAt(gridX, gridY);
        if (turret) {
            this.upgradeTurret(turret);
            return;
        }

        // Check for extractor (solo upgrade)
        const extractor = this.extractors.find(e => e.gridX === gridX && e.gridY === gridY);
        if (extractor && extractor.upgrade) {
            const cost = { iron: 30 + (extractor.level || 1) * 10 };
            if (this.canAfford(cost)) {
                this.resources.iron -= cost.iron;
                extractor.upgrade();
            }
            return;
        }

        // Check for wall (solo upgrade)
        const wall = this.walls.find(w => w.gridX === gridX && w.gridY === gridY);
        if (wall && wall.upgrade) {
            const cost = wall.getUpgradeCost();
            if (cost && this.canAfford(cost)) {
                for (const [resource, amount] of Object.entries(cost)) {
                    this.resources[resource] -= amount;
                }
                wall.upgrade();
            }
        }
    }

    upgradeTurret(turret) {
        if (!turret.level || !turret.maxLevel) return;
        if (turret.level >= turret.maxLevel) return;

        if (!turret.getUpgradeCost) return;
        const cost = turret.getUpgradeCost();
        if (!cost || !this.canAfford(cost)) return;

        // Deduct resources
        for (const [resource, amount] of Object.entries(cost)) {
            this.resources[resource] -= amount;
        }

        // Upgrade turret
        if (turret.upgrade) {
            turret.upgrade();
        }

        this.selectedTurret = turret;
    }

    damageStructure(structure, damage) {
        // Server handles damage in multiplayer
        if (this.isMultiplayer) return;
        if (!structure) return;

        // Check if it's a wall
        const wallIndex = this.walls.indexOf(structure);
        if (wallIndex > -1) {
            structure.health -= damage;
            if (structure.health <= 0) {
                this.walls.splice(wallIndex, 1);
                this.grid.removeBuilding(structure.gridX, structure.gridY);
                // Add destruction effect
                if (this.renderer) {
                    this.renderer.addExplosion(structure.x, structure.y, this.cellSize, '#8b4513');
                }
            }
            return;
        }

        // Check if it's a turret (turrets have more health implicitly)
        const turretIndex = this.turrets.indexOf(structure);
        if (turretIndex > -1) {
            if (!structure.health) {
                structure.health = 150; // Default turret health
                structure.maxHealth = 150;
            }
            structure.health -= damage;
            if (structure.health <= 0) {
                this.turrets.splice(turretIndex, 1);
                this.grid.removeBuilding(structure.gridX, structure.gridY);
            }
        }
    }

    getEnemyConfig(type) {
        return ENEMY_TYPES[type];
    }

    start() {
        this.lastTime = performance.now();
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    gameLoop(currentTime) {
        let deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        // Cap deltaTime to prevent huge jumps (max 100ms)
        if (deltaTime > 0.1) {
            deltaTime = 0.1;
        }

        if (!this.gameOver) {
            this.update(deltaTime);
            this.render(deltaTime);
        }

        requestAnimationFrame((time) => this.gameLoop(time));
    }

    update(deltaTime) {
        // ===== SOLO MODE: Full game logic =====
        if (!this.isMultiplayer) {
            // Apply game speed multiplier in solo mode
            const adjustedDelta = deltaTime * this.gameSpeed;

            // Update wave manager
            this.waveManager.update(adjustedDelta);

            // Update extractors
            for (const extractor of this.extractors) {
                if (extractor.update) {
                    extractor.update(adjustedDelta);
                    if (extractor.stored > 0 && extractor.collect) {
                        const collected = extractor.collect();
                        this.resources[collected.type] = (this.resources[collected.type] || 0) + collected.amount;
                    }
                }
            }

            // Update enemies
            for (const enemy of this.enemies) {
                if (enemy.update) {
                    enemy.update(adjustedDelta, this.nexus, this.enemies, this);
                }
            }

            // Remove dead enemies and collect rewards
            const enemiesToSpawn = [];
            // Boss types for death effect
            const bossTypes = ['boss', 'flying-boss', 'carrier-boss', 'mega-boss',
                               'titan', 'leviathan', 'swarm-mother', 'devastator',
                               'overlord', 'colossus', 'hive-queen', 'juggernaut',
                               'apocalypse', 'world-ender'];

            this.enemies = this.enemies.filter(enemy => {
                if (enemy.age === undefined || enemy.age < 1.0) {
                    enemy.dead = false;
                    return true;
                }
                if (enemy.dead) {
                    if (!enemy.reachedNexus) {
                        // Collect reward
                        if (enemy.getReward) {
                            const reward = enemy.getReward();
                            for (const [resource, amount] of Object.entries(reward)) {
                                this.resources[resource] = (this.resources[resource] || 0) + amount;
                            }
                        }

                        // Check if it's a boss - trigger epic death effect
                        if (bossTypes.includes(enemy.type)) {
                            const bossSize = enemy.config?.size || 1.5;
                            const bossColor = enemy.config?.color || '#880088';
                            this.renderer.addBossDeathEffect(enemy.x, enemy.y, bossSize, bossColor);
                        } else {
                            // Normal death effect for regular enemies
                            this.renderer.addDeathEffect(enemy.x, enemy.y, enemy.config?.color || '#ff4444');
                        }

                        // Splitter enemies spawn children on death
                        if (enemy.config?.splitOnDeath) {
                            const count = enemy.config.splitCount || 2;
                            const childType = enemy.config.splitType || 'splitter-child';
                            for (let i = 0; i < count; i++) {
                                enemiesToSpawn.push({
                                    gridX: enemy.gridX,
                                    gridY: enemy.gridY,
                                    type: childType
                                });
                            }
                        }
                    }
                }
                return !enemy.dead;
            });

            // Spawn splitter children
            for (const spawn of enemiesToSpawn) {
                this.spawnEnemy(spawn.gridX, spawn.gridY, spawn.type);
            }

            // Update turrets
            for (const turret of this.turrets) {
                if (turret.update) {
                    turret.update(adjustedDelta, this.enemies, this.projectiles, this);
                }
            }

            // Remove destroyed turrets
            this.turrets = this.turrets.filter(turret => {
                if (turret.isDestroyed && turret.isDestroyed()) {
                    this.grid.removeBuilding(turret.gridX, turret.gridY);
                    this.recalculateEnemyPaths();
                    return false;
                }
                return true;
            });

            // Update projectiles
            this.updateProjectiles(adjustedDelta);

            // Progressive path recalculation (spread work over frames to avoid lag)
            this.progressivePathRecalc(5);

            // Check game over
            if (this.nexus.isDestroyed()) {
                this.gameOver = true;
                this.ui.showGameOver();
            }
        }
        // ===== MULTIPLAYER MODE: Server handles all game logic =====
        // But we still interpolate projectiles locally for smooth rendering
        if (this.isMultiplayer) {
            this.interpolateProjectiles(deltaTime);
        }

        // Update UI (always)
        this.ui.update();
    }

    interpolateProjectiles(deltaTime) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];

            // Decrease life locally for smooth fade out
            if (proj.life !== undefined) {
                proj.life -= deltaTime;
                if (proj.life <= 0) {
                    this.projectiles.splice(i, 1);
                    continue;
                }
            }

            // Move projectile locally based on velocity
            if (proj.vx !== undefined && proj.vy !== undefined) {
                proj.x += proj.vx * deltaTime;
                proj.y += proj.vy * deltaTime;
            }
        }
    }

    updateProjectiles(deltaTime) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];

            // Handle different projectile types
            if (proj.life !== undefined) {
                proj.life -= deltaTime;
                if (proj.life <= 0) {
                    this.projectiles.splice(i, 1);
                    continue;
                }
            }

            // Special handling for orbital strike
            if (proj.type === 'orbital-strike' && proj.delay !== undefined) {
                proj.delay -= deltaTime;
                if (proj.delay <= 0 && !proj.triggered) {
                    proj.triggered = true;
                    // Deal massive AOE damage
                    if (!this.isMultiplayer) {
                        this.dealAOEDamage(proj.x, proj.y, proj.radius * 2, proj.damage);
                    }
                    // The visual is handled in Renderer via the projectile itself
                }
                continue; // Don't move orbital strike projectiles
            }

            // Special handling for nuclear that reaches target
            if (proj.type === 'nuclear' && proj.targetX !== undefined) {
                const distToTarget = Math.sqrt((proj.x - proj.targetX) ** 2 + (proj.y - proj.targetY) ** 2);
                if (distToTarget < 20) {
                    // Explode at target
                    this.renderer.addNuclearExplosion(proj.x, proj.y, proj.aoeRadius);
                    if (!this.isMultiplayer) {
                        this.dealAOEDamage(proj.x, proj.y, proj.aoeRadius, proj.damage);
                    }
                    this.projectiles.splice(i, 1);
                    continue;
                }
            }

            // Special handling for flak that reaches target area
            if (proj.type === 'flak' && proj.targetX !== undefined) {
                const distToTarget = Math.sqrt((proj.x - proj.targetX) ** 2 + (proj.y - proj.targetY) ** 2);
                if (distToTarget < 15) {
                    // Explode at target position - ALWAYS show visual, damage only in solo
                    if (proj.aoeRadius > 0) {
                        this.renderer.addFlakExplosion(proj.x, proj.y, proj.aoeRadius * 2);
                    }
                    if (!this.isMultiplayer) {
                        this.dealAOEDamage(proj.x, proj.y, proj.aoeRadius, proj.damage);
                    }
                    this.projectiles.splice(i, 1);
                    continue;
                }
            }

            // === HOMING LOGIC FOR GUIDED MISSILES ===
            if (proj.homingStrength && proj.target && !proj.target.dead) {
                const targetX = proj.target.x;
                const targetY = proj.target.y;

                // Calculate desired direction
                const dx = targetX - proj.x;
                const dy = targetY - proj.y;
                const distToTarget = Math.sqrt(dx * dx + dy * dy);

                if (distToTarget > 10) {
                    // Current velocity
                    const currentSpeed = Math.sqrt(proj.vx * proj.vx + proj.vy * proj.vy);
                    const maxSpeed = proj.maxSpeed || currentSpeed;

                    // Desired direction normalized
                    const desiredVx = (dx / distToTarget) * maxSpeed;
                    const desiredVy = (dy / distToTarget) * maxSpeed;

                    // Interpolate towards desired direction
                    const homing = proj.homingStrength;
                    proj.vx += (desiredVx - proj.vx) * homing;
                    proj.vy += (desiredVy - proj.vy) * homing;

                    // Maintain speed
                    const newSpeed = Math.sqrt(proj.vx * proj.vx + proj.vy * proj.vy);
                    if (newSpeed > 0) {
                        // Accelerate over time
                        const speedMult = Math.min(maxSpeed / newSpeed, 1.05);
                        proj.vx *= speedMult;
                        proj.vy *= speedMult;
                    }
                }
            }

            // === PARTICLE TRAIL FOR MISSILES ===
            if ((proj.type === 'missile' || proj.type === 'rocket' || proj.type === 'battery-missile' || proj.type === 'nuclear') && proj.trail) {
                proj.trail.push({
                    x: proj.x + (Math.random() - 0.5) * 6,
                    y: proj.y + (Math.random() - 0.5) * 6,
                    life: 1,
                    size: 4 + Math.random() * 4
                });
                if (proj.trail.length > 20) proj.trail.shift();
            }

            // Move projectile
            if (proj.vx !== undefined) {
                // Handle delay for salvo firing
                if (proj.delay !== undefined && proj.delay > 0) {
                    proj.delay -= deltaTime;
                    continue;
                }

                proj.x += proj.vx * deltaTime;
                proj.y += proj.vy * deltaTime;

                // Check bounds (use map size, not canvas)
                if (proj.x < -100 || proj.x > this.mapWidth + 100 ||
                    proj.y < -100 || proj.y > this.mapHeight + 100) {
                    this.projectiles.splice(i, 1);
                    continue;
                }

                // Check enemy collisions
                for (const enemy of this.enemies) {
                    if (enemy.dead) continue;
                    if (proj.hitEnemies && proj.hitEnemies.includes(enemy)) continue;

                    const dist = Math.sqrt((proj.x - enemy.x) ** 2 + (proj.y - enemy.y) ** 2);
                    const enemySize = enemy.config?.size || 1;
                    const hitRadius = this.cellSize * enemySize / 2;

                    if (dist < hitRadius) {
                        // Hit!
                        if (proj.aoeRadius > 0) {
                            // Choose explosion type based on projectile
                            if (proj.type === 'nuclear') {
                                // EPIC Nuclear explosion
                                this.renderer.addNuclearExplosion(proj.x, proj.y, proj.aoeRadius);
                            } else if (proj.type === 'missile' || proj.type === 'rocket' || proj.type === 'battery-missile') {
                                // Epic missile explosion
                                this.renderer.addMissileExplosion(proj.x, proj.y, proj.aoeRadius);
                            } else if (proj.type === 'plasma') {
                                // Plasma explosion with purple color
                                this.renderer.addMissileExplosion(proj.x, proj.y, proj.aoeRadius, '#9400d3');
                            } else {
                                // Standard AOE explosion
                                this.renderer.addExplosion(proj.x, proj.y, proj.aoeRadius);
                            }
                            // Only deal damage in solo mode
                            if (!this.isMultiplayer) {
                                this.dealAOEDamage(proj.x, proj.y, proj.aoeRadius, proj.damage);
                            }
                            this.projectiles.splice(i, 1);
                        } else {
                            // Only deal damage in solo mode (server handles in multiplayer)
                            if (!this.isMultiplayer) {
                                if (enemy.takeDamage) {
                                    enemy.takeDamage(proj.damage);
                                }
                                // Apply DOT for flamethrower
                                if (proj.dotDamage && enemy.applyBurn) {
                                    enemy.applyBurn(proj.dotDamage, proj.dotDuration);
                                }
                            }

                            if (proj.penetration) {
                                proj.hitEnemies = proj.hitEnemies || [];
                                proj.hitEnemies.push(enemy);
                            } else {
                                this.projectiles.splice(i, 1);
                            }
                        }
                        break;
                    }
                }
            }
        }
    }

    dealAOEDamage(x, y, radius, damage) {
        // Skip in multiplayer - server handles damage
        if (this.isMultiplayer) return;

        for (const enemy of this.enemies) {
            if (enemy.dead) continue;

            const dist = Math.sqrt((x - enemy.x) ** 2 + (y - enemy.y) ** 2);
            if (dist <= radius) {
                // Damage falls off with distance
                const falloff = 1 - (dist / radius) * 0.5;
                if (enemy.takeDamage) {
                    enemy.takeDamage(damage * falloff);
                }
            }
        }
    }

    render(deltaTime) {
        this.renderer.clear();
        this.renderer.resetParticleCounter(); // Reset for frame-based rendering limit
        this.renderer.applyCamera();
        this.renderer.drawGrid();
        this.renderer.drawResources();

        // Draw placement preview
        const selectedBuilding = this.inputHandler.getSelectedBuilding();
        if (selectedBuilding) {
            const gridPos = this.inputHandler.getMouseGridPosition();
            const canPlace = this.canPlaceBuilding(gridPos.x, gridPos.y, selectedBuilding);

            // Get gridSize for multi-cell turrets
            let gridSize = 1;
            if (selectedBuilding.startsWith('turret-')) {
                const config = TURRET_TYPES[selectedBuilding];
                gridSize = config?.gridSize || 1;
            }

            this.renderer.drawPlacementPreview(gridPos.x, gridPos.y, canPlace, selectedBuilding, gridSize);

            // Show range for turrets
            if (selectedBuilding.startsWith('turret-')) {
                const config = TURRET_TYPES[selectedBuilding];
                if (config) {
                    const worldPos = this.grid.gridToWorld(gridPos.x, gridPos.y);
                    this.renderer.drawRangeIndicator(worldPos.x, worldPos.y, config.range);
                }
            }
        }

        // Draw walls
        for (const wall of this.walls) {
            this.renderer.drawWall(wall);
        }

        // Draw extractors
        for (const extractor of this.extractors) {
            this.renderer.drawExtractor(extractor);
        }

        // Draw turret zones FIRST (so they appear below turret bases)
        for (const turret of this.turrets) {
            this.renderer.drawTurretZone(turret);
        }

        // Draw turrets
        const hoveredTurret = this.getHoveredTurret();
        for (const turret of this.turrets) {
            const isSelected = turret === this.selectedTurret || turret === hoveredTurret;
            this.renderer.drawTurret(turret, isSelected, this.actionMode);

            // Draw range when hovering or selected (check config exists)
            if ((turret === hoveredTurret || turret === this.selectedTurret) && turret.config?.range) {
                this.renderer.drawRangeIndicator(turret.x, turret.y, turret.config.range);
            }

            // Draw healer beams
            if (turret.config?.isHealer && turret.healTargets) {
                this.renderer.drawHealerBeams(turret);
            }
        }

        // Draw nexus
        this.renderer.drawNexus(this.nexus);

        // Draw enemies
        for (const enemy of this.enemies) {
            this.renderer.drawEnemy(enemy);
        }

        // Draw projectiles
        for (const projectile of this.projectiles) {
            this.renderer.drawProjectile(projectile);
        }

        // Draw explosions
        this.renderer.drawExplosions(deltaTime);

        // Draw death effects
        this.renderer.drawDeathEffects(deltaTime);

        // Draw muzzle flashes and other particles
        this.renderer.drawParticles(deltaTime);

        this.renderer.restoreCamera();
    }

    placeBuilding(gridX, gridY, buildingType) {
        if (!this.canPlaceBuilding(gridX, gridY, buildingType)) return false;

        const cost = this.getBuildingCost(buildingType);
        if (!this.canAfford(cost)) return false;

        // In multiplayer, ONLY send to server - server will sync back the result
        if (this.isMultiplayer && this.network) {
            this.network.placeBuilding(gridX, gridY, buildingType);
            return true; // Assume success, server will correct if needed
        }

        // Solo mode: Process locally
        // Deduct resources
        for (const [resource, amount] of Object.entries(cost)) {
            this.resources[resource] -= amount;
        }

        // Place the building
        if (buildingType.startsWith('turret-')) {
            const turret = new Turret(gridX, gridY, buildingType, this.grid);
            turret.id = Date.now();
            this.turrets.push(turret);

            // Handle multi-cell turrets
            const size = turret.config?.gridSize || 1;
            if (size > 1) {
                this.grid.placeMultiBuilding(gridX, gridY, size);
            } else {
                this.grid.placeBuilding(gridX, gridY);
            }
        } else if (buildingType === 'wall' || buildingType === 'wall-reinforced') {
            const wall = new Wall(gridX, gridY, buildingType, this.grid);
            this.walls.push(wall);
            this.grid.placeBuilding(gridX, gridY);

            // Recalculate paths for all enemies
            this.recalculateEnemyPaths();
        } else if (buildingType === 'extractor') {
            const resourceType = this.grid.getResourceType(gridX, gridY);
            if (resourceType) {
                const extractor = new Extractor(gridX, gridY, resourceType, this.grid);
                this.extractors.push(extractor);
                this.grid.placeBuilding(gridX, gridY);
            }
        }

        return true;
    }

    canPlaceBuilding(gridX, gridY, buildingType) {
        if (buildingType === 'extractor') {
            return this.grid.isCellResource(gridX, gridY);
        }

        // Check for multi-cell turrets
        if (buildingType.startsWith('turret-')) {
            const config = TURRET_TYPES[buildingType];
            const size = config?.gridSize || 1;
            if (size > 1) {
                return this.grid.canPlaceMulti(gridX, gridY, size);
            }
        }

        return this.grid.canPlace(gridX, gridY);
    }

    getBuildingCost(buildingType) {
        if (buildingType.startsWith('turret-')) {
            return TURRET_TYPES[buildingType]?.cost || {};
        }
        return BUILDING_TYPES[buildingType]?.cost || {};
    }

    canAfford(cost) {
        for (const [resource, amount] of Object.entries(cost)) {
            if ((this.resources[resource] || 0) < amount) {
                return false;
            }
        }
        return true;
    }

    spawnEnemy(gridX, gridY, type) {
        try {
            const enemy = new Enemy(gridX, gridY, type, this.grid);

            // Make sure enemy is valid
            if (!enemy || !enemy.config) {
                console.error('Failed to create enemy:', type);
                return null;
            }

            // Initialize age to 0 (safety check)
            enemy.age = 0;
            enemy.dead = false;

            // Use main paths for efficiency - find nearest path point
            const path = this.grid.findNearestMainPath(gridX, gridY);
            if (path && path.length > 0) {
                enemy.setPath(path);
            }
            // Always add enemy - if no path, they'll find one or attack obstacles
            this.enemies.push(enemy);
            return enemy;
        } catch (e) {
            console.error('Error spawning enemy:', e);
            return null;
        }
    }

    recalculateEnemyPaths() {
        // No longer needed - enemies now rush directly toward nexus
        // and only walls block them (collision detection happens per-frame)
    }

    progressivePathRecalc(maxPerFrame = 5) {
        // No longer needed - enemies now rush directly toward nexus
    }

    // Toggle path visualization
    togglePathVisualization() {
        return this.grid.togglePathVisualization();
    }
}
