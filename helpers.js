// helpers.js
import axios from 'axios';

export async function axiosFetch(url, options = {}) {
    const { method = 'GET', headers, body } = options;
    try {
        const response = await axios({ url, method, headers, data: body, validateStatus: () => true });
        return {
            ok: response.status >= 200 && response.status < 300,
            status: response.status,
            json: async () => response.data,
            text: async () => JSON.stringify(response.data),
            headers: {
                get: (name) => response.headers[name.toLowerCase()] || null,
            },
        };
    } catch (error) {
        throw new Error(`Axios Fetch Error: ${error.message}`);
    }
}

export async function triggerN8nWebhook(msg) {
    const url = "https://n8n.dieucanbiet.org/webhook/zalo-api";
    try {
        await axios.post(url, { message: msg }, { headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        console.error("Error sending request:", error);
    }
}