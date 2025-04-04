import { GroupEventType } from "zca-js";
import { getWebhookUrl, triggerN8nWebhook } from './helpers.js';
import fs from 'fs';
import { loginZaloAccount, zaloAccounts } from './api/zalo/zalo.js';

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
        
        // Xử lý như đăng xuất khi API listener bị đóng
        handleDisconnect(api);
    });
    
    api.listener.onError((error) => {
        console.error("Error:", error);
    });
}

// Hàm xử lý ngắt kết nối - coi như đăng xuất tài khoản
function handleDisconnect(api) {
    try {
        // Lấy ownId của tài khoản bị ngắt kết nối
        const ownId = api.getOwnId();
        
        if (!ownId) {
            console.error("Không thể xác định ownId của tài khoản bị ngắt kết nối");
            return;
        }
        
        console.log(`Tài khoản ${ownId} đã bị ngắt kết nối, tiến hành đăng xuất...`);
        
        // Tìm index của tài khoản trong mảng
        const accountIndex = zaloAccounts.findIndex(acc => acc.ownId === ownId);
        
        if (accountIndex !== -1) {
            // Xóa tài khoản khỏi mảng
            zaloAccounts.splice(accountIndex, 1);
            console.log(`Đã đăng xuất tài khoản ${ownId} do mất kết nối`);
        } else {
            console.log(`Không tìm thấy tài khoản ${ownId} trong danh sách`);
        }
    } catch (error) {
        console.error("Lỗi khi xử lý ngắt kết nối:", error);
    }
}
