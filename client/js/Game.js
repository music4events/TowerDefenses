import { Grid } from './Grid.js';
import { Renderer } from './Renderer.js';
import { InputHandler } from './InputHandler.js';
import { UI } from './UI.js';
import { Nexus } from './entities/Nexus.js';
import { Enemy } from './entities/Enemy.js';
import { Turret } from './entities/Turret.js';
import { Wall } from './entities/Wall.js';
import { Extractor } from './entities/Extractor.js';
import { TURRET_TYPES } from './data/turrets.js';
import { BUILDING_TYPES } from './data/buildings.js';
import { ENEMY_TYPES } from './data/enemies.js';

export class Game {
    constructor(canvas, network = null, initialState = null) {
        this.canvas = canvas;
        this.cellSize = 32;
        this.isMultiplayer = true; // Always multiplayer mode
        this.network = network;

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
        this.selectedExtractor = null;
        this.selectedNexus = false;
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

        // UI
        this.ui = new UI(this);

        // Setup input callbacks
        this.inputHandler.onPlace = (x, y, building) => this.handleClick(x, y, building, false);
        this.inputHandler.onSelect = (x, y, shiftKey) => this.handleClick(x, y, null, shiftKey);

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

        // Send to server (only host can change)
        if (this.network) {
            this.network.setGameSpeed(speed);
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

    handleClick(gridX, gridY, building, shiftKey = false) {
        // If we have a building selected, try to place it
        if (building) {
            this.placeBuilding(gridX, gridY, building);
            return;
        }

        // Check if clicking on a building (turret, extractor, wall) or nexus
        const turret = this.getTurretAt(gridX, gridY);
        const extractor = this.extractors.find(e => e.gridX === gridX && e.gridY === gridY);
        const wall = this.walls.find(w => w.gridX === gridX && w.gridY === gridY);
        const isNexus = this.nexus && gridX === this.nexus.gridX && gridY === this.nexus.gridY;
        const hasBuilding = turret || extractor || wall;

        // Number of upgrades: 5 if shift is held, 1 otherwise
        const upgradeCount = shiftKey ? 5 : 1;

        if (this.actionMode === 'sell' && hasBuilding) {
            this.sellBuilding(gridX, gridY);
            this.selectedTurret = null;
            this.selectedExtractor = null;
            this.selectedNexus = false;
        } else if (this.actionMode === 'upgrade') {
            if (isNexus) {
                // Upgrade nexus (multiple times if shift held)
                for (let i = 0; i < upgradeCount; i++) {
                    this.upgradeNexus();
                }
                this.selectedNexus = true;
                this.selectedTurret = null;
                this.selectedExtractor = null;
            } else if (turret || extractor || wall) {
                // Upgrade building (multiple times if shift held)
                for (let i = 0; i < upgradeCount; i++) {
                    this.upgradeBuilding(gridX, gridY);
                }
                this.selectedTurret = turret || null;
                this.selectedExtractor = extractor || null;
                this.selectedNexus = false;
            }
        } else if (turret) {
            this.selectedTurret = turret;
            this.selectedExtractor = null;
            this.selectedNexus = false;
        } else if (extractor) {
            this.selectedTurret = null;
            this.selectedExtractor = extractor;
            this.selectedNexus = false;
        } else if (isNexus) {
            this.selectedTurret = null;
            this.selectedExtractor = null;
            this.selectedNexus = true;
        } else {
            this.selectedTurret = null;
            this.selectedExtractor = null;
            this.selectedNexus = false;
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

    getHoveredExtractor() {
        const gridPos = this.inputHandler.getMouseGridPosition();
        return this.extractors.find(e => e.gridX === gridPos.x && e.gridY === gridPos.y);
    }

    isHoveringNexus() {
        const gridPos = this.inputHandler.getMouseGridPosition();
        return this.nexus && gridPos.x === this.nexus.gridX && gridPos.y === this.nexus.gridY;
    }

    upgradeNexus() {
        if (this.network) {
            this.network.upgradeNexus();
        }
    }

    sellBuilding(gridX, gridY) {
        // Send to server
        if (this.network) {
            this.network.sellBuilding(gridX, gridY);
        }
    }

    upgradeBuilding(gridX, gridY) {
        // Send to server
        if (this.network) {
            this.network.upgradeBuilding(gridX, gridY);
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
        // ===== MULTIPLAYER MODE: Server handles all game logic =====
        // Interpolate projectiles locally for smooth rendering
        this.interpolateProjectiles(deltaTime);

        // Check game over
        if (this.nexus.isDestroyed()) {
            this.gameOver = true;
            this.ui.showGameOver();
        }

        // Update UI
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

            // Handle delay for salvo firing
            if (proj.delay !== undefined && proj.delay > 0) {
                proj.delay -= deltaTime;
                continue;
            }

            // Special handling for orbital strike
            if (proj.type === 'orbital-strike' && proj.delay !== undefined) {
                proj.delay -= deltaTime;
                if (proj.delay <= 0 && !proj.triggered) {
                    proj.triggered = true;
                }
                continue;
            }

            // Particle trail for missiles (visual only)
            if ((proj.type === 'missile' || proj.type === 'rocket' || proj.type === 'battery-missile' || proj.type === 'nuclear') && proj.trail) {
                proj.trail.push({
                    x: proj.x + (Math.random() - 0.5) * 6,
                    y: proj.y + (Math.random() - 0.5) * 6,
                    life: 1,
                    size: 4 + Math.random() * 4
                });
                if (proj.trail.length > 20) proj.trail.shift();
            }

            // Move projectile locally based on velocity
            if (proj.vx !== undefined && proj.vy !== undefined) {
                proj.x += proj.vx * deltaTime;
                proj.y += proj.vy * deltaTime;

                // Check bounds
                if (proj.x < -100 || proj.x > this.mapWidth + 100 ||
                    proj.y < -100 || proj.y > this.mapHeight + 100) {
                    this.projectiles.splice(i, 1);
                    continue;
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

        // Draw all stars on top of everything
        this.renderer.drawAllStars();

        this.renderer.restoreCamera();
    }

    placeBuilding(gridX, gridY, buildingType) {
        if (!this.canPlaceBuilding(gridX, gridY, buildingType)) return false;

        const cost = this.getBuildingCost(buildingType);
        if (!this.canAfford(cost)) return false;

        // Send to server - server will sync back the result
        if (this.network) {
            this.network.placeBuilding(gridX, gridY, buildingType);
            return true;
        }

        return false;
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
