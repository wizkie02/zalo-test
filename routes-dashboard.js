import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Serve dashboard page
router.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/dashboard.html'));
});

export default router;