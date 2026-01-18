const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const GameState = require('./game/GameState');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Serve static files from client directory
app.use(express.static(path.join(__dirname, '../client')));

// Game rooms
const rooms = new Map();

// Debug endpoint to check active rooms
app.get('/api/rooms', (req, res) => {
    const roomList = [];
    for (const [code, room] of rooms) {
        roomList.push({
            code,
            playerCount: room.players.size,
            started: room.started
        });
    }
    res.json({ rooms: roomList, count: roomList.length });
});

// Generate 6-character room code
function generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);

    let currentRoom = null;
    let playerName = 'Player';

    // Create new room
    socket.on('createRoom', (data) => {
        const roomCode = generateRoomCode();
        playerName = data.name || 'Host';

        const gameState = new GameState();
        rooms.set(roomCode, {
            code: roomCode,
            gameState: gameState,
            players: new Map(),
            host: socket.id,
            started: false
        });

        const room = rooms.get(roomCode);
        room.players.set(socket.id, {
            id: socket.id,
            name: playerName,
            color: getPlayerColor(0)
        });

        socket.join(roomCode);
        currentRoom = roomCode;

        socket.emit('roomCreated', {
            code: roomCode,
            playerId: socket.id,
            players: Array.from(room.players.values())
        });

        console.log(`Room created: ${roomCode} by ${playerName}`);
    });

    // Join existing room
    socket.on('joinRoom', (data) => {
        const roomCode = data.code.toUpperCase();
        playerName = data.name || 'Player';

        console.log(`Join attempt: code="${roomCode}" by ${playerName}`);
        console.log(`Active rooms: ${Array.from(rooms.keys()).join(', ') || 'none'}`);

        const room = rooms.get(roomCode);

        if (!room) {
            console.log(`Room not found: ${roomCode}`);
            socket.emit('joinError', { message: 'Room not found' });
            return;
        }

        if (room.players.size >= 4) {
            socket.emit('joinError', { message: 'Room is full (max 4 players)' });
            return;
        }

        if (room.started) {
            socket.emit('joinError', { message: 'Game already started' });
            return;
        }

        room.players.set(socket.id, {
            id: socket.id,
            name: playerName,
            color: getPlayerColor(room.players.size)
        });

        socket.join(roomCode);
        currentRoom = roomCode;

        socket.emit('roomJoined', {
            code: roomCode,
            playerId: socket.id,
            players: Array.from(room.players.values()),
            gameState: room.gameState.serialize()
        });

        // Notify other players
        socket.to(roomCode).emit('playerJoined', {
            player: room.players.get(socket.id),
            players: Array.from(room.players.values())
        });

        console.log(`${playerName} joined room ${roomCode}`);
    });

    // Start game
    socket.on('startGame', (data) => {
        if (!currentRoom) return;

        const room = rooms.get(currentRoom);
        if (!room || room.host !== socket.id) return;

        const gameMode = data?.gameMode || 'waves';
        room.started = true;
        room.gameMode = gameMode;
        room.gameState.gameMode = gameMode; // Set game mode before init
        room.gameState.init();

        const serializedState = room.gameState.serialize();
        serializedState.gameMode = gameMode;

        io.to(currentRoom).emit('gameStarted', {
            gameState: serializedState
        });

        // Start game loop
        startGameLoop(currentRoom);

        console.log(`Game started in room ${currentRoom} with mode: ${gameMode}`);
    });

    // Player places building
    socket.on('placeBuilding', (data) => {
        if (!currentRoom) return;

        const room = rooms.get(currentRoom);
        if (!room || !room.started) return;

        const result = room.gameState.placeBuilding(
            data.gridX,
            data.gridY,
            data.buildingType,
            socket.id
        );

        if (result.success) {
            io.to(currentRoom).emit('buildingPlaced', {
                gridX: data.gridX,
                gridY: data.gridY,
                buildingType: data.buildingType,
                playerId: socket.id,
                resources: room.gameState.resources
            });
        } else {
            socket.emit('buildingFailed', { message: result.message });
        }
    });

    // Player sells building
    socket.on('sellBuilding', (data) => {
        if (!currentRoom) return;

        const room = rooms.get(currentRoom);
        if (!room || !room.started) return;

        const result = room.gameState.sellBuilding(
            data.gridX,
            data.gridY,
            socket.id
        );

        if (result.success) {
            io.to(currentRoom).emit('buildingSold', {
                gridX: data.gridX,
                gridY: data.gridY,
                playerId: socket.id,
                resources: room.gameState.resources
            });
        } else {
            socket.emit('sellFailed', { message: result.message });
        }
    });

    // Player upgrades building
    socket.on('upgradeBuilding', (data) => {
        if (!currentRoom) return;

        const room = rooms.get(currentRoom);
        if (!room || !room.started) return;

        const result = room.gameState.upgradeBuilding(
            data.gridX,
            data.gridY,
            socket.id
        );

        if (result.success) {
            io.to(currentRoom).emit('buildingUpgraded', {
                gridX: data.gridX,
                gridY: data.gridY,
                type: result.type,
                level: result.level,
                playerId: socket.id,
                resources: room.gameState.resources
            });
        } else {
            socket.emit('upgradeFailed', { message: result.message });
        }
    });

    // Chat message
    socket.on('chatMessage', (data) => {
        if (!currentRoom) return;

        const room = rooms.get(currentRoom);
        if (!room) return;

        const player = room.players.get(socket.id);
        if (!player) return;

        io.to(currentRoom).emit('chatMessage', {
            playerId: socket.id,
            playerName: player.name,
            playerColor: player.color,
            message: data.message,
            timestamp: Date.now()
        });
    });

    // Disconnect
    socket.on('disconnect', () => {
        console.log(`Player disconnected: ${socket.id}`);

        if (currentRoom) {
            const room = rooms.get(currentRoom);
            if (room) {
                room.players.delete(socket.id);

                if (room.players.size === 0) {
                    // Delete empty room
                    rooms.delete(currentRoom);
                    console.log(`Room ${currentRoom} deleted (empty)`);
                } else {
                    // Notify remaining players
                    io.to(currentRoom).emit('playerLeft', {
                        playerId: socket.id,
                        players: Array.from(room.players.values())
                    });

                    // Transfer host if needed
                    if (room.host === socket.id) {
                        room.host = room.players.keys().next().value;
                        io.to(currentRoom).emit('hostChanged', { hostId: room.host });
                    }
                }
            }
        }
    });
});

