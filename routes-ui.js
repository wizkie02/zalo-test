import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { zaloAccounts, loginZaloAccount } from './api/zalo/zalo.js';
import { proxyService } from './proxyService.js';

const router = express.Router();

// Dành cho ES Module: xác định __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.join(__dirname, 'webhook-config.json');

router.get('/', (req, res) => {
    res.send(`
  <!DOCTYPE html>
  <html lang="vi">
  <head>
    <meta charset="UTF-8">
    <title>Zalo server</title>
  </head>
  <body>
    <h1>Zalo server - Đăng nhập qua QR Code với Proxy</h1>
    <p><strong>(Mỗi Proxy tối đa 3 tài khoản)</strong></p>
    
    <h2>CÁCH CÀI GIỚI HẠN GỬI NGƯỜI LẠ ZALO:</h2>
    <ul>
      <li><strong>Thời gian nghỉ</strong> giữa 2 lần gửi tin nhắn (dòng 1): <em>60 - 150 giây</em></li>
      <li><strong>Giới hạn gửi tin nhắn</strong> trong ngày (dòng 2):
        <ul>
          <li>TK Zalo lâu năm, trên 1 năm, chưa từng bị hạn chế: Chỉnh <strong>30</strong> (sau đó tăng dần, mỗi 3 ngày, tăng +20, tối đa 150).</li>
          <li>TK Zalo mới tạo: Chỉ nên <strong>10 - 30</strong> tin nhắn / nick.</li>
        </ul>
      </li>
      <li><strong>Giới hạn lượt tìm số điện thoại</strong> trong 1 tiếng:
        <ul>
          <li>TK cá nhân: 15 tin nhắn trong 60 phút.</li>
          <li>TK business: 30 tin nhắn trong 60 phút.</li>
        </ul>
      </li>
      <li><strong>Khi chạy kết bạn</strong>: 
        <ul>
          <li>Không nên vượt quá <strong>30 - 35 người/ngày</strong> với tài khoản cá nhân.</li>
          <li>Nếu đang chạy gửi tin nhắn nhiều, nên tách riêng quá trình kết bạn để tránh giới hạn.</li>
        </ul>
      </li>
    </ul>
  </body>
  </html>
    `);
  });
  

// Hiển thị form đăng nhập
router.get('/zalo-login', (req, res) => {
    const loginFile = path.join(__dirname, 'login.html');
    fs.readFile(loginFile, 'utf8', (err, data) => {
      if (err) {
        console.error('Lỗi khi đọc file login.html:', err);
        return res.status(500).send('Không thể tải trang đăng nhập.');
      }
      res.send(data);
    });
});

// Hiển thị trang dashboard
router.get('/dashboard', (req, res) => {
    const dashboardFile = path.join(__dirname, 'dashboard.html');
    fs.readFile(dashboardFile, 'utf8', (err, data) => {
      if (err) {
        console.error('Lỗi khi đọc file dashboard.html:', err);
        return res.status(500).send('Không thể tải trang dashboard.');
      }
      res.send(data);
    });
});

// Xử lý đăng nhập: sử dụng proxy do người dùng nhập nếu hợp lệ, nếu không sẽ sử dụng proxy mặc định
let loginResolve;
router.post('/zalo-login', async (req, res) => {
    try {
        const { proxy } = req.body;
        const qrCodeImage = await loginZaloAccount(proxy, null);
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
    }));
    

    // Tạo bảng HTML
    let html = '<table border="1">';
    html += '<thead><tr>';
    const headers = ['Own ID', 'Phone Number', 'Proxy'];
    headers.forEach(header => {
        html += `<th>${header}</th>`;
    });
    html += '</tr></thead><tbody>';
    accounts.forEach((account) => {
        html += '<tr>';
        html += `<td>${account.ownId}</td>`;
        html += `<td>${account.phoneNumber || 'N/A'}</td>`;
        html += `<td>${account.proxy}</td>`;
        html += '</tr>';
    });
    html += '</tbody></table>';
    

    res.send(html);
});

// API endpoints for dashboard
// Get all accounts as JSON for dashboard
router.get('/api/accounts', (req, res) => {
    if (zaloAccounts.length === 0) {
        return res.json({ success: true, accounts: [] });
    }
    
    const accounts = zaloAccounts.map(account => ({
        ownId: account.ownId,
        phoneNumber: account.phoneNumber || 'N/A',
        proxy: account.proxy
    }));
    
    res.json({ success: true, accounts: accounts });
});

// Get single account details
router.get('/api/account/:ownId', (req, res) => {
    const ownId = req.params.ownId;
    const account = zaloAccounts.find(acc => acc.ownId === ownId);
    
    if (account) {
        res.json({ 
            success: true, 
            account: {
                ownId: account.ownId,
                phoneNumber: account.phoneNumber || 'N/A',
                proxy: account.proxy
            }
        });
    } else {
        res.status(404).json({ success: false, error: 'Account not found' });
    }
});

// Logout endpoint
router.post('/logout', (req, res) => {
    // Currently just returns success
    // In a real implementation, you would handle actual logout logic
    res.json({ success: true, message: 'Logged out successfully' });
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

// Serve static files from public directory
router.use(express.static(path.join(__dirname, 'public')));

export default router;