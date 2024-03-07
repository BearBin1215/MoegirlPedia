import { ApiResponse } from "./core";

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
