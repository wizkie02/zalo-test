import { readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { Zalo } from "zca-js";
import axios from "axios";

const zalo = new Zalo({
    selfListen: true,
});

const api = await zalo.login(JSON.parse(readFileSync("./credentials.json", "utf-8")));
const imgURL = "https://i.ibb.co/f8rxY5m/luquy.png";

async function saveImage(url) {
    try {
        const imgPath = "./temp.png";

        const { data } = await axios.get(url, { responseType: "arraybuffer" });
        writeFileSync(imgPath, Buffer.from(data, "utf-8"));

        return imgPath;
    } catch (error) {
        console.error(error);
        return null;
    }
}

function removeImage(imgPath) {
    try {
        unlinkSync(imgPath);
    } catch (error) {
        console.error(error);
    }
}

api.listener.on("message", async (msg) => {
    const imageUrl = msg.data.content;
    if (imageUrl) {
        const imagePath = await saveImage(imageUrl);
        if (!imagePath) return;

        const senderName = msg.data.dName;
        const senderId = msg.data.uidFrom;

        const text = `Chào @${senderName}, hình ảnh đây!`;

        await api
            .sendMessage(
                {
                    msg: text,
                    attachments: [imagePath],
                    mentions: [
                        {
                            len: senderName.length + 1,
                            pos: text.indexOf(`@${senderName}`),
                            uid: senderId,
                        },
                    ],
                },
                msg.threadId,
                msg.type
            )
            .catch(console.error);

        removeImage(imagePath);
    }
});

api.listener.start();
