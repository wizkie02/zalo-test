import { GroupEventType } from "zca-js";
import { getWebhookUrl, triggerN8nWebhook } from './helpers.js';

export function setupEventListeners(api) {
    // Lắng nghe sự kiện tin nhắn và gửi đến webhook được cấu hình cho tin nhắn
    api.listener.on("message", (msg) => {
        const messageWebhookUrl = getWebhookUrl("messageWebhookUrl");
        console.log(messageWebhookUrl);
        console.log(msg);
        triggerN8nWebhook(msg, messageWebhookUrl);
    });

    // Lắng nghe sự kiện nhóm và gửi đến webhook được cấu hình cho sự kiện nhóm
    api.listener.on("group_event", (data) => {
        const groupEventWebhookUrl = getWebhookUrl("groupEventWebhookUrl");
        if (data.type === GroupEventType.JOIN_REQUEST) {
            console.log("Nhận yêu cầu tham gia nhóm:", data);
            // Xử lý riêng nếu cần
        } else {
            console.log("Nhận sự kiện nhóm khác:", data);
            // Xử lý các sự kiện nhóm khác nếu cần
        }
        triggerN8nWebhook(data, groupEventWebhookUrl);
    });

    // Lắng nghe sự kiện reaction và gửi đến webhook được cấu hình cho reaction
    api.listener.on("reaction", (reaction) => {
        const reactionWebhookUrl = getWebhookUrl("reactionWebhookUrl");
        console.log("Nhận reaction:", reaction);
        triggerN8nWebhook(reaction, reactionWebhookUrl);
    });
}
