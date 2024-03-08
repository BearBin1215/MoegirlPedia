import dotenv from 'dotenv';

const config = {
  API_PATH: 'https://mzh.moegirl.org.cn/api.php', // api地址
  CM_API_PATH: 'https://commons.moegirl.org.cn/api.php', // 共享站api地址
  username: '', // 用户名
  password: '', // 密码

  // 自动同步脚本
  sync: {
    // 本地脚本目录
    localPath: 'dist/gadgets/',

    // 萌百页面路径
    pagePath: 'User:BearBin/js/',

    // 同步列表
    list: [
      'BatchSend',
      'BulkMove',
      'CtrlS',
      'Excel2Wiki',
      'FileUsedNotLinked',
      'ListEnhancer',
      'LyricStyleToggle',
      'MassEdit',
      'MoeStretch',
      'NewpagesCat',
      'OneKeyPurge',
      'purgecache',
      'QuickThank',
      'ShowContributors',
      'SidebarEnhance',
      'TextDiff',
      'userStatus',
      'WikiplusSummary',
    ],
  },
};

dotenv.config();
config.username = process.env.MW_USERNAME || config.username;
config.password = process.env.MW_PASSWORD || config.password;

export default config;
