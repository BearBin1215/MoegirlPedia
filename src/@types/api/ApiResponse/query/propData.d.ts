/**
 * 通过`prop=xxx`请求得到的数据
 */
import type { ContentModel, ContentFormat, PageProps } from '../../utils';

/**
 * `prop=images` 返回指定页面上包含的所有文件
 */
export interface Image extends Omit<PageProps, 'pageid'> {
  /** 文件所在的名字空间，通常为`6` */
  ns: number;

  /** 文件名 */
  title: string;
}

/**
 * `prop=linkshere` 查找所有链接至指定页面的页面
 */
export interface Linkshere extends PageProps {
  /** 是否为重定向 */
  redirect: '';
}

/**
 * `prop=redirects` 返回至指定页面的所有重定向
 */
export interface Redirects extends PageProps {
  /** 每个重定向的碎片（即锚点重定向），如果有。 */
  fragment: string;
}

/**
 * `prop=revisions` 获取修订版本信息
 */
export interface Revisions {
  /** 修订版本的ID */
  revid: number;

  /** 该版本的前一版本id，为0时代表创建新页面 */
  parentid: number;

  /** 是否为小编辑 */
  minor: '';

  /** 做出修订的用户 */
  user: string;

  /** 修订创建者的用户ID */
  userid: number;

  /** 编辑时间 */
  timestamp: string;

  /** 编辑摘要 */
  comment: string;

  /** 修订的长度（字节） */
  size: number;

  /** 修订的SHA-1（base 16） */
  sha1: string;

  /** 修订的内容模型ID */
  contentmodel: ContentModel;

  /** 由用户对修订做出的被解析的摘要 */
  parsedcomment: string;

  /** 修订标签 */
  tags: string[];

  /** 修订内容的XML解析树（需要内容模型`wikitext`） */
  parsetree: string;

  /** 内容序列化格式 */
  contentformat: ContentFormat;

  /** 修订文本 */
  "*": string;
}

/**
 * `prop=transcludedin` 查找所有嵌入指定页面的页面
 *
 * 返回的数据内容和`linkshere`一致
 */
export type Transcludedin = Linkshere;
