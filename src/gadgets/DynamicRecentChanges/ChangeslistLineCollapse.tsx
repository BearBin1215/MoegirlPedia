import React, { useState, useMemo } from 'react';
import classNames from 'classnames';
import { HistoryLink, UserLink, UserToolLinks } from '@/components/MediaWiki';
import ChangeslistLine,
{
  getLineClassName,
  Separator,
  ChangeFlags,
  ChangeDiff,
  ChangeTagMarkers,
  type ChangeslistLineProps,
} from './ChangeslistLine';

export interface ChangeslistLineCollapseProps {
  /** 要合并的最近更改记录集 */
  changes: ChangeslistLineProps[];
  /** 是否默认展开 */
  defaultExpanded?: boolean;
  /** 标签->描述 */
  tagMeaningsMap?: Record<string, string>;
}

const {
  wgScript,
  wgArticlePath,
} = mw.config.get([
  'wgScript',
  'wgArticlePath',
]);

/** 合并相同页面编辑 */
const ChangeslistLineCollapse: React.FC<ChangeslistLineCollapseProps> = ({
  changes,
  tagMeaningsMap = {},
  defaultExpanded = false,
}) => {
  // 确保只有超过2条编辑才生成折叠的列表
  if (changes.length === 0) {
    return null;
  }
  if (changes.length === 1) {
    return <ChangeslistLine tagMeaningsMap={tagMeaningsMap} {...changes[0]} />;
  }

  const [expanded, setExpanded] = useState(defaultExpanded);

  const [{
    title,
    ns,
    redirect,
    timestamp,
    pageid,
    revid,
    newlen,
  }] = changes; // 需要的最新编辑数据

  const {
    old_revid,
    oldlen,
  } = changes.at(-1)!; // 需要的最旧编辑数据

  const className = classNames(
    'mw-collapsible',
    'mw-enhanced-rc',
    'mw-changeslist-line',
    'mw-changeslist-edit',
    `mw-changeslist-ns${ns}-${title}`,
    'mw-changeslist-line-not-watched',
    !expanded && 'mw-collapsed',
  );

  const toggleClassName = classNames(
    'mw-collapsible-toggle',
    'mw-collapsible-arrow',
    'mw-enhancedchanges-arrow',
    'mw-enhancedchanges-arrow-space',
    expanded ? 'mw-collapsible-toggle-expanded' : 'mw-collapsible-toggle-collapsed',
  );

  const lastDate = moment.utc(timestamp);

  const changeBy = useMemo(() => {
    const editors: Record<string, { id: number; editTimes: number }> = {};
    for (const { user, userid } of changes.toReversed()) {
      if (user in editors) {
        editors[user].editTimes++;
      } else {
        editors[user] = { id: userid, editTimes: 1 };
      }
    }
    return editors;
  }, [changes]);

  const diffSearch = new URLSearchParams({
    title,
    curid: `${pageid}`,
    diff: `${revid}`,
    oldid: `${old_revid}`,
  });

  return (
    <table
      data-mw-ts={lastDate.format('YYYYMMDDHHmmss')}
      className={className}
    >
      <tbody>
        <tr>
          <td>
            <span
              className={toggleClassName}
              tabIndex={0}
              onClick={() => setExpanded(!expanded)}
            />
          </td>
          <td className='mw-changeslist-line-prefix' />
          <td className='mw-enhanced-rc'>
            <ChangeFlags
              new={changes.at(-1)?.new}
              minor={changes.every(({ minor }) => minor)}
              bot={changes.every(({ bot }) => bot)}
              unpatrolled={changes.some(({ unpatrolled }) => unpatrolled)}
            />
            &nbsp;
            {lastDate.local().format('HH:mm')}
            &nbsp;
          </td>
          <td className='mw-changeslist-line-inner'>
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
            {changes.at(-1)?.new ? `${changes.length}次更改` : (
              <a
                className='mw-changeslist-groupdiff'
                href={`${wgScript}?${diffSearch.toString()}`}
              >
                {changes.length}次更改
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
            <span className='changedby'>
              [
              {Object.entries(changeBy).map(([user, { id, editTimes }], index) => (
                <>
                  <UserLink
                    user={user}
                    userid={id}
                  />
                  {'\u200E'}
                  {editTimes > 1 && ` （${editTimes}×）`}
                  {index < Object.keys(changeBy).length - 1 && '；'}
                </>
              ))}
              ]
            </span>
          </td>
        </tr>
        {changes.map((change) => {
          const changeDate = moment(change.timestamp);
          const revisionSearch = new URLSearchParams({
            title: change.title,
            curid: `${change.pageid}`,
            oldid: `${change.old_revid}`,
          });
          const curSearch = new URLSearchParams({
            title: change.title,
            curid: `${change.pageid}`,
            diff: '0',
            oldid: `${change.old_revid}`,
          });
          const preSearch = new URLSearchParams({
            title: change.title,
            curid: `${change.pageid}`,
            diff: `${change.revid}`,
            oldid: `${change.old_revid}`,
          });
          return (
            <tr
              key={change.revid}
              className={getLineClassName(change)}
              data-mw-revid={change.revid}
              data-mw-ts={changeDate.utc().format('YYYYMMDDHHmmss')}
            >
              <td />
              <td />
              <td className='mw-enhanced-rc'>
                <ChangeFlags
                  new={change.new}
                  minor={change.minor}
                  bot={change.bot}
                  unpatrolled={change.unpatrolled}
                />
                &nbsp;
              </td>
              <td
                className='mw-enhanced-rc-nested'
                data-target-page={change.title}
              >
                <span className='mw-enhanced-rc-time'>
                  <a
                    href={`${wgScript}?${revisionSearch.toString()}`}
                    title={change.title}
                  >
                    {changeDate.format('HH:mm')}
                  </a>
                </span>
                {' （'}
                <a
                  className='mw-changeslist-diff-cur'
                  href={`${wgScript}?${curSearch.toString()}`}
                >
                  当前
                </a>
                {' | '}
                <a
                  className='mw-changeslist-diff'
                  href={`${wgScript}?${preSearch.toString()}`}
                  title={change.title}
                >
                  之前
                </a>
                {'） '}
                <Separator />
                <ChangeDiff
                  oldlen={change.oldlen}
                  newlen={change.newlen}
                />
                {'\u200E '}
                <Separator />
                <UserLink
                  user={change.user}
                  userid={change.userid}
                />
                <UserToolLinks user={change.user} />
                {change.parsedcomment && (
                  <span
                    className='comment'
                    dangerouslySetInnerHTML={{ __html: `（${change.parsedcomment}）` }}
                  />
                )}
                <ChangeTagMarkers
                  tags={change.tags}
                  tagMeaningsMap={change.tagMeaningsMap}
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default ChangeslistLineCollapse;
