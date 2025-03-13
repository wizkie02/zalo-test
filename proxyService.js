// proxyService.js
const RAW_PROXIES = [
    "http://user12125:B6T8@zl97150.proxyfb.com:12125",
    "http://user:tungprxvn1@1.54.234.146:18094"
];

const MAX_ACCOUNTS_PER_PROXY = 3;
const PROXIES = RAW_PROXIES.map(p => ({ url: p, usedCount: 0, accounts: [] }));

function getAvailableProxyIndex() {
    for (let i = 0; i < PROXIES.length; i++) {
        if (PROXIES[i].usedCount < MAX_ACCOUNTS_PER_PROXY) {
            return i;
        }
    }
    return -1; // Không còn proxy trống
}

export { PROXIES, getAvailableProxyIndex };
