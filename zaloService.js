// zaloService.js
import { Zalo, ThreadType } from 'zca-js';
import { PROXIES, getAvailableProxyIndex } from './proxyService.js';
import { setupEventListeners } from './eventListeners.js';
import { HttpsProxyAgent } from "https-proxy-agent";
import nodefetch from "node-fetch";

const zaloAccounts = [];

export async function loginZaloAccount(customProxy) {
    return new Promise(async (resolve, reject) => {
        let agent;
        let proxyUsed = null;
        let useCustomProxy = false;

        // Kiểm tra nếu người dùng nhập proxy
        if (customProxy && customProxy.trim() !== "") {
            try {
                // Sử dụng constructor URL để kiểm tra tính hợp lệ
                new URL(customProxy);
                useCustomProxy = true;
            } catch (err) {
                console.log(`Proxy nhập vào không hợp lệ: ${customProxy}. Sẽ sử dụng proxy mặc định.`);
            }
        }

        if (useCustomProxy) {
            agent = new HttpsProxyAgent(customProxy);
        } else {
            // Chọn proxy tự động từ danh sách nếu không có proxy do người dùng nhập hợp lệ
            const proxyIndex = getAvailableProxyIndex();
            if (proxyIndex === -1) {
                return reject(new Error('Tất cả proxy đều đã đủ tài khoản. Không thể đăng nhập thêm!'));
            }
            proxyUsed = PROXIES[proxyIndex];
            agent = new HttpsProxyAgent(proxyUsed.url);
        }

        const zalo = new Zalo({
            agent: agent,
            // @ts-ignore
            polyfill: nodefetch,
        });

        const api = await zalo.loginQR(null, (qrData) => {
            if (qrData?.data?.image) {
                const qrCodeImage = `data:image/png;base64,${qrData.data.image}`;
                resolve(qrCodeImage);
            } else {
                reject(new Error("Không thể lấy mã QR"));
            }
        });

        setupEventListeners(api);
        api.listener.start();

        // Nếu sử dụng proxy mặc định từ danh sách thì cập nhật usedCount
        if (!useCustomProxy) {
            proxyUsed.usedCount++;
            proxyUsed.accounts.push(api);
        }
        zaloAccounts.push({ api, ownId: api.getOwnId(), proxy: useCustomProxy ? customProxy : (proxyUsed && proxyUsed.url) });
        console.log(`Đã đăng nhập vào tài khoản ${api.getOwnId()} qua proxy ${useCustomProxy ? customProxy : (proxyUsed && proxyUsed.url)}`);
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


export async function createGroup(req, res) {
    try {
        const { members, name, avatarPath, accountIndex = 0 } = req.body;
        // Kiểm tra dữ liệu hợp lệ
        if (!members || !Array.isArray(members) || members.length === 0 || accountIndex < 0 || accountIndex >= zaloAccounts.length) {
            return res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
        }
        // Gọi API createGroup từ zaloAccounts
        const result = await zaloAccounts[accountIndex].api.createGroup({ members, name, avatarPath });
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

export async function getGroupInfo(req, res) {
    try {
        const { groupId, accountIndex = 0 } = req.body;
        // Kiểm tra dữ liệu: groupId phải tồn tại và nếu là mảng thì không rỗng
        if (!groupId || (Array.isArray(groupId) && groupId.length === 0)) {
            return res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
        }
        // Gọi API getGroupInfo từ zaloAccounts
        const result = await zaloAccounts[accountIndex].api.getGroupInfo(groupId);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

export async function addUserToGroup(req, res) {
    try {
        const { groupId, memberId, accountIndex = 0 } = req.body;
        // Kiểm tra dữ liệu hợp lệ: groupId và memberId không được bỏ trống
        if (!groupId || !memberId || (Array.isArray(memberId) && memberId.length === 0)) {
            return res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
        }
        // Gọi API addUserToGroup từ zaloAccounts
        const result = await zaloAccounts[accountIndex].api.addUserToGroup(memberId, groupId);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

export async function removeUserFromGroup(req, res) {
    try {
        const { memberId, groupId, accountIndex = 0 } = req.body;
        // Kiểm tra dữ liệu: groupId và memberId phải được cung cấp, nếu memberId là mảng thì không được rỗng
        if (!groupId || !memberId || (Array.isArray(memberId) && memberId.length === 0)) {
            return res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
        }
        // Gọi API removeUserFromGroup từ zaloAccounts
        const result = await zaloAccounts[accountIndex].api.removeUserFromGroup(memberId, groupId);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Hàm gửi một hình ảnh đến người dùng
export async function sendImageToUser(req, res) {
    try {
        const { imagePath, threadId, accountIndex = 0 } = req.body;
        if (!imagePath || !threadId) {
            return res.status(400).json({ error: 'Dữ liệu không hợp lệ: imagePath và threadId là bắt buộc' });
        }
        const result = await zaloAccounts[accountIndex].api.sendMessage(
            { msg: "", attachments: [imagePath] },
            threadId,
            ThreadType.User
        );
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Hàm gửi nhiều hình ảnh đến người dùng
export async function sendImagesToUser(req, res) {
    try {
        const { imagePaths, threadId, accountIndex = 0 } = req.body;
        if (!imagePaths || !threadId || !Array.isArray(imagePaths) || imagePaths.length === 0) {
            return res.status(400).json({ error: 'Dữ liệu không hợp lệ: imagePaths phải là mảng không rỗng và threadId là bắt buộc' });
        }
        const result = await zaloAccounts[accountIndex].api.sendMessage(
            { msg: "", attachments: imagePaths },
            threadId,
            ThreadType.User
        );
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Hàm gửi một hình ảnh đến nhóm
export async function sendImageToGroup(req, res) {
    try {
        const { imagePath, threadId, accountIndex = 0 } = req.body;
        if (!imagePath || !threadId) {
            return res.status(400).json({ error: 'Dữ liệu không hợp lệ: imagePath và threadId là bắt buộc' });
        }
        const result = await zaloAccounts[accountIndex].api.sendMessage(
            { msg: "", attachments: [imagePath] },
            threadId,
            ThreadType.Group
        );
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Hàm gửi nhiều hình ảnh đến nhóm
export async function sendImagesToGroup(req, res) {
    try {
        const { imagePaths, threadId, accountIndex = 0 } = req.body;
        if (!imagePaths || !threadId || !Array.isArray(imagePaths) || imagePaths.length === 0) {
            return res.status(400).json({ error: 'Dữ liệu không hợp lệ: imagePaths phải là mảng không rỗng và threadId là bắt buộc' });
        }
        const result = await zaloAccounts[accountIndex].api.sendMessage(
            { msg: "", attachments: imagePaths },
            threadId,
            ThreadType.Group
        );
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}