// Game loop for a room
function startGameLoop(roomCode) {
    const TICK_RATE = 60; // 60 updates per second for smooth projectiles
    const SYNC_RATE = 30; // Send state to clients 30 times per second
    let lastTime = Date.now();
    let lastSyncTime = Date.now();
    const syncInterval = 1000 / SYNC_RATE;

    const gameLoop = setInterval(() => {
        try {
            const room = rooms.get(roomCode);
            if (!room || room.players.size === 0) {
                clearInterval(gameLoop);
                console.log(`Game loop stopped for room ${roomCode} - no players`);
                return;
            }

            const now = Date.now();
            const deltaTime = (now - lastTime) / 1000;
            lastTime = now;

            // Cap deltaTime to prevent huge jumps
            const cappedDelta = Math.min(deltaTime, 0.1);

            // Update game state every tick
            room.gameState.update(cappedDelta);

            // Send state to clients at SYNC_RATE
            if (now - lastSyncTime >= syncInterval) {
                lastSyncTime = now;
                io.to(roomCode).emit('gameState', {
                    state: room.gameState.serializeForSync(),
                    timestamp: now
                });
            }

            // Check game over
            if (room.gameState.isGameOver()) {
                io.to(roomCode).emit('gameOver', {
                    waveReached: room.gameState.waveNumber
                });
                clearInterval(gameLoop);
                console.log(`Game over in room ${roomCode} at wave ${room.gameState.waveNumber}`);
            }
        } catch (error) {
            console.error(`Error in game loop for room ${roomCode}:`, error);
            // Don't stop the loop on error, try to continue
        }

    }, 1000 / TICK_RATE);
}

function getPlayerColor(index) {
    const colors = ['#4a9eff', '#2ecc71', '#e67e22', '#9b59b6'];
    return colors[index % colors.length];
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Tower Defense Server running on http://localhost:${PORT}`);
});
