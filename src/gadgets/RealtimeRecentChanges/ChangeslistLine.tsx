import React, { createElement } from 'react';
import classNames from 'classnames';
import { HistoryLink, UserLink } from '@/components/MediaWiki';

export interface ChangeFlagProps {
  /** 该编辑是否创建了新页面 */
  'new'?: boolean;
  /** 是否为小编辑 */
  minor?: boolean;
  /** 是否为机器人编辑 */
  bot?: boolean;
  /** 是否未巡查 */
  unpatrolled?: boolean;
}

export interface ChangeDiffProps {
  /** 更改前长度 */
  oldlen: number;
  /** 更改后长度 */
  newlen: number;
}

export interface ChangeslistLineProps extends ChangeFlagProps, ChangeDiffProps {
  /** 页面标题 */
  title: string;
  /** 修订版本ID */
  revid: number;
  /** 页面ID */
  pageid: number;
  /** 旧版本ID */
  oldid: number;
  /** 时间戳 */
  timestamp: string | Date;
  /** 名字空间 */
  ns: number;
  /** 是否已巡查 */
  patrolled?: boolean;
  /** 是否为自动巡查 */
  autopatrolled?: boolean;
  /** 是否为重定向 */
  redirect?: boolean;
  /** 是否为一组同页同类编辑的最新一条 */
  last?: boolean;
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

const Separator: React.FC = () => (
  <span className='mw-changeslist-separator'>. .</span>
);

/** 渲染编辑行的标记 */
const ChangeFlag: React.FC<ChangeFlagProps> = ({
  'new': isNew,
  minor,
  bot,
  unpatrolled = false,
}) => {
  return (
    <>
      {isNew ? <abbr className='newpage' title='该编辑创建了新页面'>新</abbr> : '\u00A0'}
      {minor ? <abbr className='minoredit' title='该编辑为小编辑'>小</abbr> : '\u00A0'}
      {bot ? <abbr className='botedit' title='该编辑由机器人执行'>机</abbr> : '\u00A0'}
      {unpatrolled ? <abbr className='unpatrolled' title='该编辑尚未巡查'>!</abbr> : '\u00A0'}
      {'\u00A0'}
    </>
  );
};

/** 渲染当前编辑字节差异 */
const ChangeDiff: React.FC<ChangeDiffProps> = ({ newlen, oldlen }) => {
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

  return createElement(diffNumTag, {
    dir: 'ltr',
    className: diffNumClassName,
    title: `更改后有${newlen.toLocaleString()}字节`,
  }, `（${diffLen > 0 ? '+' : ''}${diffLen.toLocaleString()}）`);
};

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
            <ChangeFlag
              new={isNew}
              minor={minor}
              bot={bot}
              unpatrolled={unpatrolled}
            />
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
            {isNew ? '差异' : (
              <a
                className='mw-changeslist-diff'
                href={`${wgScript}?title=${title}&curid=${pageid}&diff=${revid}&oldid=${oldid}`}
              >
                差异
              </a>
            )}
            {'\u00A0|\u00A0'}
            <HistoryLink
              title={title}
              pageid={pageid}
              className='mw-changeslist-history'
            />
            {'）\u00A0'}
            <Separator />
            <ChangeDiff
              oldlen={oldlen}
              newlen={newlen}
            />
            {'\u200E\u00A0'}
            <Separator />
            <UserLink
              user={user}
              userid={userid}
            />
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
              <span className='mw-tag-markers'>
                （
                <a href='/Special:标签' title='Special:标签'>{tags.length}个标签</a>
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

export { Separator, ChangeFlag, ChangeDiff };
export default ChangeslistLine;
