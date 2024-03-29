import type { ApiResponse } from './core';

interface TextResponse {
  '*': string;
}

/**
 * 跨语言链接信息
 */
export interface ApiParseLangLink {
  /** 语言（如en、ja、zh） */
  lang: string;

  /** 链接 */
  url: string;

  /** 语言名称 */
  langname: string;

  /** 语言名称 */
  autonym: string;

  /** 跨语言链接页面名 */
  '*': string;
}

/**
 * 分类信息
 */
export interface ApiParseCategory {
  sortkey: string;

  /** 分类名（不含Category前缀） */
  '*': string;

  /** 是否为隐藏分类,若有此值则为隐藏分类 */
  hidden?: '';

  /** 若有此值则页面不存在 */
  missing?: '';
}

/**
 * 链接信息
 */
export interface ApiParseLink {
  /** 名字空间 */
  ns: number;

  /** 是否存在，有此值表示目标页面存在 */
  exist?: '';

  /** 目标页面标题 */
  '*': string;
}

/**
 * 嵌入页面信息
 */
export interface ApiParseTemplate {
  /** 嵌入页面的名字空间 */
  ns: number;

  /** 是否存在，有此值表示嵌入的页面存在 */
  exist?: '';

  /** 嵌入页面标题 */
  '*': string;
}

export interface ApiParseSection {
  /** 目录等级 */
  toclevel: number,

  /** 标题等级 */
  level: string,

  /** 显示文本 */
  line: string,

  /** 目录内对应序号 */
  number: string,

  /** 标题索引（我理解为可以用section=x进行段落编辑中的x），可能为空 */
  index: string,

  /** 嵌入自页面的标题，非嵌入则为本页面标题 */
  fromtitle?: string,

  /** 位置（字节数） */
  byteoffset: number | null,

  /** 锚点 */
  anchor: string,
}

/**
 * 跨wiki链接信息
 */
export interface ApiParseIWLink {
  /** 链接前缀 */
  prefix: string;

  /** 目标链接 */
  url: string;

  /** 页面标题 */
  '*': string;
}

/**
 * wiki文本中的属性信息，如`notoc`
 */
export interface ApiParseProperty {
  /** 属性名 */
  name: string;

  '*': string;
}

/**
 * 页面状态指示器信息
 */
export interface ApiParseIndicator {
  /** 指示器名称 */
  name: string;

  /** 指示器HTML */
  '*': string;
}

/**
 * 限制报告数据
 */
export interface ApiParseLimitReportData {
  /** 限制报告名称 */
  name: string;

  /** 使用量 */
  0?: number;

  /** 上限 */
  1?: number;
}

export interface ApiParseResult {
  /** 页面标题 */
  title: string;

  /** 页面ID */
  pageid: number;

  /** 被解析页面的修订ID */
  revid: number;

  /** 标题 */
  displaytitle: string;

  /** 解析得到的HTML文本 */
  text: TextResponse;

  /** 摘要 */
  parsedsummary: TextResponse;

  /** 跨语言链接 */
  langlinks: ApiParseLangLink[];

  /** 所属分类 */
  categories: ApiParseCategory[];

  /** 分类条HTML */
  categorieshtml: TextResponse;

  /** 内部链接 */
  links: ApiParseLink[];

  /** 嵌入的页面 */
  templates: ApiParseTemplate[];

  /** 使用的图片 */
  images: [];

  /** 外部链接 */
  externallinks: string[];

  /** 段落 */
  sections: ApiParseSection[];

  /**
   * 解析内容时发生的警告
   * @todo 不确定格式
   */
  parsewarnings: any[];

  /** 跨wiki链接 */
  iwlinks: ApiParseIWLink[];

  /** 多种定义在被解析的wiki文本中的属性 */
  properties: ApiParseProperty[];

  headitems: any[];

  /** `<head>`标签内容 */
  headhtml: TextResponse;

  /** 使用到的模块 */
  modules: string[];

  /** 使用到的扩展脚本 */
  modulescripts: string[];

  /** 使用到的扩展样式表 */
  modulestyles: string[];

  /** @todo 确定格式 */
  jsconfigvars: object;

  /** @todo 确定格式 */
  encodedjsconfigvars: any[];

  /** 页面状态指示器 */
  indicators: ApiParseIndicator[]

  /** 被解析的wiki文本 */
  wikitext: TextResponse;

  /** 解析器限制报告数据 */
  limitreportdata: ApiParseLimitReportData[];

  /** HTML格式的解析器限制报告 */
  limitreporthtml: TextResponse;

  /** 修订内容的XML解析树 */
  parsetree: TextResponse;
}

/**
 * 通过API解析文本（`action=parse`）响应数据
 */
export interface ApiParseResponse extends ApiResponse {
  parse: ApiParseResult;
}
