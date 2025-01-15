/**
 * 此文件存放api地址、用户名、密码等数据
 */
import * as dotenv from 'dotenv';
import packageJson from '../package.json' assert { type: 'json' };

const config = {
  API_PATH: 'https://zh.moegirl.org.cn/api.php', // api.php地址
  username: '', // wiki上的用户名
  password: '', // wiki上的密码
  defaultCookie: '', // 默认cookie

  sync: packageJson.syncConfig,
};

// 自动更新用
dotenv.config();

export default {
  ...config,
  username: process.env.MW_USERNAME || config.username,
  password: process.env.MW_PASSWORD || config.password,
  defaultCookie: process.env.DEFAULT_COOKIE ?? '',
};
