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

export interface Protection {
  /**
   * 受保护的操作类型
   */
  type: string;

  /**
   * 保护等级
   */
  level: string;

  /**
   * 保护期限，infinity为无限期
   */
  expiry: string;
}

/**
 * api请求响应的错误或警告信息
 */
export interface ResponseNotification {
  code?: string;

  info?: string;

  "*": string;
}
