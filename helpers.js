// helpers.js
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.join(__dirname, 'webhook-config.json');

export function getWebhookUrl(key) {
    try {
        if (fs.existsSync(configPath)) {
            const content = fs.readFileSync(configPath, 'utf8');
            const config = JSON.parse(content);
            return config[key] || "";
        } else {
            return "";
        }
    } catch (error) {
        console.error("Error reading webhook config:", error);
        return "";
    }
}

export async function triggerN8nWebhook(msg, webhookUrl) {
    const url = webhookUrl;
    try {
        await axios.post(url, msg, { headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        console.error("Error sending request:", error);
    }
}
