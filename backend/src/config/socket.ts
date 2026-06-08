import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

let io: SocketIOServer | null = null;

export const initSocket = (server: HTTPServer) => {
  io = new SocketIOServer(server, {
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

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.io has not been initialized');
  }
  return io;
};

export const broadcastScoreUpdate = (data: any) => {
  if (io) {
    io.emit('score:update', data);
  }
};

export const broadcastLeaderboardUpdate = (data: any) => {
  if (io) {
    io.emit('leaderboard:update', data);
  }
};

export const broadcastVoteLive = (data: any) => {
  if (io) {
    io.emit('vote:live', data);
  }
};
