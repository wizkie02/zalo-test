const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

puppeteer.use(StealthPlugin());
app.use(cors());
app.use(express.json());

app.post('/login/zalo', async (req, res) => {
  const { proxy } = req.body;

  if (!proxy) return res.status(400).json({ error: 'Missing proxy' });

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: [`--proxy-server=${proxy}`, '--no-sandbox']
    });

    const page = await browser.newPage();
    await page.goto('https://zalo.me/pc', { waitUntil: 'networkidle2' });

    const qrImg = await page.$('.QrCode__image img');

    if (!qrImg) {
      await browser.close();
      return res.status(500).json({ error: 'Không lấy được QR' });
    }

    const qrBase64 = await qrImg.screenshot({ encoding: 'base64' });

    res.json({ qr: `data:image/png;base64,${qrBase64}` });

    // Có thể đợi user scan QR rồi lấy session, lưu token v.v...
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Đăng nhập thất bại' });
  }
});

app.listen(PORT, () => {
  console.log(`Zalo Login API running on port ${PORT}`);
});
