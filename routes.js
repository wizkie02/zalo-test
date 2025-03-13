// routes.js
import express from 'express';
import { findUser, getUserInfo, sendFriendRequest, sendMessage, loginZaloAccount } from './zaloService.js';

const router = express.Router();

router.get('/', (req, res) => {
    res.send('Demo chạy Express - Đăng nhập qua QR Code với Proxy (Mỗi Proxy tối đa 3 tài khoản)');
});

router.get('/login', async (req, res) => {
    try {
        const qrCodeImage = await loginZaloAccount();
        res.send(`<html><body><h2>Quét mã QR để đăng nhập</h2><img src="${qrCodeImage}" alt="QR Code"/></body></html>`);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Giữ nguyên API cũ
router.post('/findUser', findUser);
router.post('/getUserInfo', getUserInfo);
router.post('/sendFriendRequest', sendFriendRequest);
router.post('/sendmessage', sendMessage);

export default router;
