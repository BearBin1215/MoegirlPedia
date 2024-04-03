import dotenv from 'dotenv';
import packageJson from '../package.json' assert { type: 'json' };

const config = {
  API_PATH: 'https://mzh.moegirl.org.cn/api.php', // api地址
  CM_API_PATH: 'https://commons.moegirl.org.cn/api.php', // 共享站api地址
  username: '', // 用户名
  password: '', // 密码

  sync: packageJson.syncConfig,
};

dotenv.config();
config.username = process.env.MW_USERNAME || config.username;
config.password = process.env.MW_PASSWORD || config.password;

export default config;
