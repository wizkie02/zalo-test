// zaloService.js
import { Zalo, ThreadType } from 'zca-js';
import { PROXIES, getAvailableProxyIndex } from './proxyService.js';
import { triggerN8nWebhook } from './helpers.js';

const zaloAccounts = [];

export async function loginZaloAccount() {
    const proxyIndex = getAvailableProxyIndex();
    if (proxyIndex === -1) {
        throw new Error('Tất cả proxy đều đã đủ tài khoản. Không thể đăng nhập thêm!');
    }

    return new Promise(async (resolve, reject) => {
        const proxy = PROXIES[proxyIndex];
        const zalo = new Zalo();

        const api = await zalo.loginQR(null, (qrData) => {
            if (qrData?.data?.image) {
                const qrCodeImage = `data:image/png;base64,${qrData.data.image}`;
                resolve(qrCodeImage);
            } else {
                reject(new Error("Không thể lấy mã QR"));
            }
        });

        api.listener.on("message", triggerN8nWebhook);
        api.listener.start();

        proxy.usedCount++;
        proxy.accounts.push(api);
        zaloAccounts.push({ api, ownId: api.getOwnId(), proxyIndex });

        console.log(`Đã đăng nhập vào tài khoản ${api.getOwnId()} qua proxy ${proxy.url}`);
    });
}

// Các API khác giữ nguyên
export async function findUser(req, res) {
    try {
        const { phone, accountIndex = 0 } = req.body;
        if (!phone || accountIndex < 0 || accountIndex >= zaloAccounts.length) {
            return res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
        }
        const userData = await zaloAccounts[accountIndex].api.findUser(phone);
        res.json({ success: true, data: userData });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

export async function getUserInfo(req, res) {
    try {
        const { userId, accountIndex = 0 } = req.body;
        if (!userId || accountIndex < 0 || accountIndex >= zaloAccounts.length) {
            return res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
        }
        const info = await zaloAccounts[accountIndex].api.getUserInfo(userId);
        res.json({ success: true, data: info });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

export async function sendFriendRequest(req, res) {
    try {
        const { userId, accountIndex = 0 } = req.body;
        if (!userId || accountIndex < 0 || accountIndex >= zaloAccounts.length) {
            return res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
        }
        const result = await zaloAccounts[accountIndex].api.sendFriendRequest('Xin chào, hãy kết bạn với tôi!', userId);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

export async function sendMessage(req, res) {
    try {
        const { message, threadId, type, accountIndex = 0 } = req.body;
        if (!message || !threadId || accountIndex < 0 || accountIndex >= zaloAccounts.length) {
            return res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
        }
        const msgType = type || ThreadType.User;
        const result = await zaloAccounts[accountIndex].api.sendMessage(message, threadId, msgType);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}
