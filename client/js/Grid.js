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

        this.init();
    }

    init() {
        for (let y = 0; y < this.rows; y++) {
            this.cells[y] = [];
            this.resourceMap[y] = [];
            for (let x = 0; x < this.cols; x++) {
                this.cells[y][x] = 0;
                this.resourceMap[y][x] = null;
            }
        }

        this.generateResources();
    }

    generateResources() {
        const resourceTypes = ['iron', 'copper', 'coal', 'gold'];
        // More resources for larger map
        const resourceCounts = { iron: 25, copper: 18, coal: 12, gold: 8 };

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

    setNexus(x, y) {
        if (this.isValidCell(x, y)) {
            this.cells[y][x] = 3;
        }
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

        while (openSet.length > 0) {
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
