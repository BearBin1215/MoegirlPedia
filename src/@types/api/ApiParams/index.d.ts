/**
 * @description mw.Api库请求接口类型定义
 * @copyright Wikimedia Foundation
 * @see https://doc.wikimedia.org/mediawiki-core/master/js/mw.Api.html
 */

/**
 * 要执行的操作类型
 */
export type Action =
  'abusefiltercheckmatch' |
  'abusefilterchecksyntax' |
  'abusefilterevalexpression' |
  'abusefilterunblockautopromote' |
  'antispoof' |
  'block' |
  'categorytree' |
  'changeauthenticationdata' |
  'checktoken' |
  'cirrus-config-dump' |
  'cirrus-mapping-dump' |
  'cirrus-settings-dump' |
  'clearhasmsg' |
  'clientlogin' |
  'compare' |
  'contributionscores' |
  'createaccount' |
  'cspreport' |
  'delete' |
  'echomarkread' |
  'echomarkseen' |
  'edit' |
  'emailuser' |
  'expandtemplates' |
  'feedcontributions' |
  'feedrecentchanges' |
  'feedwatchlist' |
  'filerevert' |
  'help' |
  'imagerotate' |
  'import' |
  'linkaccount' |
  'login' |
  'logout' |
  'managetags' |
  'mergehistory' |
  'move' |
  'opensearch' |
  'options' |
  'paraminfo' |
  'parse' |
  'patrol' |
  'protect' |
  'purge' |
  'query' |
  'removeauthenticationdata' |
  'resetpassword' |
  'revisiondelete' |
  'rollback' |
  'rsd' |
  'scribunto-console' |
  'setnotificationtimestamp' |
  'setpagelanguage' |
  'spamblacklist' |
  'stashedit' |
  'tag' |
  'thank' |
  'titleblacklist' |
  'transcodereset' |
  'unblock' |
  'undelete' |
  'unlinkaccount' |
  'upload' |
  'userrights' |
  'validatepassword' |
  'watch' |
  'wikilove' |
  'tokens';

/**
 * api请求类型
 */
export interface ApiParams {
  /**
   * 要执行的操作
   */
  action?: Action;

  /**
   * 输出的格式
   *
   * 默认：jsonfm
   */
  format?: 'json' | 'jsonfm' | 'xml' | 'xmlfm' | 'php' | 'none';

  /**
   * 最大延迟可被用于MediaWiki安装于数据库复制集中。
   * 要保存导致更多网站复制延迟的操作，此参数可使客户端等待直到复制延迟少于指定值时。
   * 万一发生过多延迟，错误代码maxlag会返回消息，例如等待$host中：延迟$lag秒。
   * @see https://www.mediawiki.org/wiki/Special:MyLanguage/Manual:Maxlag_parameter
   */
  maxlag?: number;

  /**
   * 设置`s-maxage` HTTP缓存控制头至这些秒。错误不会缓存。
   *
   * 默认：0
   */
  smaxage?: number;

  /**
   * 设置`max-age` HTTP缓存控制头至这些秒。错误不会缓存。
   *
   * 默认：0
   */
  maxage?: number;

  /** 如果设置为user就验证用户是否登录，或如果设置为bot就验证是否有机器人用户权限。 */
  assert?: 'user' | 'bot';

  /** 验证当前用户是命名用户。 */
  assertuser?: string;

  /** 任何在此提供的值将包含在响应中。可以用以区别请求。 */
  requestid?: string;

  /** 包含保存结果请求的主机名。 */
  servedby?: boolean;

  /** 在结果中包括当前时间戳。 */
  curtimestamp?: boolean;

  /** 包含在结果中用于uselang和errorlang的语言。 */
  responselanginfo?: boolean;

  /**
   * 当通过跨域名AJAX请求（CORS）访问API时，设置此作为起始域名。这必须包括在任何pre-flight请求中，
   * 并因此必须是请求的URI的一部分（而不是POST正文）。
   *
   * 对于已验证的请求，这必须正确匹配Origin标头中的原点之一，
   * 因此它已经设置为像https://en.wikipedia.org或https://meta.wikimedia.org的东西。
   * 如果此参数不匹配Origin页顶，就返回403错误响应。如果此参数匹配Origin页顶并且起点被白名单，
   * 将设置`Access-Control-Allow-Origin`和`Access-Control-Allow-Credentials`开头。
   *
   * 对于未验证的请求，会指定值*。这将导致`Access-Control-Allow-Origin`标头被设置，
   * 但`Access-Control-Allow-Credentials`将为false，且所有用户特定数据将受限制。
   */
  origin?: string;

  /**
   * 用于消息翻译的语言。
   * action=query&meta=siteinfo与siprop=languages
   * 可返回语言代码列表，或指定user以使用当前用户的语言设置，
   * 或指定content以使用此wiki的内容语言。
   *
   * 默认：'user'
   */
  uselang?: string;

  /**
   * 用于警告和错误文本输出的格式。
   *
   * 默认：'bc'
   */
  errorformat?: 'bc' | 'html' | 'none' | 'plaintext' | 'raw' | 'wikitext';

  /**
   * 用于警告和错误的语言。
   * action=query&meta=siteinfo带siprop=languages返回语言代码的列表，
   * 或指定content以使用此wiki的内容语言，
   * 或指定uselang以使用与uselang参数相同的值。
   */
  errorlang?: string;

  /**
   * 如果指定，错误文本将使用来自MediaWiki名字空间的本地自定义消息。
   */
  errorsuselocal?: boolean;

  /**
   * 仅在`format=json`时有效。
   *
   * 如果指定，将输出内容包裹在一个指定的函数调用中。
   * 出于安全考虑，所有用户相关的数据将被限制。
   */
  callback?: string;

  /**
   * 仅在`format=json`时有效。
   *
   * 如果指定，使用十六进制转义序列将大多数（但不是全部）
   * 非ASCII的字符编码为UTF-8，而不是替换它们。
   * 默认当`formatversion`不是1时。
   */
  utf8?: boolean;

  /**
   * 仅在`format=json`时有效。
   *
   * 如果指定，使用十六进制转义序列将所有非ASCII编码。
   * 默认当`formatversion`为1时。
   */
  ascii?: boolean;

  /**
   * 仅在`format=json`或`format=php`时有效。
   *
   * 输出格式：
   * - `1`：向后兼容格式（XML样式布尔值、用于内容节点的*键等）。
   * - `2`：实验现代格式。细节可能更改！
   * - `latest`：使用最新格式（当前为2），格式可能在没有警告的情况下更改。
   */
  formatversion?: '1' | '2' | 'latest';

  /**
   * 仅在`format=xml`时有效
   *
   * 如果指定，加入已命名的页面作为一个XSL样式表。
   * 值必须是在MediaWiki名字空间以.xsl为结尾的标题
   */
  xslt?: string;

  /**
   * 仅在`format=xml`时有效
   *
   * 如果指定，添加一个XML名字空间。
   */
  includexmlnamespace?: boolean;

  [key: string]: string | string[] | boolean | number | number[];
}
