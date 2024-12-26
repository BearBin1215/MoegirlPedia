import React, { createElement } from 'react';
import classNames from 'classnames';
import {
  MWTitle,
  HistoryLink,
  SpecialPageLink,
  UserLink,
  UserToolLinks,
} from '@/components/MediaWiki';
import { type MomentInput } from 'moment';
import LogText from './LogText';

interface ChangeFlagsProps {
  /** 该编辑是否创建了新页面 */
  'new'?: boolean;
  /** 是否为小编辑 */
  minor?: boolean;
  /** 是否为机器人编辑 */
  bot?: boolean;
  /** 是否未巡查 */
  unpatrolled?: boolean;
}

interface ChangeDiffProps {
  /** 更改前长度 */
  oldlen: number;
  /** 更改后长度 */
  newlen: number;
}

interface ChangeTagProps {
  /** 标签 */
  tags?: string[];
  /** 标签->描述 */
  tagMeaningsMap?: Record<string, string>;
}

export interface ChangeslistLogProps {
  /** 日志id */
  logid: number | string;
  /** 日志类型 */
  logtype: string;
  /** 日志操作 */
  logaction: string;
  /** 日志参数，如移动日志的前后页面等 */
  logparams: Record<string, any>;
}

export interface ChangeslistLineProps extends
  ChangeFlagsProps,
  ChangeDiffProps,
  ChangeTagProps,
  ChangeslistLogProps {
  /** 更改记录类型 */
  type?: 'edit' | 'new' | 'log';
  /** 更改记录id */
  rcid: number | string;
  /** 页面标题 */
  title: string;
  /** 页面ID */
  pageid: number | string;
  /** 修订版本ID */
  revid: number | string;
  /** 旧版本ID */
  old_revid: number | string;
  /** 时间戳 */
  timestamp: MomentInput;
  /** 名字空间 */
  ns: number | string;
  /** 是否已巡查 */
  patrolled?: boolean;
  /** 是否为自动巡查 */
  autopatrolled?: boolean;
  /** 老编辑者 */
  experienced?: boolean;
  /** 是否为重定向 */
  redirect?: boolean;
  /** 是否为一组同页同类编辑的最新一条 */
  last?: boolean;
  /** 做出编辑的用户 */
  user: string;
  /** 做出编辑的用户ID */
  userid: number | string;
  /** 解析后的编辑摘要 */
  parsedcomment: string;
}

const {
  wgScript,
  wgUserId,
} = mw.config.get([
  'wgScript',
  'wgUserId',
]);

