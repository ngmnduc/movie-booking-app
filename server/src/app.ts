// server/src/app.ts
import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import routes from './routes';


dotenv.config();

const app: Express = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware setup
app.use(cors());
app.use(express.json());

// Store io instance in app for use in routes
app.set('io', io);

// Routes setup
app.use('/api', routes);

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', (showtimeId: string | number) => {
    const roomName = `showtime_${showtimeId}`;
    socket.join(roomName);
    console.log(`Socket ${socket.id} joined room ${roomName}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Backend Server is running on http://localhost:${PORT}`);
});

export default app;