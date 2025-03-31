import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import session from 'express-session';
import { WebSocketServer } from 'ws';
import http from 'http';

// Route imports
import apiRoutes from './routes-api.js';
import uiRoutes from './routes-ui.js';
import dashboardRoutes from './routes-dashboard.js';
import { authMiddleware, publicRoutes } from './auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// WebSocket setup with production support
const wss = new WebSocketServer({ 
    server,
    clientTracking: true,
    perMessageDeflate: false,
    maxPayload: 32 * 1024 // 32KB max payload
});

const clients = new Set();

wss.on('connection', (ws, req) => {
    clients.add(ws);
    
    // Add ping/pong for connection health check
    ws.isAlive = true;
    ws.on('pong', () => { ws.isAlive = true; });
    
    ws.on('close', () => {
        clients.delete(ws);
        ws.isAlive = false;
    });
    
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        ws.isAlive = false;
        clients.delete(ws);
    });
});

// Health check interval for WebSocket connections
const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
        if (ws.isAlive === false) return ws.terminate();
        ws.isAlive = false;
        ws.ping();
    });
}, 30000);

wss.on('close', () => {
    clearInterval(interval);
});

export function broadcastLoginSuccess() {
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send('login_success');
        }
    });
}

// Middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? [/\.render\.com$/, /localhost/] : true,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session setup with secure settings for production
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Static files
app.use(express.static(join(__dirname, 'public')));
app.use('/js', express.static(join(__dirname, 'public/js')));

// Root redirect
app.get('/', (req, res) => {
    res.redirect('/dashboard');
});

// Authentication middleware for non-public routes
app.use((req, res, next) => {
    if (publicRoutes.includes(req.path) || req.path.startsWith('/api/')) {
        return next();
    }
    authMiddleware(req, res, next);
});

// Routes
app.use('/api', apiRoutes);
app.use('/', uiRoutes);
app.use('/', dashboardRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK',
        timestamp: new Date().toISOString(),
        websocket: wss.clients.size,
        env: process.env.NODE_ENV
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Internal Server Error'
    });
});

// Start server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
