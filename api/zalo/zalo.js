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

export async function acceptFriendRequest(req, res) {
    try {
        const { userId, ownId } = req.body;
        if (!userId || !ownId) {
            return res.status(400).json({ error: 'Dữ liệu không hợp lệ: userId và ownId là bắt buộc' });
        }
        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) {
            return res.status(400).json({ error: 'Không tìm thấy tài khoản Zalo với OwnId này' });
        }
        // Gọi API acceptFriendRequest từ zca-js
        const result = await account.api.acceptFriendRequest(userId);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Lỗi trong hàm acceptFriendRequest:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}
export async function sendMessageByPhoneNumber(req, res) {
    try {
        const { phone, message, ownId } = req.body;
        if (!phone || !message || !ownId) {
            return res.status(400).json({ error: 'Dữ liệu không hợp lệ: phone và message là bắt buộc' });
        }

        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) {
            return res.status(400).json({ error: 'Không tìm thấy tài khoản Zalo với OwnId này' });
        }

        // Bước 1: Tìm người dùng qua số điện thoại
        console.log(`Tìm kiếm người dùng với số điện thoại: ${phone}`);
        const userData = await account.api.findUser(phone);
        
        if (!userData || !userData.uid) {
            return res.status(404).json({ success: false, error: 'Không tìm thấy người dùng với số điện thoại này' });
        }
        
        const userId = userData.uid;
        console.log(`Đã tìm thấy người dùng: ${userData.display_name || userData.zalo_name} (ID: ${userId})`);
        
        // Bước 2: Gửi tin nhắn
        const result = await account.api.sendMessage(
            message,
            userId,
            ThreadType.User
        ).catch(error => {
            console.error('Lỗi khi gửi tin nhắn:', error);
            throw error;
        });
        
        res.json({ 
            success: true, 
            data: result,
            user: {
                userId: userData.uid,
                name: userData.display_name || userData.zalo_name
            }
        });
    } catch (error) {
        console.error('Lỗi trong hàm sendMessageByPhoneNumber:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

// Hàm gửi hình ảnh qua số điện thoại (kết hợp findUser và sendImageToUser)
export async function sendImageByPhoneNumber(req, res) {
    try {
        const { phone, imagePath: imageUrl, ownId } = req.body;
        if (!phone || !imageUrl || !ownId) {
            return res.status(400).json({ error: 'Dữ liệu không hợp lệ: phone và imagePath là bắt buộc' });
        }

        const account = zaloAccounts.find(acc => acc.ownId === ownId);
        if (!account) {
            return res.status(400).json({ error: 'Không tìm thấy tài khoản Zalo với OwnId này' });
        }

        // Bước 1: Tìm người dùng qua số điện thoại
        console.log(`Tìm kiếm người dùng với số điện thoại: ${phone}`);
        const userData = await account.api.findUser(phone);
        
        if (!userData || !userData.uid) {
            return res.status(404).json({ success: false, error: 'Không tìm thấy người dùng với số điện thoại này' });
        }
        
        const userId = userData.uid;
        console.log(`Đã tìm thấy người dùng: ${userData.display_name || userData.zalo_name} (ID: ${userId})`);
        
        // Bước 2: Tải và lưu hình ảnh
        const imagePath = await saveImage(imageUrl);
        if (!imagePath) {
            return res.status(500).json({ success: false, error: 'Không thể tải hình ảnh' });
        }

        // Bước 3: Gửi tin nhắn với hình ảnh
        const result = await account.api.sendMessage(
            {
                msg: "",
                attachments: [imagePath]
            },
            userId,
            ThreadType.User
        ).catch(error => {
            console.error('Lỗi khi gửi tin nhắn:', error);
            throw error;
        });

        // Dọn dẹp hình ảnh tạm thời
        removeImage(imagePath);
        
        res.json({ 
            success: true, 
            data: result,
            user: {
                userId: userData.uid,
                name: userData.display_name || userData.zalo_name
            }
        });
    } catch (error) {
        console.error('Lỗi trong hàm sendImageByPhoneNumber:', error);
        res.status(500).json({ success: false, error: error.message });
    }
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
            resolve(true);
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
        
    });
}