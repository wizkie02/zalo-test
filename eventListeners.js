import { GroupEventType } from "zca-js";
import { getWebhookUrl, triggerN8nWebhook } from './helpers.js';

export function setupEventListeners(api, loginResolve) {
    // Lắng nghe sự kiện tin nhắn và gửi đến webhook được cấu hình cho tin nhắn
    api.listener.on("message", (msg) => {
        const messageWebhookUrl = getWebhookUrl("messageWebhookUrl");
        triggerN8nWebhook(msg, messageWebhookUrl);
    });

    // Lắng nghe sự kiện nhóm và gửi đến webhook được cấu hình cho sự kiện nhóm
    api.listener.on("group_event", (data) => {
        const groupEventWebhookUrl = getWebhookUrl("groupEventWebhookUrl");        
        triggerN8nWebhook(data, groupEventWebhookUrl);
    });

    // Lắng nghe sự kiện reaction và gửi đến webhook được cấu hình cho reaction
    api.listener.on("reaction", (reaction) => {
        const reactionWebhookUrl = getWebhookUrl("reactionWebhookUrl");
        console.log("Nhận reaction:", reaction);
        triggerN8nWebhook(reaction, reactionWebhookUrl);
    });

    api.listener.onConnected(() => {
        console.log("Connected");
        loginResolve('login_success');
    });
    
    api.listener.onClosed(() => {
        console.log("Closed");
    });
    
    api.listener.onError((error) => {
        console.error("Error:", error);
    });
}
