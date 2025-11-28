import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/database.js';
import connectRedis from './config/redis.js';
import { errorHandler, notFound } from './middleware/error.middleware.js';
import { rateLimiter } from './middleware/rateLimiter.middleware.js';
import { checkFirebaseStatus } from './config/firebase.js';
import { checkCloudinaryStatus } from './config/cloudinary.js';
import { checkEmailConfig } from './services/email.service.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import listingRoutes from './routes/listing.routes.js';
import inspectionRoutes from './routes/inspection.routes.js';
import chatRoutes from './routes/chat.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import adminRoutes from './routes/admin.routes.js';
import testRoutes from './routes/test.routes.js';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env file (absolute path)
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO for real-time chat
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Make io accessible in routes
app.set('io', io);

// Connect to databases
connectDB();
connectRedis();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true,
}));

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
app.use('/api', rateLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Phonely API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API routes
const API_VERSION = process.env.API_VERSION || 'v1';

app.use(`/api/${API_VERSION}/auth`, authRoutes);
app.use(`/api/${API_VERSION}/users`, userRoutes);
app.use(`/api/${API_VERSION}/listings`, listingRoutes);
app.use(`/api/${API_VERSION}/inspections`, inspectionRoutes);
app.use(`/api/${API_VERSION}/chats`, chatRoutes);
app.use(`/api/${API_VERSION}/upload`, uploadRoutes);
app.use(`/api/${API_VERSION}/admin`, adminRoutes);

// Test routes (development only - remove in production)
if (process.env.NODE_ENV === 'development') {
  app.use(`/api/${API_VERSION}/test`, testRoutes);
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Join chat room
  socket.on('join-chat', (chatId) => {
    socket.join(`chat:${chatId}`);
    console.log(`User ${socket.id} joined chat ${chatId}`);
  });

  // Send message
  socket.on('send-message', (data) => {
    io.to(`chat:${data.chatId}`).emit('new-message', data);
  });

  // Typing indicator
  socket.on('typing', (data) => {
    socket.to(`chat:${data.chatId}`).emit('user-typing', {
      userId: data.userId,
      isTyping: data.isTyping,
    });
  });

  // Leave chat room
  socket.on('leave-chat', (chatId) => {
    socket.leave(`chat:${chatId}`);
    console.log(`User ${socket.id} left chat ${chatId}`);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const baseUrl = isProduction ? 'https://api.phonely.com.pk' : 'http://localhost';
  
  console.log(`
  ╔═══════════════════════════════════════╗
  ║                                       ║
  ║   📱 PHONELY API SERVER               ║
  ║                                       ║
  ║   Environment: ${process.env.NODE_ENV?.toUpperCase().padEnd(20)}   ║
  ║   Port: ${PORT}                          ║
  ║   API Version: ${API_VERSION}                     ║
  ║                                       ║
  ║   Endpoints:                          ║
  ║   • Health: ${baseUrl}${isProduction ? '' : ':' + PORT}/health
  ║   • API: ${baseUrl}${isProduction ? '' : ':' + PORT}/api/${API_VERSION}
  ║                                       ║
  ╚═══════════════════════════════════════╝
  `);
  
  // Check service status after banner
  console.log('📋 Service Status:');
  console.log('');
  checkFirebaseStatus();
  checkCloudinaryStatus();
  checkEmailConfig();
  console.log('');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  httpServer.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

export default app;
