import fs from "fs";
import MWBot from "mwbot";
import config from "./config.js";

const bot = new MWBot({
    apiUrl: config.API_PATH,
}, {
    timeout: 60000,
});

bot.loginGetEditToken({
    username: config.username,
    password: config.password,
}).then(async () => {
    for (const item of config.sync.list) {
        try {
            const title = config.sync.pagePath + item;
            const text = await fs.promises.readFile(config.sync.localPath + item, "utf-8").catch((err) => {
                throw new Error(`读取${item}失败：${err}`);
            });
            await bot.request({
                action: "edit",
                title,
                text,
                summary: "同步GitHub更改",
                bot: true,
                tags: "Bot",
                token: bot.editToken,
            }).then((res) => {
                if (res.edit.nochange === "") {
                    console.log(`${title}保存前后无变化。`);
                } else {
                    console.log(`${item}已保存至${title}`);
                }
            }).catch((err) => {
                throw new Error(`${item}保存失败：${err}`);
            });
        } catch (err) {
            console.error(err);
        }
    }
}).catch((err) => {
    console.error(`登录失败：${err}`);
});