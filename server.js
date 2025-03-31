import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import { WebSocket, WebSocketServer } from 'ws';
import {
    zaloAccounts,
    loginZaloAccount,
    initializeWebSocket
} from './api/zalo/zalo.js';
import apiRoutes from './routes-api.js';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', (path, options, callback) => {
    fs.readFile(path, 'utf-8', callback);
});

// Routes
app.get('/', (req, res) => {
    res.redirect('/zalo-login');
});

app.get('/zalo-login', (req, res) => {
    const loginFile = path.join(__dirname, 'views', 'login.html');
    fs.readFile(loginFile, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading login.html:', err);
            return res.status(500).send('Unable to load login page.');
        }
        res.send(data);
    });
});

app.get('/dashboard', (req, res) => {
    const dashboardFile = path.join(__dirname, 'views', 'dashboard.html');
    fs.readFile(dashboardFile, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading dashboard.html:', err);
            return res.status(500).send('Unable to load dashboard.');
        }
        res.send(data);
    });
});

// API Routes with versioning
app.use('/api/v1', apiRoutes);

// Account management routes
app.get('/accounts', (req, res) => {
    try {
        let accountsHtml = '<table class="table"><thead><tr><th>ID</th><th>Display Name</th><th>Phone Number</th><th>Proxy</th></tr></thead><tbody>';
        
        zaloAccounts.forEach(account => {
            accountsHtml += `<tr>
                <td>${account.ownId}</td>
                <td>${account.displayName || 'N/A'}</td>
                <td>${account.phoneNumber || 'N/A'}</td>
                <td>${account.proxy || 'No proxy'}</td>
            </tr>`;
        });
        
        accountsHtml += '</tbody></table>';
        res.send(accountsHtml);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Login endpoint
app.post('/zalo-login', async (req, res) => {
    try {
        const { proxy } = req.body;
        const qrCodeImage = await loginZaloAccount(proxy);
        res.send(qrCodeImage);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK',
        timestamp: new Date().toISOString(),
        accounts: zaloAccounts.length
    });
});

// Keep-alive endpoint
app.get('/ping', (req, res) => {
    res.json({ 
        status: 'active',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
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

// Create server
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// WebSocket setup
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    initializeWebSocket(ws);

    ws.on('message', (message) => {
        console.log('Received:', message);
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// Load existing cookies and restore sessions
const cookiesDir = path.join(__dirname, 'cookies');
if (fs.existsSync(cookiesDir)) {
    const cookieFiles = fs.readdirSync(cookiesDir);
    cookieFiles.forEach(file => {
        if (file.startsWith('cred_') && file.endsWith('.json')) {
            const ownId = file.substring(5, file.length - 5);
            try {
                const cookieData = JSON.parse(fs.readFileSync(path.join(cookiesDir, file), 'utf8'));
                loginZaloAccount(null, cookieData);
                console.log(`Restored session for account ${ownId}`);
            } catch (error) {
                console.error(`Failed to restore session for account ${ownId}:`, error);
            }
        }
    });
}

// Create required directories if they don't exist
const dirs = ['cookies', 'public', 'zalo_data'];
dirs.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`Created directory: ${dir}`);
    }
});
