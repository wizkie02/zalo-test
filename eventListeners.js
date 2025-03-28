import { GroupEventType } from "zca-js";
import { getWebhookUrl, triggerN8nWebhook } from './helpers.js';
import fs from 'fs';
import { loginZaloAccount, zaloAccounts } from './api/zalo/zalo.js';

// Biến để theo dõi thời gian relogin cho từng tài khoản
export const reloginAttempts = new Map();
// Thời gian tối thiểu giữa các lần thử relogin (5 phút)
const RELOGIN_COOLDOWN = 5 * 60 * 1000;

export function setupEventListeners(api, loginResolve) {
    // Lắng nghe sự kiện tin nhắn và gửi đến webhook được cấu hình cho tin nhắn
    api.listener.on("message", (msg) => {
        const messageWebhookUrl = getWebhookUrl("messageWebhookUrl");
        if (messageWebhookUrl) {
            triggerN8nWebhook(msg, messageWebhookUrl);
        }
    });

    // Lắng nghe sự kiện nhóm và gửi đến webhook được cấu hình cho sự kiện nhóm
    api.listener.on("group_event", (data) => {
        const groupEventWebhookUrl = getWebhookUrl("groupEventWebhookUrl");
        if (groupEventWebhookUrl) {
            triggerN8nWebhook(data, groupEventWebhookUrl);
        }
    });

    // Lắng nghe sự kiện reaction và gửi đến webhook được cấu hình cho reaction
    api.listener.on("reaction", (reaction) => {
        const reactionWebhookUrl = getWebhookUrl("reactionWebhookUrl");
        console.log("Nhận reaction:", reaction);
        if (reactionWebhookUrl) {
            triggerN8nWebhook(reaction, reactionWebhookUrl);
        }
    });

    api.listener.onConnected(() => {
        console.log("Connected");
        loginResolve('login_success');
    });
    
    api.listener.onClosed(() => {
        console.log("Closed - API listener đã ngắt kết nối");
        
        // Xử lý đăng nhập lại khi API listener bị đóng
        handleRelogin(api);
    });
    
    api.listener.onError((error) => {
        console.error("Error:", error);
    });
}

// Hàm xử lý đăng nhập lại
async function handleRelogin(api) {
    try {
        console.log("Đang thử đăng nhập lại...");
        
        // Lấy ownId của tài khoản bị ngắt kết nối
        const ownId = api.getOwnId();
        
        if (!ownId) {
            console.error("Không thể xác định ownId, không thể đăng nhập lại");
            return;
        }
        
        // Kiểm tra thời gian relogin gần nhất
        const lastReloginTime = reloginAttempts.get(ownId);
        const now = Date.now();
        
        if (lastReloginTime && now - lastReloginTime < RELOGIN_COOLDOWN) {
            console.log(`Bỏ qua việc đăng nhập lại tài khoản ${ownId}, đã thử cách đây ${Math.floor((now - lastReloginTime) / 1000)} giây`);
            return;
        }
        
        // Cập nhật thời gian relogin
        reloginAttempts.set(ownId, now);
        
        // Tìm thông tin proxy từ mảng zaloAccounts
        const accountInfo = zaloAccounts.find(acc => acc.ownId === ownId);
        const customProxy = accountInfo?.proxy || null;
        
        // Tìm file cookie tương ứng
        const cookiesDir = './cookies';
        const cookieFile = `${cookiesDir}/cred_${ownId}.json`;
        
        if (!fs.existsSync(cookieFile)) {
            console.error(`Không tìm thấy file cookie cho tài khoản ${ownId}`);
            return;
        }
        
        // Đọc cookie từ file
        const cookie = JSON.parse(fs.readFileSync(cookieFile, "utf-8"));
        
        // Đăng nhập lại với cookie
        console.log(`Đang đăng nhập lại tài khoản ${ownId} với proxy ${customProxy || 'không có'}...`);
        
        // Thực hiện đăng nhập lại
        await loginZaloAccount(customProxy, cookie);
        console.log(`Đã đăng nhập lại thành công tài khoản ${ownId}`);
    } catch (error) {
        console.error("Lỗi khi thử đăng nhập lại:", error);
    }
}
