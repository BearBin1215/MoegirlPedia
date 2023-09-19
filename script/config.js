import dotenv from "dotenv";

const config = {
    API_PATH: "https://mzh.moegirl.org.cn/api.php", // api地址
    CM_API_PATH: "https://commons.moegirl.org.cn/api.php", // 共享站api地址
    username: "", // 用户名
    password: "", // 密码

    // 自动同步脚本
    sync: {
        // 本地脚本目录
        localPath: "gadgets/",

        // 萌百页面路径
        pagePath: "User:BearBin/js/",

        // 同步列表
        list: [
            "voteRemind.js",
            "BatchSend.js",
            "OneKeyPurge.js",
            "QuickThank.js",
            "SectionPermanentLink.js",
            "FileUsedNotLinked.js",
            "LyricStyleToggle.js",
            "NewpagesCat.js",
            "BulkMove.js",
            "Excel2Wiki.js",
            "WikiplusSummary.js",
            "ShowContributors.js",
            "MassEdit.js",
            "TextDiff.js",
            "ListEnhancer.js",
        ],
    },
};

dotenv.config();
config.username = process.env.MW_USERNAME || config.username;
config.password = process.env.MW_PASSWORD || config.password;

export default config;