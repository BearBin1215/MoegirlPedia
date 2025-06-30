import axios, {
  type CreateAxiosDefaults,
  type AxiosInstance,
  type AxiosRequestConfig,
} from 'axios';
import { Cookie, CookieJar } from 'tough-cookie';
import queryString from 'query-string';
import envConfig from './config';

type ApiParams = Record<string, string | number | boolean | string[] | number[] | undefined>;

type Cmtype = 'page' | 'subcat' | 'file';

interface LoginParams {
  username?: string;
  password?: string;
}

class Api {
  /** api地址 */
  url = 'https://zh.moegirl.org.cn/api.php';

  username = '';

  password = '';

  /** axios实例，用于请求 */
  axiosInstance: AxiosInstance;

  /** 记录登录状态 */
  loggedIn = false;

  /** 默认请求参数 */
  defaultParams = {
    action: 'query',
    format: 'json',
  };

  cookieJar = new CookieJar();

  constructor(config: CreateAxiosDefaults & LoginParams & { jar?: CookieJar }) {
    this.url = config.url ?? this.url;
    if (config.jar) {
      this.cookieJar = config.jar;
    } else {
      const parsedCookies = envConfig.defaultCookie.split(';').map((cookie) => Cookie.parse(cookie));
      parsedCookies.forEach((cookie) => {
        if (cookie) {
          this.cookieJar.setCookie(cookie, this.url);
        }
      });
    }
    this.axiosInstance = axios.create({
      url: this.url,
      withCredentials: true,
      timeout: 60000,
      ...config,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        Cookie: this.cookieJar.getCookieStringSync(this.url),
        ...config.headers,
      },
    });
    this.username = config.username ?? '';
    this.password = config.password ?? '';
  }

  static get = axios.get;
  static post = axios.post;

  /** 将请求参数加上默认参数，并将数组参数转换为竖线分隔格式 */
  formatRequestJSON(data: Record<string, any> = {}) {
    const defaultParams = { ...this.defaultParams };
    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value)) {
        defaultParams[key] = value.join('|');
      } else {
        defaultParams[key] = value;
      }
    }
    return defaultParams;
  }

  async get(query?: ApiParams, config: AxiosRequestConfig = {}) {
    // 加入缺省参数
    const searchParams = this.formatRequestJSON(query);
    const search = queryString.stringify(searchParams);
    const response = await this.axiosInstance.get(search ? `${this.url}?${search}` : this.url, config);
    return response.data;
  }

  async post(data: ApiParams, config?: AxiosRequestConfig) {
    // 加入缺省参数
    const form: ApiParams = this.formatRequestJSON(data);
    const response = await this.axiosInstance.post(this.url, form, config);
    console.log(response);
    const setCookie = response.headers['set-cookie'];
    if (setCookie?.length) {
      setCookie.forEach((cookie) => {
        this.cookieJar.setCookie(cookie, this.url);
      });
    }
    return response.data;
  }

  async login(loginParams: LoginParams = {}) {
    if (loginParams.username) {
      this.username = loginParams.username;
    }
    if (loginParams.password) {
      this.password = loginParams.password;
    }
    if (!this.username || !this.password) {
      throw new Error('用户名或密码缺失');
    }
    const { logintoken } = await this.getToken('login');
    const res = await this.post({
      action: 'login',
      lgname: this.username,
      lgpassword: this.password,
      lgtoken: logintoken,
    });
    console.log(res);
    if (res.login?.result === 'Success') {
      this.loggedIn = true;
    } else {
      throw new Error(`登录失败：${res.login?.result}: ${res.login?.reason}`);
    }
  }

  /** 获取令牌，默认csrf */
  async getToken(types: string | string[] = 'csrf') {
    const type = typeof types === 'string' ? types : types.join('|');
    const res = await this.post({
      action: 'query',
      meta: 'tokens',
      type,
    });
    return res.query.tokens;
  }

  async read(title: string): Promise<string | undefined> {
    const res = await this.get({
      action: 'query',
      prop: 'revisions',
      titles: title,
      rvprop: 'content',
    });
    const [pageData] = Object.values(res.query.pages) as any;
    if ('revisions' in pageData) {
      return pageData.revisions?.[0]['*'] as string;
    }
    if ('missing' in pageData) {
      throw ('missingtitle');
    }
  }

  /** 读取分类下的页面 */
  async getCategoryMembers(cmtitle: string, cmtype: Cmtype[] = ['page']) {
    const pageList: string[] = [];
    let cmcontinue: string | undefined = '';
    while (cmcontinue !== undefined) {
      const result = await this.post({
        action: 'query',
        format: 'json',
        utf8: true,
        list: 'categorymembers',
        cmlimit: 'max',
        cmtitle,
        cmprop: 'title',
        cmtype,
        cmcontinue,
      });
      if (result.query.categorymembers[0]) {
        pageList.push(...result.query.categorymembers.map(({ title }) => title));
      }
      cmcontinue = result.continue?.cmcontinue;
    }
    return pageList;
  }
}

const mw = { Api };

export default mw;
