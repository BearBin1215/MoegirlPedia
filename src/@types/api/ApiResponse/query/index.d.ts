import type {ApiResponse} from '../core';
import type { ContentModel } from '../../utils';
import type { Linkshere, Redirects, Revisions, Transcludedin } from './propData';
import type { Categorymembers, Search } from './listData';

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
   * prop=categories
   */
  clcontinue?: string;

  /**
   * prop=categoryinfo
   */
  cicontinue?: string;

  /**
   * prop=contributors
   */
  pccontinue?: string;

  /**
   * prop=deletedrevisions
   */
  drvcontinue?: string;

  /**
   * prop=duplicatefiles
   */
  dfcontinue?: string;

  /**
   * prop=extlinks
   */
  eloffset?: string;

  /**
   * prop=extracts
   */
  excontinue?: string;

  /**
   * prop=fileusage
   */
  fucontinue?: string;

  /**
   * prop=globalusage
   */
  gucontinue?: string;

  /**
   * prop=imageinfo
   */
  iicontinue?: string;

  /**
   * prop=images
   */
  imcontinue?: string;

  /**
   * prop=info
   */
  incontinue?: string;

  /**
   * prop=iwlinks
   */
  iwcontinue?: string;

  /**
   * prop=langlinks
   */
  llcontinue?: string;

  /**
   * prop=links
   */
  plcontinue?: string;

  /**
   * prop=linkshere
   */
  lhcontinue?: string;

  /**
   * prop=pageimages
   */
  picontinue?: string;

  /**
   * prop=pageprops
   */
  ppcontinue?: string;

  /**
   * prop=redirects
   */
  rdcontinue?: string;

  /**
   * prop=references
   */
  rfcontinue?: string;

  /**
   * prop=revisions
   */
  rvcontinue?: string;

  /**
   * prop=templates
   */
  tlcontinue?: string;

  /**
   * prop=transcludedin
   */
  ticontinue?: string;

  /**
   * prop=videoinfo
   */
  vicontinue?: string;

  [key: string]: string | undefined;
}

/**
 * 页面保护信息
 */
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
 * `prop=xxx`获取到的数据
 */
export interface ApiQueryPageInfo {
  /**
   * 页面id
   */
  pageid?: number;

  /**
   * 页面所属命名空间
   */
  ns: number,

  /**
   * 页面标题
   */
  title?: string,

  /**
   * 页面是否存在
   */
  missing?: '',

  /**
   * 页面内容模型
   */
  contentmodel?: ContentModel,

  /**
   * 页面语言
   */
  pagelanguage?: string,

  /**
   *
   */
  pagelanguagehtmlcode?: string,

  pagelanguagedir?: string,

  touched?: string,

  lastrevid?: number,

  /**
   * 页面长度（字节）
   */
  length?: string,

  /**
   * 保护信息
   */
  protection?: Protection[],

  /**
   * 可操作类型
   */
  restrictiontypes?: string[],

  /**
   * 是否监视
   */
  watched?: '',

  /**
   * 监视用户数量
   */
  watchers?: number,

  /**
   * 最近编辑的监视者数量
   */
  visitingwatchers?: number,

  /**
   * 监视列表通知时间戳
   */
  notificationtimestamp?: '',

  /**
   * 每个非讨论页面的讨论页的页面ID。
   */
  talkid?: number,

  /**
   * 讨论页的母页面的页面ID
   */
  subjectid?: number,

  /**
   * 页面的完整URL
   */
  fullurl?: string,

  /**
   * 页面的编辑URL
   */
  editurl?: string,

  /**
   * 页面的规范URL
   */
  canonicalurl?: string,

  /**
   * 用户是否可以阅读此页面
   */
  readable?: '',

  /**
   * 提供由EditFormPreloadText返回的文本
   */
  preload?: string | null,

  /**
   * 在页面标题实际显示的地方提供方式
   */
  displaytitle?: string,

  /**
   * 网站内容语言所有变体的显示标题
   */
  varianttitles?: Record<string, string>,

  /**
   * 用户可以在页面上执行的操作
   */
  actions?: Record<string, ''>,

  /**
   * `prop=redirects`获取的至指定页面的所有重定向
   */
  redirects: Redirects[];

  /**
   * `prop=revisions`获取的修订版本信息
   */
  revisions?: Revisions[];

  /**
   * `prop=transcludedin`获取的所有嵌入指定页面的页面
   */
  transcludedin?: Transcludedin[];

  /**
   * `prop=linkshere`获取的所有链接至指定页面的页面
   */
  linkshere?: Linkshere[];

  [key: string]: any;
}

/**
 * `action=query`响应数据接口
 */
export interface ApiQueryResponse extends ApiResponse {
  /**
   * 1.25版本后，API返回一个`batchcomplete`，表示当前“批次”的
   * 所有页面数据已经返回，而`continue`元素不包含属性的继续数据，
   * 而可能包含生成器的继续数据。
   */
  batchcomplete?: '';

  /**
   * 用于继续请求
   */
  continue?: ApiContinue;

  /**
   * 请求结果
   */
  query: {
    /**
     * `prop=xxx`获取到的数据
     */
    pages?: Record<number, ApiQueryPageInfo>;

    /**
     * `list=categorymembers`获取到的分类成员信息
     */
    categorymembers?: Categorymembers[];

    /**
     * 搜索信息
     */
    searchinfo?: {
      /**
       * 结果总数
       */
      totalhits: number;
    }

    /**
     * 搜索结果
     */
    search?: Search[];

    [key: string]: any;
  };
}
