import { Zalo } from "zca-js";
import { HttpProxyAgent } from "http-proxy-agent";
import fetch from "node-fetch";
import { SocksProxyAgent } from "socks-proxy-agent";
import tunnel from "tunnel";


async function testProxy(proxyUrl) {
  try {
    console.log(`Testing proxy: ${proxyUrl}`);
   // const agent = new HttpProxyAgent(proxyUrl);
   // const tunnel = require('tunnel');
const agent = tunnel.httpsOverHttp({
  proxy: {
    host: '1.54.234.146',
    port: 18094,
    proxyAuth: 'user:tungprxvn1'
  }
});


    const resp = await fetch("https://id.zalo.me/account", {
      agent,
      method: "GET",
      headers: {
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5",
        "cache-control": "max-age=0",
        priority: "u=0, i",
        "sec-ch-ua": '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-site",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        Referer: "https://chat.zalo.me/",
        "Referrer-Policy": "strict-origin-when-cross-origin",
    },
      // headers: {
      //   "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
      //   "Referer": "https://chat.zalo.me/",
      //   "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
      //   "Referrer-Policy": "strict-origin-when-cross-origin",
      // },
    });

    console.log('Status:', resp.status);
    if (resp.status === 200) {
      console.log('✅ Proxy hoạt động, có thể truy cập Zalo.');
    } else {
      console.log('⚠️ Proxy kết nối nhưng code != 200, code =', resp.status);
    }
  } catch (err) {
    console.log('❌ Lỗi kết nối proxy:', err.message);
  }
}




// Định dạng proxy URL chính xác zl97150.proxyfb.com:12125
const proxyUrl = "http://zl97150.proxyfb.com:12125";

const zalo = new Zalo({
    agent: new HttpProxyAgent(proxyUrl), // Sử dụng HttpsProxyAgent cho proxy HTTPS
    // @ts-ignore
    polyfill: fetch
});

async function loginQR() {    
  try {
      console.log("Đăng nhập Zalo");
      const api = await zalo.loginQR(); // Đợi đăng nhập thành công
      console.log("Đăng nhập Zalo thành công!", api);
      
      // Kiểm tra xem api có tồn tại không trước khi gọi listener
      if (api.listener) {
          api.listener.start();
          console.log("Listener đã được khởi động.");
      } else {
          console.error("Lỗi: api.listener không tồn tại!");
      }

      return api;
  } catch (err) {
      console.error("Lỗi đăng nhập:", err);
      return null;
  }
}

// Gọi test zl97150.proxyfb.com:12125:user12125:B6T8

testProxy("http://user:tungprxvn1@1.54.234.146:18094");
//loginQR()