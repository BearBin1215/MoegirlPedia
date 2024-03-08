/**
 * 页面内容模型
 */
export type ContentModel =
  'GadgetDefinition' |
  'sanitized-css' |
  'Scribunto' |
  'wikitext' |
  'javascript' |
  'json' |
  'css' |
  'text';

/**
 * 设置是否监视
 */
export type Watchlist =
  'watch' |
  'unwatch' |
  'preferences' |
  'nochange';

/**
 * 内容序列化格式
 */
export type ContentFormat =
  'application/json' |
  'text/css' |
  'text/plain' |
  'text/x-wiki' |
  'text/javascript';

/**
 * 页面被分类的类型
 */
export type Cmtype = 'page' | 'subcat' | 'file';

/**
 * 页面信息
 */
export interface PageProps {
  /** 页面id */
  pageid?: number;

  /** 名字空间 */
  ns?: number;

  /** 页面标题 */
  title?: string;
}
