import React, { useState, useMemo } from 'react';
import classNames from 'classnames';
import { HistoryLink, UserLink } from '@/components/MediaWiki';
import ChangeslistLine, { Separator, ChangeFlag, ChangeDiff, type ChangeslistLineProps } from './ChangeslistLine';

interface ChangeslistLineCollapseProps {
  /** 要合并的最近更改记录集 */
  changes: ChangeslistLineProps[];
  /** 是否默认展开 */
  defaultExpanded?: boolean;
}

/** 合并相同页面编辑 */
const ChangeslistLineCollapse: React.FC<ChangeslistLineCollapseProps> = ({
  changes,
  defaultExpanded = false,
}) => {
  if (changes.length === 0) {
    return null;
  }
  if (changes.length === 1) {
    return <ChangeslistLine {...changes[0]} />;
  }

  const [expanded, setExpanded] = useState(defaultExpanded);

  const {
    wgScript,
    wgArticlePath,
  } = mw.config.get([
    'wgScript',
    'wgArticlePath',
  ]);

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
    oldid,
    oldlen,
  } = changes.at(-1)!; // 需要的最旧编辑数据

  const className = classNames(
    'mw-collapsible',
    'mw-enhanced-rc',
    'mw-changeslist-line',
    'mw-changeslist-edit',
    `mw-changeslist-ns${ns}-${title}`,
    'mw-changeslist-line-not-watched',
    expanded && 'mw-collapsed',
  );

  const toggleClassName = classNames(
    'mw-collapsible-toggle',
    'mw-collapsible-arrow',
    'mw-enhancedchanges-arrow',
    'mw-enhancedchanges-arrow-space',
    expanded ? 'mw-collapsible-toggle-expanded' : 'mw-collapsible-toggle-collapsed',
  );

  const lastDate = new Date(timestamp);

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

  return (
    <table
      data-mw-ts={lastDate.getTime()}
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
            <ChangeFlag
              new={changes.at(-1)?.new}
              minor={changes.every(({ minor }) => minor)}
              bot={changes.every(({ bot }) => bot)}
              unpatrolled={changes.some(({ unpatrolled }) => unpatrolled)}
            />
            {`${lastDate.getHours()}`.padStart(2, '0')}:{`${lastDate.getMinutes()}`.padStart(2, '0')}
            {'\u00A0'}
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
                href={`${wgScript}?title=${title}&curid=${pageid}&diff=${revid}&oldid=${oldid}`}
              >
                {changes.length}次更改
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
            <span className='changedby'>
              [
              {Object.entries(changeBy).map(([user, { id, editTimes }], index) => (
                <>
                  <UserLink
                    user={user}
                    userid={id}
                  />
                  {'\u200E'}
                  {editTimes > 1 && `\u00A0（${editTimes}×）`}
                  {index < Object.keys(changeBy).length - 1 && '；'}
                </>
              ))}
              ]
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default ChangeslistLineCollapse;
