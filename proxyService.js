// proxyService.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const proxiesFilePath = path.join(__dirname, 'proxies.json');

let RAW_PROXIES = [];
try {
    const data = fs.readFileSync(proxiesFilePath, 'utf8');
    RAW_PROXIES = JSON.parse(data);
} catch (err) {
    console.error('Không thể đọc file proxies.json:', err);
    RAW_PROXIES = [];
}

const MAX_ACCOUNTS_PER_PROXY = 3;
const PROXIES = RAW_PROXIES.map(p => ({ url: p, usedCount: 0, accounts: [] }));

// Lấy proxy có thể sử dụng (chưa vượt quá số tài khoản cho phép)
function getAvailableProxyIndex() {
    for (let i = 0; i < PROXIES.length; i++) {
        if (PROXIES[i].usedCount < MAX_ACCOUNTS_PER_PROXY) {
            return i;
        }
    }
    return -1; // Không còn proxy trống
}

// Hàm thêm proxy mới
function addProxy(proxyUrl) {
    const newProxy = { url: proxyUrl, usedCount: 0, accounts: [] };
    PROXIES.push(newProxy);
    RAW_PROXIES.push(proxyUrl);
    fs.writeFileSync(proxiesFilePath, JSON.stringify(RAW_PROXIES, null, 2));
    return newProxy;
}

// Hàm xóa proxy
function removeProxy(proxyUrl) {
    const index = PROXIES.findIndex(p => p.url === proxyUrl);
    if (index === -1) {
        throw new Error('Không tìm thấy proxy');
    }
    PROXIES.splice(index, 1);
    const rawIndex = RAW_PROXIES.indexOf(proxyUrl);
    if (rawIndex !== -1) {
        RAW_PROXIES.splice(rawIndex, 1);
    }
    fs.writeFileSync(proxiesFilePath, JSON.stringify(RAW_PROXIES, null, 2));
    return true;
}

export { PROXIES, getAvailableProxyIndex, addProxy, removeProxy };
