import React, { useState } from 'react';
import classNames from 'classnames';
import ChangeslistLine, { ChangeFlag, ChangeDiff, type ChangeslistLineProps } from './ChangeslistLine';

interface ChangeslistLineCollapseProps {
  /** 要合并的最近更改合集 */
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
    'wgUserId',
  ]);

  const [{
    title,
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
    'mw-changeslist-ns0-冲田三叶',
    'mw-changeslist-line-not-watched',
    expanded ? '' : 'mw-changeslist-line-not-watched mw-collapsed',
  );

  const toggleClassName = classNames(
    'mw-collapsible-toggle',
    'mw-collapsible-arrow',
    'mw-enhancedchanges-arrow',
    'mw-enhancedchanges-arrow-space',
    expanded ? 'mw-collapsible-toggle-expanded' : 'mw-collapsible-toggle-collapsed',
  );

  const lastDate = new Date(timestamp);

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
            {lastDate.getHours()}:{lastDate.getMinutes()}
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
            <a
              className='mw-changeslist-groupdiff'
              href={`${wgScript}?title=${title}&curid=${pageid}&diff=${revid}&oldid=${oldid}`}
            >
              {changes.length}次更改
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
            <ChangeDiff
              oldlen={oldlen}
              newlen={newlen}
            />
            <span className='changedby'>
              [

              ]
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default ChangeslistLineCollapse;
