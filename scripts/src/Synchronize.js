import fs from "fs";
import MWBot from "mwbot";
import config from "./config.js";
import { exec } from "child_process";

// 获取最近一次提交变更的文件
exec('git diff --name-only HEAD HEAD~1', (error, stdout) => {
    if (error) {
        throw new Error(`获取最近提交文件失败：${error}`);
    }
    const changedGadgets = stdout
        .split("\n")
        .filter((fileName) => fileName.includes("dist/gadgets/"))
        .map((fileName) => fileName.replace(/dist\/gadgets\/(.*)\.min\.js/, "$1"));

    const list = config.sync.list.filter((gadgetName) => changedGadgets.includes(gadgetName));

    if (!list.length) {
        console.log("列表中无小工具发生变化。");
        return;
    }

    console.log(`发生变化的工具：${list.join("、")}。即将开始同步。`);

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
        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            try {
                const title = `${config.sync.pagePath + item}.js`;
                const source = await fs.promises.readFile(`${config.sync.localPath + item}.min.js`, "utf-8").catch((err) => {
                    throw new Error(`读取${item}失败：${err}`);
                });
                const text = `var _addText = '{{Documentation|content=* 工具介绍见[[User:BearBin/js#${item}]]。\\n* 源代码见[https://github.com/BearBin1215/MoegirlPedia/blob/master/src/gadgets/${item} GitHub]。}}';\n\n// <nowiki>\n\n${source}\n\n// </nowiki>`;
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
                if (i < list.length) {
                    await waitInterval(6000);
                }
            } catch (err) {
                console.error(err);
            }
        }
    }).catch((err) => {
        console.error(`登录失败：${err}`);
    });
});