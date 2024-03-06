import type { ApiResponse } from './index';

/**
 * `action=compare`请求响应数据接口
 */
export interface ApiCompareResponse extends ApiResponse {
  compare: {
    /**
     * `from`页面ID
     */
    fromid?: number;

    /**
     * `from`修订版本ID
     */
    fromrevid?: number;

    /**
     * `from`页面所在名字空间
     */
    fromns?: number;

    /**
     * `from`页面标题
     */
    fromtitle?: string;

    /**
     * `from`修订版本的大小（字节）
     */
    fromsize?: number;

    /**
     * `from`页面所属用户名
     */
    fromuser?: string;

    /**
     * `from`页面所属用户ID
     */
    fromuserid?: number;

    /**
     * `from`修订版本注释
     */
    fromcomment?: string;

    /**
     * 解析后的`from`修订版本注释
     */
    fromparsedcomment?: string;

    /**
     * `to`页面ID
     */
    toid?: number;

    /**
     * `to`修订版本ID
     */
    torevid?: number;

    /**
     * `to`页面所属用户名
     */
    tons?: number;

    /**
     * `to`页面标题
     */
    totitle?: string;

    /**
     * `to`修订版本的大小（字节）
     */
    tosize?: number;

    /**
     * `to`页面所属用户名
     */
    touser?: string;

    /**
     * `to`页面所属用户ID
     */
    touserid?: number;

    /**
     * `to`修订版本注释
     */
    tocomment?: string;

    /**
     * 解析后的`to`修订版本注释
     */
    toparsedcomment?: string;

    /**
     * `from`修订版本的前一个版本ID
     */
    prev?: number;

    /**
     * 差异HTML的大小（字节）
     */
    diffsize?: number;

    /**
     * 差异HTML
     */
    '*'?: string;
  }
}

/**
 * 编辑成功响应基础接口
 */
export interface ApiEditSuccess {
  /**
   * 编辑结果
   */
  result: 'Success';

  /**
   * 页面ID
   */
  pageid: number;

  /**
   * 页面标题
   */
  title: string;

  /**
   * 页面内容模型
   */
  contentmodel: ContentModel;
}

/**
 * 编辑成功、未发生变化
 */
export interface ApiEditNochange extends ApiEditSuccess {
  /**
   * 无变化
   */
  nochange: '';
}

/**
 * 编辑成功、页面内容变化
 */
export interface ApiEditChanged extends ApiEditSuccess {
  /**
   * 变化
   */

  /**
   * 旧修订版本ID
   */
  oldrevid: number;

  /**
   * 新修订版本ID
   */
  newrevid: number;

  /**
   * 编辑时间戳
   */
  newtimestamp: string;
}

/**
 * 编辑失败
 */
export interface ApiEditFailure {
  /**
   * 编辑结果
   */
  result: 'Failure';

  /**
   * 编辑失败代码
   */
  code: string;

  /**
   * 编辑失败消息
   */
  message: {
    key: string;

    params: (string | number)[];
  }

  /**
   * 编辑失败信息
   */
  info: string;

  /**
   * 警告HTML文本
   */
  warning: string;

  /**
   * 滥用过滤器拦截信息
   */
  abusefilter?: {
    /**
     * 过滤器编号
     */
    id: number;

    /**
     * 滥用过滤器描述
     */
    description: string;

    /**
     * 滥用过滤器行为
     */
    actions: ('throttle' | 'warn' | 'message' | 'disallow' | 'blockautopromote' | 'block' | 'tag')[];
  }
}

/**
 * 通过API编辑（`action=edit`）响应数据
 */
export interface ApiEditResponse extends ApiResponse {
  edit?: ApiEditNochange | ApiEditChanged | ApiEditFailure;
}
