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
  timestamp?: string;
}

/**
 * 搜索结果
 */
export interface Search extends PageProps {
  pageid: number;
  ns: number;
  title: string;

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
