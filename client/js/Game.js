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

        // Set canvas size
        this.canvas.width = 40 * this.cellSize; // 1280
        this.canvas.height = 30 * this.cellSize; // 960

        // Initialize systems
        this.grid = new Grid(this.canvas.width, this.canvas.height, this.cellSize);
        this.renderer = new Renderer(this.canvas, this.grid);
        this.inputHandler = new InputHandler(this.canvas, this.grid);

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
        this.gameOver = false;
        this.lastTime = 0;

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

        // Start game loop
        this.start();
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

        // Check if clicking on a turret
        const turret = this.getTurretAt(gridX, gridY);

        if (this.actionMode === 'sell' && turret) {
            this.sellTurret(turret);
        } else if (this.actionMode === 'upgrade' && turret) {
            this.upgradeTurret(turret);
        } else if (turret) {
            this.selectedTurret = turret;
        } else {
            this.selectedTurret = null;
        }
    }

    getTurretAt(gridX, gridY) {
        return this.turrets.find(t => t.gridX === gridX && t.gridY === gridY);
    }

    getHoveredTurret() {
        const gridPos = this.inputHandler.getMouseGridPosition();
        return this.getTurretAt(gridPos.x, gridPos.y);
    }

    sellTurret(turret) {
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

        // Free grid cell
        this.grid.removeBuilding(turret.gridX, turret.gridY);

        // Recalculate enemy paths
        this.recalculateEnemyPaths();

        this.selectedTurret = null;
    }

    upgradeTurret(turret) {
        if (turret.level >= turret.maxLevel) return;

        const cost = turret.getUpgradeCost();
        if (!cost || !this.canAfford(cost)) return;

        // Deduct resources
        for (const [resource, amount] of Object.entries(cost)) {
            this.resources[resource] -= amount;
        }

        // Upgrade turret
        turret.upgrade();

        this.selectedTurret = turret;
    }

    damageStructure(structure, damage) {
        if (!structure) return;

        // Check if it's a wall
        const wallIndex = this.walls.indexOf(structure);
        if (wallIndex > -1) {
            structure.health -= damage;
            if (structure.health <= 0) {
                this.walls.splice(wallIndex, 1);
                this.grid.removeBuilding(structure.gridX, structure.gridY);
                this.recalculateEnemyPaths();
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
                this.recalculateEnemyPaths();
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
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        if (!this.gameOver) {
            this.update(deltaTime);
            this.render(deltaTime);
        }

        requestAnimationFrame((time) => this.gameLoop(time));
    }

    update(deltaTime) {
        // Update wave manager
        this.waveManager.update(deltaTime);

        // Update extractors
        for (const extractor of this.extractors) {
            extractor.update(deltaTime);

            // Auto-collect resources
            if (extractor.stored > 0) {
                const collected = extractor.collect();
                this.resources[collected.type] = (this.resources[collected.type] || 0) + collected.amount;
            }
        }

        // Update enemies
        for (const enemy of this.enemies) {
            enemy.update(deltaTime, this.nexus, this.enemies, this);
        }

        // Remove dead enemies and collect rewards
        this.enemies = this.enemies.filter(enemy => {
            if (enemy.dead && !enemy.reachedNexus) {
                const reward = enemy.getReward();
                for (const [resource, amount] of Object.entries(reward)) {
                    this.resources[resource] = (this.resources[resource] || 0) + amount;
                }
            }
            return !enemy.dead;
        });

        // Update turrets
        for (const turret of this.turrets) {
            turret.update(deltaTime, this.enemies, this.projectiles, this);
        }

        // Update projectiles
        this.updateProjectiles(deltaTime);

        // Check game over
        if (this.nexus.isDestroyed()) {
            this.gameOver = true;
            this.ui.showGameOver();
        }

        // Update UI (always)
        this.ui.update();
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

            // Move projectile
            if (proj.vx !== undefined) {
                proj.x += proj.vx * deltaTime;
                proj.y += proj.vy * deltaTime;

                // Check bounds
                if (proj.x < 0 || proj.x > this.canvas.width ||
                    proj.y < 0 || proj.y > this.canvas.height) {
                    this.projectiles.splice(i, 1);
                    continue;
                }

                // Check enemy collisions
                for (const enemy of this.enemies) {
                    if (enemy.dead) continue;
                    if (proj.hitEnemies && proj.hitEnemies.includes(enemy)) continue;

                    const dist = Math.sqrt((proj.x - enemy.x) ** 2 + (proj.y - enemy.y) ** 2);
                    const hitRadius = this.cellSize * enemy.config.size / 2;

                    if (dist < hitRadius) {
                        // Hit!
                        if (proj.aoeRadius > 0) {
                            // AOE damage
                            this.dealAOEDamage(proj.x, proj.y, proj.aoeRadius, proj.damage);
                            this.renderer.addExplosion(proj.x, proj.y, proj.aoeRadius);
                            this.projectiles.splice(i, 1);
                        } else {
                            enemy.takeDamage(proj.damage);

                            // Apply DOT for flamethrower
                            if (proj.dotDamage) {
                                enemy.applyBurn(proj.dotDamage, proj.dotDuration);
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
        for (const enemy of this.enemies) {
            if (enemy.dead) continue;

            const dist = Math.sqrt((x - enemy.x) ** 2 + (y - enemy.y) ** 2);
            if (dist <= radius) {
                // Damage falls off with distance
                const falloff = 1 - (dist / radius) * 0.5;
                enemy.takeDamage(damage * falloff);
            }
        }
    }

    render(deltaTime) {
        this.renderer.clear();
        this.renderer.drawGrid();
        this.renderer.drawResources();

        // Draw placement preview
        const selectedBuilding = this.inputHandler.getSelectedBuilding();
        if (selectedBuilding) {
            const gridPos = this.inputHandler.getMouseGridPosition();
            const canPlace = this.canPlaceBuilding(gridPos.x, gridPos.y, selectedBuilding);
            this.renderer.drawPlacementPreview(gridPos.x, gridPos.y, canPlace, selectedBuilding);

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

        // Draw turrets
        const hoveredTurret = this.getHoveredTurret();
        for (const turret of this.turrets) {
            const isSelected = turret === this.selectedTurret || turret === hoveredTurret;
            this.renderer.drawTurret(turret, isSelected, this.actionMode);

            // Draw range when hovering or selected
            if (turret === hoveredTurret || turret === this.selectedTurret) {
                this.renderer.drawRangeIndicator(turret.x, turret.y, turret.config.range);
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
    }

    placeBuilding(gridX, gridY, buildingType) {
        if (!this.canPlaceBuilding(gridX, gridY, buildingType)) return false;

        const cost = this.getBuildingCost(buildingType);
        if (!this.canAfford(cost)) return false;

        // In multiplayer, also notify server (but still process locally for responsiveness)
        if (this.isMultiplayer && this.network) {
            this.network.placeBuilding(gridX, gridY, buildingType);
        }

        // Process locally (both solo and multiplayer)
        // Deduct resources
        for (const [resource, amount] of Object.entries(cost)) {
            this.resources[resource] -= amount;
        }

        // Place the building
        if (buildingType.startsWith('turret-')) {
            const turret = new Turret(gridX, gridY, buildingType, this.grid);
            turret.id = Date.now();
            this.turrets.push(turret);
            this.grid.placeBuilding(gridX, gridY);
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
        const enemy = new Enemy(gridX, gridY, type, this.grid);

        // Calculate path to nexus
        const path = this.grid.findPath(gridX, gridY, this.nexus.gridX, this.nexus.gridY);
        if (path) {
            enemy.setPath(path);
        }
        // Always add enemy - if no path, they'll find one or attack obstacles
        this.enemies.push(enemy);
        return enemy;
    }

    recalculateEnemyPaths() {
        for (const enemy of this.enemies) {
            const path = this.grid.findPath(enemy.gridX, enemy.gridY, this.nexus.gridX, this.nexus.gridY);
            if (path) {
                enemy.setPath(path);
            }
        }
    }
}
