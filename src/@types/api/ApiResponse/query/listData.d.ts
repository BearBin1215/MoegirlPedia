import type { PageProps, Cmtype } from '../../utils';

/**
 * 通过`list=xxx`请求得到的数据
 */

/**
 * `list=categorymembers`获取到的分类信息
 */
export interface Categorymembers extends PageProps {
  /** 添加用于分类中排序的关键字（十六进制字符串） */
  sortkey?: string;

  /** 添加用于分类中排序的关键字前缀（关键字的人类可读部分） */
  sortkeyprefix?: string;

  /** 添加页面被分类的类型 */
  type: Cmtype;

  /** 页面被包括时的时间戳 */
  timestamp: string;
}

/** 文件使用信息 */
export interface GlobalUsage {
  /** 使用的页面标题 */
  title: string;

  /** 使用的子站点链接 */
  wiki: string;

  /** 使用的页面链接 */
  url: string;
}

/**
 * 搜索结果
 */
export interface Search extends PageProps {
  /** 页面大小（字节） */
  size: number,

  /** 词数 */
  wordcount: number,

  /** 上次编辑时的时间戳 */
  timestamp: string;

  /** 已解析的页面片段HTML */
  snippet: string;

  /** 已解析的页面标题片段 */
  titlesnippet: string;

  /** 已解析的匹配分类片段 */
  categorysnippet: string;
}

/** 用户贡献记录 */
export interface Usercontrib extends PageProps {
  /** 用户ID */
  userid: number;

  /** 用户名 */
  user: string;

  /** 修订版本 */
  revid: number;

  /** 前一版本 */
  parentid: number;

  /** 修订时间戳 */
  timestamp: string;

  /** 是否为新页面 */
  new?: '';

  /** 是否为小编辑 */
  minor?: '';

  /** 是否为最新版本 */
  top?: '';

  /** 编辑摘要 */
  comment: string;

  /** 内容大小 */
  size: number;
}
