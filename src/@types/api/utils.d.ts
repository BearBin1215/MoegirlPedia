/**
 * 页面内容模型
 */
export type contentmodel =
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
export type watchlist =
  'watch' |
  'unwatch' |
  'preferences' |
  'nochange';

/**
 * 内容序列化格式
 */
export type contentformat =
  'application/json' |
  'text/css' |
  'text/plain' |
  'text/x-wiki' |
  'text/javascript';
