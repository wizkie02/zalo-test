// routes.js
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import WebSocket from 'ws';
import { 
    findUser, 
    getUserInfo, 
    sendFriendRequest, 
    sendMessage, 
    loginZaloAccount, 
    createGroup, 
    getGroupInfo, 
    addUserToGroup, 
    removeUserFromGroup,
    sendImageToUser,
    sendImagesToUser,
    sendImageToGroup,
    sendImagesToGroup
} from './zaloService.js';
import { zaloAccounts } from './api/zalo/zalo.js';
import { proxyService } from './proxyService.js';

const router = express.Router();
// Dành cho ES Module: xác định __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.join(__dirname, 'webhook-config.json');

router.get('/', (req, res) => {
    res.send('Demo chạy Express - Đăng nhập qua QR Code với Proxy (Mỗi Proxy tối đa 3 tài khoản)');
});

// Trang nhập proxy và hiển thị form để đăng nhập qua QR code
router.get('/login', (req, res) => {
    const loginFile = path.join(__dirname, 'login.html');
    fs.readFile(loginFile, 'utf8', (err, data) => {
      if (err) {
        console.error('Lỗi khi đọc file login.html:', err);
        return res.status(500).send('Không thể tải trang đăng nhập.');
      }
      res.send(data);
    });
});

// Xử lý đăng nhập: sử dụng proxy do người dùng nhập nếu hợp lệ, nếu không sẽ sử dụng proxy mặc định
let loginResolve;
router.post('/login', async (req, res) => {
    try {
        const { proxy } = req.body;
        const qrCodeImage = await loginZaloAccount(proxy);
        res.send(`
            <html>
               <head>
                  <meta charset="UTF-8">
                  <meta charset="UTF-8">
                  <title>Quét mã QR</title>
               </head>
               <body>
                  <h2>Quét mã QR để đăng nhập</h2>
                  <img src="${qrCodeImage}" alt="QR Code"/>
                  <script>
                      const socket = new WebSocket('ws://localhost:3000');
                      socket.onmessage = function(event) {
                            console.log(event.data)
                          if (event.data === 'login_success') {
                              document.body.innerHTML = \`
                                  <h2>Đăng nhập thành công!</h2>
                                  <p style='color: green;'><b>Đăng nhập thành công!</b></p>
                              \`;
                          }
                      };
                  </script>
               </body>
            </html>
         `);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Giữ nguyên API cũ
router.post('/findUser', findUser);
router.post('/getUserInfo', getUserInfo);
router.post('/sendFriendRequest', sendFriendRequest);
router.post('/sendmessage', sendMessage);
router.post('/createGroup', createGroup);
router.post('/getGroupInfo', getGroupInfo);
router.post('/addUserToGroup', addUserToGroup);
router.post('/removeUserFromGroup', removeUserFromGroup);
router.post('/sendImageToUser', sendImageToUser);
router.post('/sendImagesToUser', sendImagesToUser);
router.post('/sendImageToGroup', sendImageToGroup);
router.post('/sendImagesToGroup', sendImagesToGroup);


// Hiển thị form cập nhật webhook URL
router.get('/updateWebhookForm', (req, res) => {
    const docFile = path.join(__dirname, 'updateWebhookForm.html');
    fs.readFile(docFile, 'utf8', (err, data) => {
      if (err) {
        console.error('Lỗi khi đọc file tài liệu:', err);
        return res.status(500).send('Không thể tải tài liệu API.');
      }
      res.send(data);
    });
  });
  
// Endpoint cập nhật 3 webhook URL
router.post('/updateWebhook', (req, res) => {
    const { messageWebhookUrl, groupEventWebhookUrl, reactionWebhookUrl } = req.body;
    // Kiểm tra tính hợp lệ của từng URL
    if (!messageWebhookUrl || !messageWebhookUrl.startsWith("http")) {
        return res.status(400).json({ success: false, error: 'messageWebhookUrl không hợp lệ' });
    }
    if (!groupEventWebhookUrl || !groupEventWebhookUrl.startsWith("http")) {
        return res.status(400).json({ success: false, error: 'groupEventWebhookUrl không hợp lệ' });
    }
    if (!reactionWebhookUrl || !reactionWebhookUrl.startsWith("http")) {
        return res.status(400).json({ success: false, error: 'reactionWebhookUrl không hợp lệ' });
    }
    const config = { messageWebhookUrl, groupEventWebhookUrl, reactionWebhookUrl };
    fs.writeFile(configPath, JSON.stringify(config, null, 2), err => {
        if (err) {
            console.error("Lỗi khi ghi file cấu hình:", err);
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, message: 'Webhook URLs đã được cập nhật' });
    });
});

// API quản lý proxy
// Lấy danh sách proxy hiện có
router.get('/proxies', (req, res) => {
    res.json({ success: true, data: proxyService.getPROXIES() });
});

// Thêm một proxy mới
router.post('/proxies', (req, res) => {
    const { proxyUrl } = req.body;
    if (!proxyUrl) {
        return res.status(400).json({ success: false, error: 'proxyUrl không hợp lệ' });
    }
    try {
        const newProxy = proxyService.addProxy(proxyUrl);
        res.json({ success: true, data: newProxy });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Xóa một proxy
router.delete('/proxies', (req, res) => {
    const { proxyUrl } = req.body;
    if (!proxyUrl) {
        return res.status(400).json({ success: false, error: 'proxyUrl không hợp lệ' });
    }
    try {
        proxyService.removeProxy(proxyUrl);
        res.json({ success: true, message: 'Xóa proxy thành công' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Endpoint hiển thị tài liệu API (đọc file api-doc.html)
router.get('/list', (req, res) => {
    const docFile = path.join(__dirname, 'api-doc.html');
    fs.readFile(docFile, 'utf8', (err, data) => {
      if (err) {
        console.error('Lỗi khi đọc file tài liệu:', err);
        return res.status(500).send('Không thể tải tài liệu API.');
      }
      res.send(data);
    });
  });

// Lấy danh sách tài khoản đã đăng nhập
router.get('/accounts', (req, res) => {
    if (zaloAccounts.length === 0) {
        return res.json({ success: true, message: 'Chưa có tài khoản nào đăng nhập' });
    }
    const accounts = zaloAccounts.map(account => ({
        ownId: account.ownId,
        proxy: account.proxy,
        phoneNumber: account.phoneNumber || 'N/A',
        accountIndex: zaloAccounts.indexOf(account)
    }));

    // Tạo bảng HTML
    let html = '<table border="1">';
    html += '<thead><tr>';
    const headers = ['Index', 'Own ID', 'Phone Number', 'Proxy'];
    headers.forEach(header => {
        html += `<th>${header}</th>`;
    });
    html += '</tr></thead><tbody>';
    accounts.forEach((account, index) => {
        html += '<tr>';
        html += `<td>${index}</td>`;
        html += `<td>${account.ownId}</td>`;
        html += `<td>${account.phoneNumber || 'N/A'}</td>`;
        html += `<td>${account.proxy}</td>`;
        html += '</tr>';
    });
    html += '</tbody></table>';

    res.send(html);
});

export default router;
