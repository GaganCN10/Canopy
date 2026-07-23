import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import { config } from './config/env.js';
import errorHandler from './middlewares/errorHandler.js';
import mountRoutes from './routes/index.js';
import { initEmail } from './utils/email.js';
import { initTwilio } from './utils/notifications.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

connectDB();

initEmail();
initTwilio();

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: config.env === 'production' ? false : 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

app.io = io;

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their notification room`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'canopy-server', timestamp: new Date().toISOString() });
});

mountRoutes(app);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.use(errorHandler);

const PORT = config.port;

server.listen(PORT, () => {
  console.log(`Canopy server running in ${config.env} mode on port ${PORT}`);
});

export { io };

export default app;
