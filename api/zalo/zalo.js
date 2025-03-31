// api/zalo/zalo.js
import { Zalo, ThreadType } from 'zca-js';
import { proxyService } from '../../proxyService.js';
import { setupEventListeners } from '../../eventListeners.js';
import { HttpsProxyAgent } from "https-proxy-agent";
import nodefetch from "node-fetch";
import fs from 'fs';

export const zaloAccounts = [];

export async function findUser(req, res) {
    try {
        const { phone, ownId } = req.body;
        if (!phone || !ownId) {
            return res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
        }
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) {
            return res.status(400).json({ error: 'Không tìm thấy tài khoản Zalo với OwnId này' });
        }
        const userData = await account.api.findUser(phone);
        res.json({ success: true, data: userData });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

export async function getUserInfo(req, res) {
    try {
        const { userId, ownId } = req.body;
        if (!userId || !ownId) {
            return res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
        }
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) {
            return res.status(400).json({ error: 'Không tìm thấy tài khoản Zalo với OwnId này' });
        }
        const info = await account.api.getUserInfo(userId);
        res.json({ success: true, data: info });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

export async function sendFriendRequest(req, res) {
    try {
        const { userId, ownId } = req.body;
        if (!userId || !ownId) {
            return res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
        }
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) {
            return res.status(400).json({ error: 'Không tìm thấy tài khoản Zalo với OwnId này' });
        }
        const result = await account.api.sendFriendRequest('Xin chào, hãy kết bạn với tôi!', userId);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

export async function sendMessage(req, res) {
    try {
        const { message, threadId, type, ownId } = req.body;
        if (!message || !threadId || !ownId) {
            return res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
        }
        console.log("Message: ", message);
        console.log("ThreadId: ", threadId);
        console.log("Type: ", type);
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) {
            return res.status(400).json({ error: 'Không tìm thấy tài khoản Zalo với OwnId này' });
        }
        const msgType = type || ThreadType.User;
        const result = await account.api.sendMessage(message, threadId, msgType);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

export async function createGroup(req, res) {
    try {
        const { members, name, avatarPath, ownId } = req.body;
        // Kiểm tra dữ liệu hợp lệ
        if (!members || !Array.isArray(members) || members.length === 0 || !ownId) {
            return res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
        }
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) {
            return res.status(400).json({ error: 'Không tìm thấy tài khoản Zalo với OwnId này' });
        }
        // Gọi API createGroup từ zaloAccounts
        const result = await account.api.createGroup({ members, name, avatarPath });
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

export async function getGroupInfo(req, res) {
    try {
        const { groupId, ownId } = req.body;
        // Kiểm tra dữ liệu: groupId phải tồn tại và nếu là mảng thì không rỗng
        if (!groupId || (Array.isArray(groupId) && groupId.length === 0)) {
            return res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
        }
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) {
            return res.status(400).json({ error: 'Không tìm thấy tài khoản Zalo với OwnId này' });
        }
        // Gọi API getGroupInfo từ zaloAccounts
        const result = await account.api.getGroupInfo(groupId);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

export async function addUserToGroup(req, res) {
    try {
        const { groupId, memberId, ownId } = req.body;
        // Kiểm tra dữ liệu hợp lệ: groupId và memberId không được bỏ trống
        if (!groupId || !memberId || (Array.isArray(memberId) && memberId.length === 0)) {
            return res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
        }
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) {
            return res.status(400).json({ error: 'Không tìm thấy tài khoản Zalo với OwnId này' });
        }
        // Gọi API addUserToGroup từ zaloAccounts
        const result = await account.api.addUserToGroup(memberId, groupId);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

export async function removeUserFromGroup(req, res) {
    try {
        const { memberId, groupId, ownId } = req.body;
        // Kiểm tra dữ liệu: groupId và memberId phải được cung cấp, nếu memberId là mảng thì không được rỗng
        if (!groupId || !memberId || (Array.isArray(memberId) && memberId.length === 0)) {
            return res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
        }
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) {
            return res.status(400).json({ error: 'Không tìm thấy tài khoản Zalo với OwnId này' });
        }
        // Gọi API removeUserFromGroup từ zaloAccounts
        const result = await account.api.removeUserFromGroup(memberId, groupId);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Hàm gửi một hình ảnh đến người dùng
export async function sendImageToUser(req, res) {
    try {
        const { imagePath: imageUrl, threadId, ownId } = req.body;
        if (!imageUrl || !threadId || !ownId) {
            return res.status(400).json({ error: 'Dữ liệu không hợp lệ: imagePath và threadId là bắt buộc' });
        }

       
        const imagePath = await saveImage(imageUrl);
        if (!imagePath) return res.status(500).json({ success: false, error: 'Failed to save image' });

        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) {
            return res.status(400).json({ error: 'Không tìm thấy tài khoản Zalo với OwnId này' });
        }

        const result = await account.api.sendMessage(
            {
                msg: "",
                attachments: [imagePath]
            },
            threadId,
            ThreadType.User
        ).catch(console.error);

        removeImage(imagePath);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Hàm gửi nhiều hình ảnh đến người dùng
export async function sendImagesToUser(req, res) {
    try {
        const { imagePaths: imageUrls, threadId, ownId } = req.body;
        if (!imageUrls || !threadId || !ownId || !Array.isArray(imageUrls) || imageUrls.length === 0) {
            return res.status(400).json({ error: 'Dữ liệu không hợp lệ: imagePaths phải là mảng không rỗng và threadId là bắt buộc' });
        }

      
        const imagePaths = [];
        for (const imageUrl of imageUrls) {
            const imagePath = await saveImage(imageUrl);
            if (!imagePath) {
                // Clean up any saved images
                for (const path of imagePaths) {
                    removeImage(path);
                }
                return res.status(500).json({ success: false, error: 'Failed to save one or more images' });
            }
            imagePaths.push(imagePath);
        }

        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) {
            return res.status(400).json({ error: 'Không tìm thấy tài khoản Zalo với OwnId này' });
        }

        const result = await account.api.sendMessage(
            {
                msg: "",
                attachments: imagePaths
            },
            threadId,
            ThreadType.User
        ).catch(console.error);

        for (const imagePath of imagePaths) {
            removeImage(imagePath);
        }
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Hàm gửi một hình ảnh đến nhóm
export async function sendImageToGroup(req, res) {
    try {
        const { imagePath: imageUrl, threadId, ownId } = req.body;
        if (!imageUrl || !threadId || !ownId) {
            return res.status(400).json({ error: 'Dữ liệu không hợp lệ: imagePath và threadId là bắt buộc' });
        }

       
        const imagePath = await saveImage(imageUrl);
        if (!imagePath) return res.status(500).json({ success: false, error: 'Failed to save image' });

        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) {
            return res.status(400).json({ error: 'Không tìm thấy tài khoản Zalo với OwnId này' });
        }

        const result = await account.api.sendMessage(
            {
                msg: "",
                attachments: [imagePath]
            },
            threadId,
            ThreadType.Group
        ).catch(console.error);

        removeImage(imagePath);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Hàm gửi nhiều hình ảnh đến nhóm
export async function sendImagesToGroup(req, res) {
    try {
        const { imagePaths: imageUrls, threadId, ownId } = req.body;
        if (!imageUrls || !threadId || !ownId || !Array.isArray(imageUrls) || imageUrls.length === 0) {
            return res.status(400).json({ error: 'Dữ liệu không hợp lệ: imagePaths phải là mảng không rỗng và threadId là bắt buộc' });
        }

      
        const imagePaths = [];
        for (const imageUrl of imageUrls) {
            const imagePath = await saveImage(imageUrl);
            if (!imagePath) {
                // Clean up any saved images
                for (const path of imagePaths) {
                    removeImage(path);
                }
                return res.status(500).json({ success: false, error: 'Failed to save one or more images' });
            }
            imagePaths.push(imagePath);
        }

        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) {
            return res.status(400).json({ error: 'Không tìm thấy tài khoản Zalo với OwnId này' });
        }

        const result = await account.api.sendMessage(
            {
                msg: "",
                attachments: imagePaths
            },
            threadId,
            ThreadType.Group
        ).catch(console.error);

        for (const imagePath of imagePaths) {
            removeImage(imagePath);
        }
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

let currentWebSocket = null;

export function initializeWebSocket(ws) {
    currentWebSocket = ws;
}

export async function loginZaloAccount(customProxy, cred) {
    let loginResolve;
    return new Promise(async (resolve, reject) => {
        loginResolve = resolve;
        let agent;
        let proxyUsed = null;
        let useCustomProxy = false;
        let proxies = [];
        try {
            const proxiesJson = fs.readFileSync('proxies.json', 'utf8');
            proxies = JSON.parse(proxiesJson);
        } catch (error) {
            console.error("Không thể đọc hoặc phân tích cú pháp proxies.json:", error);
        }

        // Kiểm tra nếu người dùng nhập proxy
        if (customProxy && customProxy.trim() !== "") {
            try {
                // Sử dụng constructor URL để kiểm tra tính hợp lệ
                new URL(customProxy);
                useCustomProxy = true;

                // Kiểm tra xem proxy đã tồn tại trong mảng proxies chưa
                if (!proxies.includes(customProxy)) {
                    proxies.push(customProxy);
                    // Lưu mảng proxies đã cập nhật vào proxies.json
                    fs.writeFileSync('proxies.json', JSON.stringify(proxies, null, 4), 'utf8');
                    console.log(`Đã thêm proxy mới vào proxies.json: ${customProxy}`);
                } else {
                    console.log(`Proxy đã tồn tại trong proxies.json: ${customProxy}`);
                }

            } catch (err) {
                console.log(`Proxy nhập vào không hợp lệ: ${customProxy}. Sẽ sử dụng proxy mặc định.`);
            }
        }

        if (useCustomProxy) {
            agent = new HttpsProxyAgent(customProxy);
        } else {
            // Chọn proxy tự động từ danh sách nếu không có proxy do người dùng nhập hợp lệ
            if (proxies.length > 0) {
                const proxyIndex = proxyService.getAvailableProxyIndex();
                if (proxyIndex === -1) {
                    console.log('Tất cả proxy đều đã đủ tài khoản. Không thể đăng nhập thêm!');
                } else {
                    proxyUsed = proxyService.getPROXIES()[proxyIndex];
                    agent = new HttpsProxyAgent(proxyUsed.url);
                }
            } else {
                agent = null; // Không sử dụng proxy
            }
        }
        let zalo;
        if (useCustomProxy || agent) {
            zalo = new Zalo({
                agent: agent,
                // @ts-ignore
                polyfill: nodefetch,
            });
        } else {
            zalo = new Zalo({
            });
        }

        let api;
        if (cred) {
            try {
                api = await zalo.login(cred);
            } catch (error) {
                console.error("Lỗi khi đăng nhập bằng cookie:", error);
                // If cookie login fails, attempt QR code login
                api = await zalo.loginQR(null, (qrData) => {
                    if (qrData?.data?.image) {
                        const qrCodeImage = `data:image/png;base64,${qrData.data.image}`;
                        resolve(qrCodeImage);
                    } else {
                        reject(new Error("Không thể lấy mã QR"));
                    }
                });
            }
        } else {
            api = await zalo.loginQR(null, (qrData) => {
                if (qrData?.data?.image) {
                    const qrCodeImage = `data:image/png;base64,${qrData.data.image}`;
                    resolve(qrCodeImage);
                } else {
                    reject(new Error("Không thể lấy mã QR"));
                }
            });
        }

        api.listener.onConnected(() => {
            console.log("Connected");
            if (currentWebSocket) {
                currentWebSocket.send('login_success');
            }
        });
       
        setupEventListeners(api, loginResolve);
        api.listener.start();

        // Nếu sử dụng proxy mặc định từ danh sách thì cập nhật usedCount
        if (!useCustomProxy && proxyUsed) {
            proxyUsed.usedCount++;
            proxyUsed.accounts.push(api);
        }
        const accountInfo = await api.fetchAccountInfo();
        if (!accountInfo?.profile) {
            throw new Error("Không tìm thấy thông tin profile");
        }
        const { profile } = accountInfo;
        const phoneNumber = profile.phoneNumber;
        const ownId = profile.userId;
        const displayName = profile.displayName;

        const existingAccountIndex = zaloAccounts.findIndex(acc => acc.ownId === api.getOwnId());
        if (existingAccountIndex !== -1) {
            // Thay thế tài khoản cũ bằng tài khoản mới
            zaloAccounts[existingAccountIndex] = { api: api, ownId: api.getOwnId(), proxy: useCustomProxy ? customProxy : (proxyUsed && proxyUsed.url), phoneNumber: phoneNumber };
        } else {
            // Thêm tài khoản mới nếu không tìm thấy tài khoản cũ
            zaloAccounts.push({ api: api, ownId: api.getOwnId(), proxy: useCustomProxy ? customProxy : (proxyUsed && proxyUsed.url), phoneNumber: phoneNumber });
        }

        const context = await api.getContext();
        const {imei, cookie, userAgent} = context;
        const data = {
            imei: imei,
            cookie: cookie,
            userAgent: userAgent,
        }
        const cookiesDir = './cookies';
        if (!fs.existsSync(cookiesDir)) {
            fs.mkdirSync(cookiesDir);
        }
        fs.access(`${cookiesDir}/cred_${ownId}.json`, fs.constants.F_OK, (err) => {
                    if (err) {
                        fs.writeFile(`${cookiesDir}/cred_${ownId}.json`, JSON.stringify(data, null, 4), (err) => {
                            if (err) {
                                console.error('Error writing file:', err);
                            } else {
                                console.log('File created and JSON written successfully.');
                            }
                        });
                    } else {
                        console.log('File already exists, not saving.');
                    }
                });

        console.log(`Đã đăng nhập vào tài khoản ${ownId} (${displayName}) với số điện thoại ${phoneNumber} qua proxy ${useCustomProxy ? customProxy : (proxyUsed?.url || 'không có proxy')}`);
        if (currentWebSocket) {
            currentWebSocket.send('login_success');
        }
    });
}

// Get user profile
export async function getProfile(req, res) {
    try {
        const { ownId } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) {
            return res.status(400).json({ error: 'Account not found' });
        }
        const profile = await account.api.fetchAccountInfo();
        res.json({ success: true, data: profile });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Update profile
export async function updateProfile(req, res) {
    try {
        const { ownId, displayName, avatar, coverImage, birthday, gender } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) {
            return res.status(400).json({ error: 'Account not found' });
        }
        const result = await account.api.updateProfile({
            displayName,
            avatar,
            coverImage,
            birthday,
            gender
        });
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Get friend list
export async function getFriendList(req, res) {
    try {
        const { ownId, offset = 0, limit = 50 } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) {
            return res.status(400).json({ error: 'Account not found' });
        }
        
        // Using the correct method from zca-js
        const friends = await account.api.getFriends(offset, limit);
        res.json({ success: true, data: friends });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Get friend requests
export async function getFriendRequests(req, res) {
    try {
        const { ownId, offset = 0, limit = 50 } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) {
            return res.status(400).json({ error: 'Account not found' });
        }
        const requests = await account.api.getFriendRequests(offset, limit);
        res.json({ success: true, data: requests });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Accept friend request
export async function acceptFriendRequest(req, res) {
    try {
        const { ownId, userId } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) {
            return res.status(400).json({ error: 'Account not found' });
        }
        const result = await account.api.acceptFriendRequest(userId);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Get chat history
export async function getChatHistory(req, res) {
    try {
        const { ownId, threadId, offset = 0, limit = 50 } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) {
            return res.status(400).json({ error: 'Account not found' });
        }
        const history = await account.api.getChatHistory(threadId, offset, limit);
        res.json({ success: true, data: history });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// React to message
export async function reactToMessage(req, res) {
    try {
        const { ownId, messageId, reaction } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) {
            return res.status(400).json({ error: 'Account not found' });
        }
        const result = await account.api.reactToMessage(messageId, reaction);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Block User
export async function blockUser(req, res) {
    try {
        const { ownId, userId } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) return res.status(400).json({ error: 'Account not found' });
        const result = await account.api.blockUser(userId);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Unblock User
export async function unblockUser(req, res) {
    try {
        const { ownId, userId } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) return res.status(400).json({ error: 'Account not found' });
        const result = await account.api.unblockUser(userId);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Change Friend Alias
export async function changeFriendAlias(req, res) {
    try {
        const { ownId, userId, alias } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) return res.status(400).json({ error: 'Account not found' });
        const result = await account.api.changeFriendAlias(userId, alias);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Change Group Avatar
export async function changeGroupAvatar(req, res) {
    try {
        const { ownId, groupId, avatarPath } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) return res.status(400).json({ error: 'Account not found' });
        const result = await account.api.changeGroupAvatar(groupId, avatarPath);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Change Group Name
export async function changeGroupName(req, res) {
    try {
        const { ownId, groupId, name } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) return res.status(400).json({ error: 'Account not found' });
        const result = await account.api.changeGroupName(groupId, name);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Change Group Owner
export async function changeGroupOwner(req, res) {
    try {
        const { ownId, groupId, newOwnerId } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) return res.status(400).json({ error: 'Account not found' });
        const result = await account.api.changeGroupOwner(groupId, newOwnerId);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Add Group Deputy
export async function addGroupDeputy(req, res) {
    try {
        const { ownId, groupId, userId } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) return res.status(400).json({ error: 'Account not found' });
        const result = await account.api.addGroupDeputy(groupId, userId);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Remove Group Deputy
export async function removeGroupDeputy(req, res) {
    try {
        const { ownId, groupId, userId } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) return res.status(400).json({ error: 'Account not found' });
        const result = await account.api.removeGroupDeputy(groupId, userId);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Create Note
export async function createNote(req, res) {
    try {
        const { ownId, groupId, content } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) return res.status(400).json({ error: 'Account not found' });
        const result = await account.api.createNote(groupId, content);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Edit Note
export async function editNote(req, res) {
    try {
        const { ownId, groupId, noteId, content } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) return res.status(400).json({ error: 'Account not found' });
        const result = await account.api.editNote(groupId, noteId, content);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Create Poll
export async function createPoll(req, res) {
    try {
        const { ownId, groupId, question, options } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) return res.status(400).json({ error: 'Account not found' });
        const result = await account.api.createPoll(groupId, question, options);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Lock Poll
export async function lockPoll(req, res) {
    try {
        const { ownId, groupId, pollId } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) return res.status(400).json({ error: 'Account not found' });
        const result = await account.api.lockPoll(groupId, pollId);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Delete Message
export async function deleteMessage(req, res) {
    try {
        const { ownId, messageId, threadId } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) return res.status(400).json({ error: 'Account not found' });
        const result = await account.api.deleteMessage(messageId, threadId);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Add Reaction
export async function addReaction(req, res) {
    try {
        const { ownId, messageId, reaction } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) return res.status(400).json({ error: 'Account not found' });
        const result = await account.api.addReaction(messageId, reaction);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Get All Friends
export async function getAllFriends(req, res) {
    try {
        const { ownId } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) return res.status(400).json({ error: 'Account not found' });
        const result = await account.api.getAllFriends();
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Get All Groups
export async function getAllGroups(req, res) {
    try {
        const { ownId } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) return res.status(400).json({ error: 'Account not found' });
        const result = await account.api.getAllGroups();
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Get Stickers
export async function getStickers(req, res) {
    try {
        const { ownId } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) return res.status(400).json({ error: 'Account not found' });
        const result = await account.api.getStickers();
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Get Stickers Detail
export async function getStickersDetail(req, res) {
    try {
        const { ownId, stickerId } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) return res.status(400).json({ error: 'Account not found' });
        const result = await account.api.getStickersDetail(stickerId);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Send Sticker
export async function sendSticker(req, res) {
    try {
        const { ownId, threadId, stickerId, type } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) return res.status(400).json({ error: 'Account not found' });
        const result = await account.api.sendSticker(stickerId, threadId, type);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Send Voice
export async function sendVoice(req, res) {
    try {
        const { ownId, threadId, voicePath, type } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) return res.status(400).json({ error: 'Account not found' });
        const result = await account.api.sendVoice(voicePath, threadId, type);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Send Card
export async function sendCard(req, res) {
    try {
        const { ownId, threadId, userId, type } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) return res.status(400).json({ error: 'Account not found' });
        const result = await account.api.sendCard(userId, threadId, type);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Pin Conversations
export async function pinConversations(req, res) {
    try {
        const { ownId, threadIds } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) return res.status(400).json({ error: 'Account not found' });
        const result = await account.api.pinConversations(threadIds);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Send Report
export async function sendReport(req, res) {
    try {
        const { ownId, threadId, reason } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) return res.status(400).json({ error: 'Account not found' });
        const result = await account.api.sendReport(threadId, reason);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Undo Action
export async function undo(req, res) {
    try {
        const { ownId } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) return res.status(400).json({ error: 'Account not found' });
        const result = await account.api.undo();
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Disperse Group
export async function disperseGroup(req, res) {
    try {
        const { ownId, groupId } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) return res.status(400).json({ error: 'Account not found' });
        const result = await account.api.disperseGroup(groupId);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Get Cookie
export async function getCookie(req, res) {
    try {
        const { ownId } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) return res.status(400).json({ error: 'Account not found' });
        const context = await account.api.getContext();
        res.json({ success: true, data: { cookie: context.cookie } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Get QR Code
export async function getQR(req, res) {
    try {
        const qrCodeImage = await loginZaloAccount();
        res.json({ success: true, data: { qrCode: qrCodeImage } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Get Context
export async function getContext(req, res) {
    try {
        const { ownId } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) return res.status(400).json({ error: 'Account not found' });
        const context = await account.api.getContext();
        res.json({ success: true, data: context });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Get Own ID
export async function getOwnId(req, res) {
    try {
        const { ownId } = req.body;
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) return res.status(400).json({ error: 'Account not found' });
        const id = account.api.getOwnId();
        res.json({ success: true, data: { ownId: id } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

export {
    // Core functionality
    loginZaloAccount,
    initializeWebSocket,
    zaloAccounts,

    // Account Management
    getProfile,
    updateProfile,
    getFriendList,
    getFriendRequests,
    acceptFriendRequest,
    getChatHistory,

    // Message Functions
    sendMessage,
    sendImageToUser,
    sendImagesToUser,
    sendImageToGroup,
    sendImagesToGroup,
    reactToMessage,

    // User Management
    findUser,
    getUserInfo,
    blockUser,
    unblockUser,
    changeFriendAlias,
    sendFriendRequest,

    // Group Management
    createGroup,
    getGroupInfo,
    addUserToGroup,
    removeUserFromGroup,
    changeGroupAvatar,
    changeGroupName,
    changeGroupOwner,
    addGroupDeputy,
    removeGroupDeputy,
    disperseGroup,

    // Group Features
    createNote,
    editNote,
    createPoll,
    lockPoll,

    // Message Features
    deleteMessage,
    addReaction,
    sendSticker,
    sendVoice,
    sendCard,

    // Other Features
    getAllFriends,
    getAllGroups,
    getStickers,
    getStickersDetail,
    pinConversations,
    sendReport,
    undo,

    // Context and System
    getContext,
    getCookie,
    getQR,
    getOwnId
};