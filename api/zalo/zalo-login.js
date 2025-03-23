// api/zalo/zalo-login.js
import { Zalo } from 'zca-js';
import { proxyService } from '../../proxyService.js';
import { setupEventListeners } from '../../eventListeners.js';
import { HttpsProxyAgent } from "https-proxy-agent";
import nodefetch from "node-fetch";
import fs from 'fs';
import { zaloAccounts } from './zalo.js';

export async function loginZaloAccount(customProxy) {
    let loginResolve;
    return new Promise(async (resolve, reject) => {
        loginResolve = resolve;
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
            const proxyIndex = proxyService.getAvailableProxyIndex();
            if (proxyIndex === -1) {
                return reject(new Error('Tất cả proxy đều đã đủ tài khoản. Không thể đăng nhập thêm!'));
            }
            proxyUsed = proxyService.getPROXIES()[proxyIndex];
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

        api.listener.onConnected(() => {
            console.log("Connected");
            resolve(true);
        });
        const data = {
            imei: api.listener.imei,
            cookie: api.getCookie(),
            userAgent: api.listener.userAgent,
        };
        
        fs.writeFile('cred.json', JSON.stringify(data, null, 4), (err) => {
            if (err) {
                console.error('Error writing file:', err);
            } else {
                console.log('File created and JSON written successfully.');
            }
        });

        setupEventListeners(api, loginResolve);
        api.listener.start();

        // Nếu sử dụng proxy mặc định từ danh sách thì cập nhật usedCount
        if (!useCustomProxy) {
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
            zaloAccounts[existingAccountIndex] = { ownId: api.getOwnId(), proxy: useCustomProxy ? customProxy : (proxyUsed && proxyUsed.url), phoneNumber: phoneNumber };
        } else {
            // Thêm tài khoản mới nếu không tìm thấy tài khoản cũ
            zaloAccounts.push({ ownId: api.getOwnId(), proxy: useCustomProxy ? customProxy : (proxyUsed && proxyUsed.url), phoneNumber: phoneNumber });
        }

        console.log(`Đã đăng nhập vào tài khoản ${ownId} (${displayName}) với số điện thoại ${phoneNumber} qua proxy ${useCustomProxy ? customProxy : (proxyUsed?.url || 'không có proxy')}`);
        
       
    });
}