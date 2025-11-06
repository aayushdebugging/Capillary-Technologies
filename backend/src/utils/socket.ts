import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

let io: Server | null = null;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('join_recipe', (recipeId: string) => {
      socket.join(`recipe_${recipeId}`);
    });

    socket.on('leave_recipe', (recipeId: string) => {
      socket.leave(`recipe_${recipeId}`);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });
};

export const getIO = () => io;
