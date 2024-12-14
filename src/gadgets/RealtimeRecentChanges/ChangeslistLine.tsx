import React, { createElement } from 'react';
import classNames from 'classnames';

export interface ChangeslistLineProps {
  /** 页面标题 */
  title: string;
  /** 修订版本ID */
  revid: number;
  /** 页面ID */
  pageid: number;
  /** 旧版本ID */
  oldid: number;
  /** 时间戳 */
  timestamp: string;
  /** 名字空间 */
  ns: number;
  /** 该编辑是否创建了新页面 */
  'new'?: boolean;
  /** 是否为小编辑 */
  minor?: boolean;
  /** 是否为机器人编辑 */
  bot?: boolean;
  /** 是否已巡查 */
  patrolled?: boolean;
  /** 是否为自动巡查 */
  autopatrolled?: boolean;
  /** 是否未巡查 */
  unpatrolled?: boolean;
  /** 是否为重定向 */
  redirect?: boolean;
  /** 是否为一组同页同类编辑的最新一条 */
  last?: boolean;
  /** 更改前长度 */
  oldlen: number;
  /** 更改后长度 */
  newlen: number;
  /** 做出编辑的用户 */
  user: string;
  /** 做出编辑的用户ID */
  userid: number;
  /** 解析后的编辑摘要 */
  parsedcomment: string;
  /** 标签 */
  tags?: string[];
  /** 标签->描述 */
  tagMeaningsMap?: Record<string, string>;
}

const ChangeslistLine: React.FC<ChangeslistLineProps> = ({
  title,
  revid,
  pageid,
  oldid,
  timestamp,
  ns,
  'new': isNew,
  minor,
  bot,
  patrolled = true,
  autopatrolled = false,
  unpatrolled = false,
  redirect,
  last,
  oldlen,
  newlen,
  user,
  userid,
  parsedcomment,
  tags = [],
  tagMeaningsMap = {},
}) => {
  const {
    wgScript,
    wgArticlePath,
    wgUserId,
  } = mw.config.get([
    'wgScript',
    'wgArticlePath',
    'wgUserId',
  ]);

  const className = classNames(
    'mw-changeslist-line',
    'mw-changeslist-edit',
    `mw-changeslist-ns${ns}-${title}`,
    `mw-changeslist-ns-${ns}`,
    'mw-changeslist-line-not-watched',
    'mw-changeslist-user-registered',
    'mw-changeslist-user-newcomer', // mw-changeslist-user-experienced
    wgUserId === userid ? 'mw-changeslist-self' : 'mw-changeslist-others',
    bot ? 'mw-changeslist-bot' : 'mw-changeslist-human',
    minor ? 'mw-changeslist-minor' : 'mw-changeslist-major',
    last ? 'mw-changeslist-last' : 'mw-changeslist-previous',
    isNew ? 'mw-changeslist-src-mw-new' : 'mw-changeslist-src-mw-edit',
    patrolled && !autopatrolled && 'mw-changeslist-reviewstatus-manual',
    autopatrolled && 'mw-changeslist-reviewstatus-auto',
    unpatrolled && 'mw-changeslist-reviewstatus-unpatrolled',
    'mw-changeslist-notwatched',
    'mw-enhanced-rc',
  );

  const date = new Date(timestamp);

  const diffLen = newlen - oldlen;

  /** 差异字节数元素的标签，不到500为span，超过500为strong */
  let diffNumTag = 'span';
  if (Math.abs(diffLen) >= 500) {
    diffNumTag = 'string';
  }

  /** 差异字节数元素的类名，按照正、负、零区分 */
  let diffNumClassName = 'mw-plusminus-null';
  if (diffLen > 0) {
    diffNumClassName = 'mw-plusminus-pos';
  } else if (diffLen < 0) {
    diffNumClassName = 'mw-plusminus-neg';
  }

  return (
    <table
      data-mw-revid={revid}
      data-mw-ts={date.getTime()}
      className={className}
    >
      <tbody>
        <tr>
          <td>
            <span className='mw-enhancedchanges-arrow-space' />
          </td>
          <td className='mw-changeslist-line-prefix' />
          <td className='mw-enhanced-rc'>
            {isNew ? <abbr className='newpage' title='该编辑创建了新页面'>新</abbr> : '\u00A0'}
            {minor ? <abbr className='minoredit' title='该编辑为小编辑'>小</abbr> : '\u00A0'}
            {bot ? <abbr className='botedit' title='该编辑由机器人执行'>机</abbr> : '\u00A0'}
            {unpatrolled ? <abbr className='unpatrolled' title='该编辑尚未巡查'>!</abbr> : '\u00A0'}
            {'\u00A0'}
            {date.getHours()}:{date.getMinutes()}
            {'\u00A0'}
          </td>
          <td className='mw-changeslist-line-inner' data-target-page={title}>
            <span className='mw-title'>
              <a
                href={wgArticlePath.replace('$1', title)}
                className={classNames(redirect && 'mw-redirect', 'mw-changeslist-title')}
                title={title}
              >
                {title}
              </a>
            </span>
            {'\u200E （'}
            <a
              className='mw-changeslist-diff'
              href={`${wgScript}?title=${title}&curid=${pageid}&diff=${revid}&oldid=${oldid}`}
            >
              差异
            </a>
            {'\u00A0|\u00A0'}
            <a
              href={`${wgScript}?title=${title}&curid=${pageid}&action=history`}
              className='mw-changeslist-history'
              title={title}
            >
              历史
            </a>
            {'）\u00A0'}
            <span className='mw-changeslist-separator'>. .</span>
            {createElement(diffNumTag, {
              dir: 'ltr',
              className: diffNumClassName,
              title: `更改后有${newlen.toLocaleString()}字节`,
            }, `（${diffLen > 0 ? '+' : ''}${diffLen.toLocaleString()}）`)}
            {'\u200E\u00A0'}
            <span className='mw-changeslist-separator'>. .</span>
            <a
              href={wgArticlePath.replace('$1', `User:${user}`)}
              className='mw-userlink'
              title={`User:${user}`}
              data-user-id={userid}
              data-user-avatar={`https://img.moegirl.org.cn/common/avatars/${userid}/128.png?ver=0`}
            >
              <bdi>{user}</bdi>
            </a>
            <span className='mw-usertoollinks'>
              （
              <a
                href={`/User_talk:${user}`}
                className='mw-usertoollinks-talk'
                title={`User talk:${user}`}
              >
                讨论
              </a>
              {'\u00A0|\u00A0'}
              <a
                href={`/Special:用户贡献/${user}`}
                className='mw-usertoollinks-contribs'
                title={`Special:用户贡献/${user}`}
              >
                贡献
              </a>
              ）
            </span>
            {parsedcomment && (
              <span
                className='comment'
                dangerouslySetInnerHTML={{ __html: `（${parsedcomment}）` }}
              />
            )}
            {tags.length > 0 && (
              <span className="mw-tag-markers">
                （
                <a href="/Special:标签" title="Special:标签">{tags.length}个标签</a>
                ：
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className={`mw-tag-marker mw-tag-marker-${tag}`}
                  >
                    {tagMeaningsMap[tag] ?? tag}
                  </span>
                ))}
                ）
              </span>
            )}
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export { ChangeslistLine };
