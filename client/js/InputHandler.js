export class InputHandler {
    constructor(canvas, grid) {
        this.canvas = canvas;
        this.grid = grid;

        this.mouseX = 0;
        this.mouseY = 0;
        this.gridX = 0;
        this.gridY = 0;

        this.isMouseDown = false;
        this.selectedBuilding = null;

        this.onPlace = null; // Callback when placing building
        this.onSelect = null; // Callback when selecting

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;

        const gridPos = this.grid.worldToGrid(this.mouseX, this.mouseY);
        this.gridX = gridPos.x;
        this.gridY = gridPos.y;
    }

    handleMouseDown(e) {
        this.isMouseDown = true;

        if (e.button === 0) { // Left click
            if (this.selectedBuilding && this.onPlace) {
                this.onPlace(this.gridX, this.gridY, this.selectedBuilding);
            } else if (this.onSelect) {
                this.onSelect(this.gridX, this.gridY);
            }
        } else if (e.button === 2) { // Right click
            this.selectedBuilding = null;
            this.updateBuildButtons();
        }
    }

    handleMouseUp(e) {
        this.isMouseDown = false;
    }

    handleKeyDown(e) {
        // Number keys for quick building selection
        const buildingKeys = {
            '1': 'turret-mg',
            '2': 'turret-sniper',
            '3': 'turret-artillery',
            '4': 'turret-flamethrower',
            '5': 'turret-tesla',
            '6': 'turret-laser',
            '7': 'wall',
            '8': 'extractor'
        };

        if (buildingKeys[e.key]) {
            this.selectedBuilding = buildingKeys[e.key];
            this.updateBuildButtons();
        }

        if (e.key === 'Escape') {
            this.selectedBuilding = null;
            this.updateBuildButtons();
        }
    }

    updateBuildButtons() {
        document.querySelectorAll('.build-btn').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.building === this.selectedBuilding);
        });
    }

    setSelectedBuilding(building) {
        this.selectedBuilding = building;
        this.updateBuildButtons();
    }

    getSelectedBuilding() {
        return this.selectedBuilding;
    }

    getMouseGridPosition() {
        return { x: this.gridX, y: this.gridY };
    }

    getMouseWorldPosition() {
        return { x: this.mouseX, y: this.mouseY };
    }
}
