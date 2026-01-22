export class Grid {
    constructor(width, height, cellSize) {
        this.width = width;
        this.height = height;
        this.cellSize = cellSize;
        this.cols = Math.floor(width / cellSize);
        this.rows = Math.floor(height / cellSize);

        // Grid cells: 0 = empty, 1 = occupied, 2 = resource, 3 = nexus, 4 = border (walkable, not buildable)
        this.cells = [];
        this.resourceMap = []; // Type of resource at each cell

        // 4 main paths from edges to nexus (optimization)
        this.mainPaths = {
            north: [],
            east: [],
            south: [],
            west: []
        };
        this.nexusX = null;
        this.nexusY = null;

        // Toggle for visualizing paths
        this.showPaths = false;

        this.init();
    }

    init() {
        for (let y = 0; y < this.rows; y++) {
            this.cells[y] = [];
            this.resourceMap[y] = [];
            for (let x = 0; x < this.cols; x++) {
                // Mark borders as non-buildable (cell value 4)
                if (x === 0 || x === this.cols - 1 || y === 0 || y === this.rows - 1) {
                    this.cells[y][x] = 4; // Border - walkable but not buildable
                } else {
                    this.cells[y][x] = 0;
                }
                this.resourceMap[y][x] = null;
            }
        }

        this.generateResources();
    }

    generateResources() {
        const resourceTypes = ['iron', 'copper', 'coal', 'gold'];
        // 3x more resources for 3x larger map
        const resourceCounts = { iron: 75, copper: 54, coal: 36, gold: 24 };

        for (const type of resourceTypes) {
            let placed = 0;
            let attempts = 0;

            while (placed < resourceCounts[type] && attempts < 1000) {
                const x = Math.floor(Math.random() * this.cols);
                const y = Math.floor(Math.random() * this.rows);

                // Don't place near center (nexus area) or edges
                const centerX = Math.floor(this.cols / 2);
                const centerY = Math.floor(this.rows / 2);
                const distFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);

                if (distFromCenter > 5 && x > 2 && x < this.cols - 3 &&
                    y > 2 && y < this.rows - 3 && this.cells[y][x] === 0) {
                    this.cells[y][x] = 2;
                    this.resourceMap[y][x] = type;
                    placed++;
                }
                attempts++;
            }
        }
    }

    worldToGrid(worldX, worldY) {
        return {
            x: Math.floor(worldX / this.cellSize),
            y: Math.floor(worldY / this.cellSize)
        };
    }

    gridToWorld(gridX, gridY) {
        return {
            x: gridX * this.cellSize + this.cellSize / 2,
            y: gridY * this.cellSize + this.cellSize / 2
        };
    }

    isValidCell(x, y) {
        return x >= 0 && x < this.cols && y >= 0 && y < this.rows;
    }

    isCellEmpty(x, y) {
        return this.isValidCell(x, y) && this.cells[y][x] === 0;
    }

    isCellResource(x, y) {
        return this.isValidCell(x, y) && this.cells[y][x] === 2;
    }

    getResourceType(x, y) {
        if (this.isValidCell(x, y)) {
            return this.resourceMap[y][x];
        }
        return null;
    }

    canPlace(x, y, requiresResource = false) {
        if (!this.isValidCell(x, y)) return false;

        if (requiresResource) {
            return this.cells[y][x] === 2; // Must be on resource
        }

        return this.cells[y][x] === 0 || this.cells[y][x] === 2;
    }

    placeBuilding(x, y) {
        if (this.isValidCell(x, y)) {
            this.cells[y][x] = 1;
            return true;
        }
        return false;
    }

    removeBuilding(x, y) {
        if (this.isValidCell(x, y) && this.cells[y][x] === 1) {
            // Check if there was a resource here originally
            if (this.resourceMap[y][x]) {
                this.cells[y][x] = 2;
            } else {
                this.cells[y][x] = 0;
            }
            return true;
        }
        return false;
    }

    // Multi-cell building support (2x2 and 3x3 turrets)
    // For 2x2: place at (x,y), (x+1,y), (x,y+1), (x+1,y+1) - topleft corner is anchor
    // For 3x3: place centered at (x,y) with offset -1 to +1
    canPlaceMulti(anchorX, anchorY, size) {
        if (size === 2) {
            // 2x2: anchor is top-left corner
            for (let dy = 0; dy < 2; dy++) {
                for (let dx = 0; dx < 2; dx++) {
                    if (!this.canPlace(anchorX + dx, anchorY + dy)) return false;
                }
            }
        } else {
            // 3x3 or other odd sizes: anchor is center
            const offset = Math.floor(size / 2);
            for (let dy = -offset; dy <= offset; dy++) {
                for (let dx = -offset; dx <= offset; dx++) {
                    if (!this.canPlace(anchorX + dx, anchorY + dy)) return false;
                }
            }
        }
        return true;
    }

    placeMultiBuilding(anchorX, anchorY, size) {
        if (size === 2) {
            // 2x2: anchor is top-left corner
            for (let dy = 0; dy < 2; dy++) {
                for (let dx = 0; dx < 2; dx++) {
                    this.placeBuilding(anchorX + dx, anchorY + dy);
                }
            }
        } else {
            // 3x3 or other odd sizes: anchor is center
            const offset = Math.floor(size / 2);
            for (let dy = -offset; dy <= offset; dy++) {
                for (let dx = -offset; dx <= offset; dx++) {
                    this.placeBuilding(anchorX + dx, anchorY + dy);
                }
            }
        }
    }

    removeMultiBuilding(anchorX, anchorY, size) {
        if (size === 2) {
            // 2x2: anchor is top-left corner
            for (let dy = 0; dy < 2; dy++) {
                for (let dx = 0; dx < 2; dx++) {
                    this.removeBuilding(anchorX + dx, anchorY + dy);
                }
            }
        } else {
            // 3x3 or other odd sizes: anchor is center
            const offset = Math.floor(size / 2);
            for (let dy = -offset; dy <= offset; dy++) {
                for (let dx = -offset; dx <= offset; dx++) {
                    this.removeBuilding(anchorX + dx, anchorY + dy);
                }
            }
        }
    }

    // Get world position for center of multi-cell building
    gridToWorldMulti(anchorX, anchorY, size) {
        if (size === 2) {
            // 2x2: center is between the 4 cells
            return {
                x: (anchorX + 1) * this.cellSize,
                y: (anchorY + 1) * this.cellSize
            };
        } else {
            // 3x3: center is the anchor cell center
            return {
                x: anchorX * this.cellSize + this.cellSize / 2,
                y: anchorY * this.cellSize + this.cellSize / 2
            };
        }
    }

    setNexus(x, y) {
        if (this.isValidCell(x, y)) {
            this.cells[y][x] = 3;
            this.nexusX = x;
            this.nexusY = y;
            // Calculate main paths after nexus is set
            this.calculateMainPaths();
        }
    }

    // Calculate 4 main paths from edge centers to nexus
    calculateMainPaths() {
        if (this.nexusX === null || this.nexusY === null) return;

        const centerX = Math.floor(this.cols / 2);
        const centerY = Math.floor(this.rows / 2);

        // Define spawn points at center of each edge
        const spawnPoints = {
            north: { x: centerX, y: 0 },
            south: { x: centerX, y: this.rows - 1 },
            west: { x: 0, y: centerY },
            east: { x: this.cols - 1, y: centerY }
        };

        // Calculate paths from each spawn point to nexus
        for (const [direction, spawn] of Object.entries(spawnPoints)) {
            const path = this.findPath(spawn.x, spawn.y, this.nexusX, this.nexusY);
            this.mainPaths[direction] = path || [];
        }
    }

    // Find the nearest main path for an enemy position
    findNearestMainPath(x, y) {
        let bestPath = null;
        let bestDistance = Infinity;
        let bestStartIndex = 0;

        for (const [direction, path] of Object.entries(this.mainPaths)) {
            if (!path || path.length === 0) continue;

            // Find the closest point on this path
            for (let i = 0; i < path.length; i++) {
                const point = path[i];
                const dist = Math.abs(point.x - x) + Math.abs(point.y - y); // Manhattan distance

                if (dist < bestDistance) {
                    bestDistance = dist;
                    bestPath = path;
                    bestStartIndex = i;
                }
            }
        }

        // Return a copy of the path starting from the nearest point
        if (bestPath && bestStartIndex < bestPath.length) {
            return bestPath.slice(bestStartIndex).map(p => ({ x: p.x, y: p.y }));
        }

        return null;
    }

    // Toggle path visualization
    togglePathVisualization() {
        this.showPaths = !this.showPaths;
        return this.showPaths;
    }

    // A* Pathfinding
    findPath(startX, startY, endX, endY) {
        const openSet = [];
        const closedSet = new Set();
        const cameFrom = new Map();

        const gScore = new Map();
        const fScore = new Map();

        const startKey = `${startX},${startY}`;
        const endKey = `${endX},${endY}`;

        gScore.set(startKey, 0);
        fScore.set(startKey, this.heuristic(startX, startY, endX, endY));

        openSet.push({ x: startX, y: startY, f: fScore.get(startKey) });

        // Max iterations to prevent infinite loops on large maps
        let iterations = 0;
        const maxIterations = 50000;

        while (openSet.length > 0 && iterations < maxIterations) {
            iterations++;
            // Get node with lowest fScore
            openSet.sort((a, b) => a.f - b.f);
            const current = openSet.shift();
            const currentKey = `${current.x},${current.y}`;

            if (currentKey === endKey) {
                return this.reconstructPath(cameFrom, current);
            }

            closedSet.add(currentKey);

            // Check neighbors (4-directional)
            const neighbors = [
                { x: current.x - 1, y: current.y },
                { x: current.x + 1, y: current.y },
                { x: current.x, y: current.y - 1 },
                { x: current.x, y: current.y + 1 }
            ];

            for (const neighbor of neighbors) {
                const neighborKey = `${neighbor.x},${neighbor.y}`;

                if (closedSet.has(neighborKey)) continue;
                if (!this.isWalkable(neighbor.x, neighbor.y)) continue;

                const tentativeG = gScore.get(currentKey) + 1;

                if (!gScore.has(neighborKey) || tentativeG < gScore.get(neighborKey)) {
                    cameFrom.set(neighborKey, current);
                    gScore.set(neighborKey, tentativeG);
                    const f = tentativeG + this.heuristic(neighbor.x, neighbor.y, endX, endY);
                    fScore.set(neighborKey, f);

                    if (!openSet.some(n => n.x === neighbor.x && n.y === neighbor.y)) {
                        openSet.push({ x: neighbor.x, y: neighbor.y, f });
                    }
                }
            }
        }

        return null; // No path found
    }

    heuristic(x1, y1, x2, y2) {
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    }

    isWalkable(x, y) {
        if (!this.isValidCell(x, y)) return false;
        const cell = this.cells[y][x];
        // Can walk on empty (0), resource (2), nexus (3), border (4)
        // Cannot walk on occupied (1)
        return cell === 0 || cell === 2 || cell === 3 || cell === 4;
    }

    reconstructPath(cameFrom, current) {
        const path = [{ x: current.x, y: current.y }];
        let currentKey = `${current.x},${current.y}`;

        while (cameFrom.has(currentKey)) {
            const prev = cameFrom.get(currentKey);
            path.unshift({ x: prev.x, y: prev.y });
            currentKey = `${prev.x},${prev.y}`;
        }

        return path;
    }
}
