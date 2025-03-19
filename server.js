// server.js
import express from 'express';
import routes from './routes.js';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3000;

let webhookConfig = {};

// Function to load webhook config
function loadWebhookConfig() {
    const messageWebhookUrl = process.env.MESSAGE_WEBHOOK_URL;
    const groupEventWebhookUrl = process.env.GROUP_EVENT_WEBHOOK_URL;
    const reactionWebhookUrl = process.env.REACTION_WEBHOOK_URL;

    if (messageWebhookUrl && groupEventWebhookUrl && reactionWebhookUrl) {
        // Environment variables are set, use them
        webhookConfig = {
            messageWebhookUrl: messageWebhookUrl,
            groupEventWebhookUrl: groupEventWebhookUrl,
            reactionWebhookUrl: reactionWebhookUrl,
        };
    } else {
        // Environment variables are not set, try to load from file
        const configFilePath = './webhook-config.json'; // Path inside the container
        try {
            const rawData = fs.readFileSync(configFilePath);
            webhookConfig = JSON.parse(rawData);
        } catch (error) {
            console.error('Error loading webhook config from file:', error);
            // Handle the error appropriately (e.g., exit the application, use default values)
            process.exit(1); // Example: Exit the application if config is essential
        }
    }
}

// Load the config when the application starts
loadWebhookConfig();

// Now you can use webhookConfig.messageWebhookUrl, webhookConfig.groupEventWebhookUrl, and webhookConfig.reactionWebhookUrl
console.log("Message Webhook URL:", webhookConfig.messageWebhookUrl);
console.log("Group Event Webhook URL:", webhookConfig.groupEventWebhookUrl);
console.log("Reaction Webhook URL:", webhookConfig.reactionWebhookUrl);


app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Dùng để parse dữ liệu form

app.use('/', routes);

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
