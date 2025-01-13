import React, { useState, useMemo } from 'react';
import classNames from 'classnames';
import {
  MWTitle,
  HistoryLink,
  SpecialPageLink,
  UserLink,
  UserToolLinks,
} from '@/components/MediaWiki';
import ChangeslistLine, {
  getLineClassName,
  Separator,
  ChangeFlags,
  ChangeDiff,
  ChangeTagMarkers,
  type ChangeslistLineProps,
} from './ChangeslistLine';
import LogText from './LogText';

export interface ChangeslistLineCollapseProps {
  /** 要合并的最近更改记录集 */
  changes: ChangeslistLineProps[];
  /** 是否默认展开 */
  defaultExpanded?: boolean;
}

const wgScript = mw.config.get('wgScript');

/** 合并相同页面编辑 */
const ChangeslistLineCollapse: React.FC<ChangeslistLineCollapseProps> = ({
  changes,
  defaultExpanded = false,
}) => {
  // 确保只有超过2条编辑才生成折叠的列表
  if (changes.length === 0) {
    return null;
  }
  if (changes.length === 1) {
    return <ChangeslistLine {...changes[0]} />;
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
    type = 'edit',
    logtype,
  }] = changes; // 需要的最新编辑数据

  const {
    old_revid,
    oldlen,
  } = changes.at(-1)!; // 需要的最旧编辑数据

  const className = classNames(
    'mw-collapsible',
    'mw-enhanced-rc',
    'mw-changeslist-line',
    `mw-changeslist-${type}`,
    type === 'log'
      ? `mw-changeslist-log-${logtype}`
      : `mw-changeslist-ns${ns}-${title}`,
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
    const editors: Record<string, { id: number | string; editTimes: number }> = {};
    for (const { user, userid } of changes) {
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
            {type === 'log' ? (
              <span className='mw-rc-unwatched'>
                <SpecialPageLink logtype={logtype} />
              </span>
            ) : (
              <>
                <MWTitle title={title} redirect={redirect} />
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
              </>
            )}
            <Separator />
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
          const changeDate = moment.utc(change.timestamp);
          /** 版本链接、与当前差异、与之前差异链接共用参数 */
          const commonSearch = {
            title: change.title,
            curid: `${change.pageid}`,
            oldid: `${change.old_revid}`,
          };
          const revisionSearch = new URLSearchParams(commonSearch);
          const curSearch = new URLSearchParams({
            ...commonSearch,
            diff: '0',
          });
          const preSearch = new URLSearchParams({
            ...commonSearch,
            diff: `${change.revid}`,
          });
          return (
            <tr
              key={change.revid}
              className={getLineClassName(change)}
              data-mw-logid={change.logid}
              data-mw-revid={change.revid}
              data-mw-ts={changeDate.format('YYYYMMDDHHmmss')}
              data-mw-logaction={change.logid ? `${logtype}/${change.logaction}` : void 0}
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
                {type === 'log' ? (
                  <span className='mw-enhanced-rc-time'>
                    {changeDate.local().format('HH:mm')}
                  </span>
                ) : (
                  <>
                    <span className='mw-enhanced-rc-time'>
                      <a
                        href={`${wgScript}?${revisionSearch.toString()}`}
                        title={change.title}
                      >
                        {changeDate.local().format('HH:mm')}
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
                  </>
                )}
                <Separator />
                <UserLink
                  user={change.user}
                  userid={change.userid}
                />
                <UserToolLinks user={change.user} />
                {type === 'log' && (
                  <LogText {...change} />
                )}
                {change.parsedcomment && (
                  <span
                    className='comment'
                    dangerouslySetInnerHTML={{ __html: `（${change.parsedcomment}）` }}
                  />
                )}
                <ChangeTagMarkers tags={change.tags} />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default ChangeslistLineCollapse;
