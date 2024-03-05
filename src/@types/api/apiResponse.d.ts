import type {
  contentmodel,
  contentformat,
} from './utils';

/**
 * 一次API查询经常不能获取你想要的所有数据。当这种情况发生时，
 * API会在结果中添加一个额外数据（标题为`continue`），以表示有更多数据。
 *
 * 返回的数据将有两部分：一部分是一个也叫做continue的子元素（sub-element）。
 * 如果有可继续获取的数据，这个子元素通常会有一个包含符号`||`的关联值。
 * 第二部分将是一个（或多个）子元素，其标题是查询中使用的列表（list）的缩写
 * 加上`continue`。（所以，例如，使用categorymembers进行查询的子元素
 * 将是`cmcontinue`，使用allcategories进行查询的子元素将是`accontinue`，
 * 使用protectedtitles进行查询的子元素将是`ptcontinue`，等等。）
 *
 * 当结果中存在`continue`元素时，要获取更多数据，你必须将第二个子元素
 * 作为参数添加到下一个API请求中。例如，如果使用allcategories的查询
 * 包含了更多结果，那么下一个API查询应该包含`accontinue=`作为参数，
 * 以及第一次查询结果中`accontinue`的值。要获取所有结果，可以重复进行，
 * 直到API结果中不再有`continue`元素，表示没有更多匹配查询的数据。
 *
 * @see https://www.mediawiki.org/wiki/API:Continue
 */
export interface ApiContinue {
  continue: string;

  /**
   * prop=categories (cl)
   */
  clcontinue?: string;

  /**
   * prop=categoryinfo (ci)
   */
  cicontinue?: string;

  /**
   * prop=contributors (pc)
   */
  pccontinue?: string;

  /**
   * prop=deletedrevisions (drv)
   */
  drvcontinue?: string;

  [key: string]: string;
}

/**
 * api响应基础接口
 */
export type ApiResponse = Record<string, any>;

/**
 * action=query响应接口
 */
export interface ApiQueryResponse extends ApiResponse {
  /**
   * 用于继续请求
   */
  continue?: ApiContinue;

  /**
   * 警告
   */
  warnings?: string;

  query?: Record<string, any>;
}

export interface Revisions {
  /**
   * 修订版本的ID
   */
  revid?: number;

  parentid?: number;

  /**
   * 做出修订的用户
   */
  user?: string;

  /**
   * 修订创建者的用户ID
   */
  userid?: number;

  /**
   * 编辑时间
   */
  timestamp?: string;

  /**
   * 修订的长度（字节）
   */
  size?: number;

  /**
   * 修订的SHA-1（base 16）
   */
  sha1?: string;

  /**
   * 修订的内容模型ID
   */
  contentmodel?: contentmodel;

  /**
   * 编辑摘要
   */
  comment: string;

  /**
   * 由用户对修订做出的被解析的摘要
   */
  parsedcomment?: string;

  /**
   * 修订标签
   */
  tags?: string[];

  /**
   * 修订内容的XML解析树（需要内容模型`wikitext`）
   */
  parsetree?: string;

  /**
   * 内容序列化格式
   */
  contentformat?: contentformat;

  /**
   * 修订文本
   */
  "*"?: string;
}
