import fs from "fs";
import MWBot from "mwbot";
import config from "./config.js";

const waitInterval = (time) => new Promise((resolve) => setTimeout(resolve, time));

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
            const source = await fs.promises.readFile(config.sync.localPath + item, "utf-8").catch((err) => {
                throw new Error(`读取${item}失败：${err}`);
            });
            const text = `var _addText = '{{Documentation|content=* 工具介绍见[[User:BearBin/js#${item.replace(".js", "")}]]。\\n*源代码见[https://github.com/BearBin1215/MoegirlPedia/blob/main/src/gadgets/${item.replace(".js", "")} GitHub]。}}';\n\n// <nowiki>\n\n${source}\n\n// </nowiki>`;
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
            await waitInterval(20000);
        } catch (err) {
            console.error(err);
        }
    }
}).catch((err) => {
    console.error(`登录失败：${err}`);
});