/** 生成更改记录行的类名 */
export const getLineClassName = ({
  type = 'edit',
  ns,
  title,
  userid,
  bot,
  minor,
  last,
  'new': isNew,
  patrolled = true,
  autopatrolled = false,
  unpatrolled = false,
  experienced = true,
  logtype,
}: ChangeslistLineProps) => classNames(
  'mw-changeslist-line',
  `mw-changeslist-${type}`,
  `mw-changeslist-ns${ns}-${title}`,
  `mw-changeslist-ns-${ns}`,
  type === 'log'
    ? `mw-changeslist-log-${logtype}`
    : `mw-changeslist-ns${ns}-${title}`,
  'mw-changeslist-user-registered',
  experienced
    ? 'mw-changeslist-user-experienced'
    : 'mw-changeslist-user-newcomer',
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

const Separator: React.FC = () => (
  <>
    {' '}
    <span className='mw-changeslist-separator'>. .</span>
    {' '}
  </>
);

/** 渲染编辑行的标记 */
const ChangeFlags: React.FC<ChangeFlagsProps> = ({
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
    </>
  );
};

/** 渲染当前编辑字节差异 */
const ChangeDiff: React.FC<ChangeDiffProps> = ({ newlen, oldlen }) => {
  const diffLen = newlen - oldlen;

  /** 差异字节数元素的类名，按照正、负、零区分 */
  let diffNumClassName = 'mw-plusminus-null';
  if (diffLen > 0) {
    diffNumClassName = 'mw-plusminus-pos';
  } else if (diffLen < 0) {
    diffNumClassName = 'mw-plusminus-neg';
  }

  // 差异字节数不超过500为span，超过500为strong
  return createElement(Math.abs(diffLen) > 500 ? 'strong' : 'span', {
    dir: 'ltr',
    className: diffNumClassName,
    title: `更改后有${newlen.toLocaleString()}字节`,
  }, `（${diffLen > 0 ? '+' : ''}${diffLen.toLocaleString()}）`);
};

export const ChangeTagMarkers: React.FC<ChangeTagProps> = ({
  tags = [],
  tagMeaningsMap = {},
}) => {
  return tags.length > 0 && (
    <span className='mw-tag-markers'>
      （
      <a href='/Special:标签' title='Special:标签'>{tags.length}个标签</a>
      ：
      {tags.map((tag, index) => (
        <>
          <span
            key={tag}
            className={`mw-tag-marker mw-tag-marker-${tag}`}
          >
            {tagMeaningsMap[tag] ?? tag}
          </span>
          {index < tags.length - 1 && '、'}
        </>
      ))}
      ）
    </span>
  );
};

const ChangeslistLine: React.FC<ChangeslistLineProps> = (props) => {
  const {
    type = 'edit',
    title,
    revid,
    logid,
    pageid,
    old_revid,
    timestamp,
    'new': isNew,
    minor,
    bot,
    unpatrolled = false,
    redirect,
    oldlen,
    newlen,
    user,
    userid,
    parsedcomment,
    tags = [],
    tagMeaningsMap = {},
    logtype,
    logaction,
  } = props;

  const date = moment.utc(timestamp);

  const diffSearch = new URLSearchParams({
    title,
    curid: `${pageid}`,
    diff: `${revid}`,
    oldid: `${old_revid}`,
  });

  return (
    <table
      data-mw-revid={revid}
      data-mw-logid={logid}
      data-mw-logaction={logid ? `${logtype}/${logaction}` : void 0}
      data-mw-ts={date.utc().format('YYYYMMDDHHmmss')}
      className={getLineClassName(props)}
    >
      <tbody>
        <tr>
          <td>
            <span className='mw-enhancedchanges-arrow-space' />
          </td>
          <td className='mw-changeslist-line-prefix' />
          <td className='mw-enhanced-rc'>
            <ChangeFlags
              new={isNew}
              minor={minor}
              bot={bot}
              unpatrolled={unpatrolled}
            />
            &nbsp;
            {date.local().format('HH:mm')}
            &nbsp;
          </td>
          <td className='mw-changeslist-line-inner' data-target-page={title}>
            {type === 'log' ? (
              <SpecialPageLink logtype={logtype} />
            ) : (
              <>
                <MWTitle title={title} redirect={redirect} />
                {'\u200E （'}
                {isNew ? '差异' : (
                  <a
                    className='mw-changeslist-diff'
                    href={`${wgScript}?${diffSearch.toString}`}
                  >
                    差异
                  </a>
                )}
                {' | '}
                <HistoryLink
                  title={title}
                  pageid={pageid}
                  className='mw-changeslist-history'
                />
                {'） '}
                <Separator />
                <ChangeDiff
                  oldlen={oldlen}
                  newlen={newlen}
                />
                {'\u200E '}
              </>
            )}
            <Separator />
            <UserLink
              user={user}
              userid={userid}
            />
            <UserToolLinks user={user} />
            {type === 'log' && (
              <LogText {...props} />
            )}
            {parsedcomment && (
              <span
                className='comment'
                dangerouslySetInnerHTML={{ __html: `（${parsedcomment}）` }}
              />
            )}
            <ChangeTagMarkers
              tags={tags}
              tagMeaningsMap={tagMeaningsMap}
            />
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export { Separator, ChangeFlags, ChangeDiff };
export default ChangeslistLine;
