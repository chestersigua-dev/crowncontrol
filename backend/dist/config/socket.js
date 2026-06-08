"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcastVoteLive = exports.broadcastLeaderboardUpdate = exports.broadcastScoreUpdate = exports.getIO = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
let io = null;
const initSocket = (server) => {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            methods: ['GET', 'POST'],
        },
    });
    io.on('connection', (socket) => {
        console.log(`Socket client connected: ${socket.id}`);
        socket.on('disconnect', () => {
            console.log(`Socket client disconnected: ${socket.id}`);
        });
    });
    return io;
};
exports.initSocket = initSocket;
const getIO = () => {
    if (!io) {
        throw new Error('Socket.io has not been initialized');
    }
    return io;
};
exports.getIO = getIO;
const broadcastScoreUpdate = (data) => {
    if (io) {
        io.emit('score:update', data);
    }
};
exports.broadcastScoreUpdate = broadcastScoreUpdate;
const broadcastLeaderboardUpdate = (data) => {
    if (io) {
        io.emit('leaderboard:update', data);
    }
};
exports.broadcastLeaderboardUpdate = broadcastLeaderboardUpdate;
const broadcastVoteLive = (data) => {
    if (io) {
        io.emit('vote:live', data);
    }
};
exports.broadcastVoteLive = broadcastVoteLive;
