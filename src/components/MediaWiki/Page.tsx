import React, {
  type AnchorHTMLAttributes,
  type FC,
} from 'react';
import clsx from 'clsx';

const wgArticlePath = mw.config.get('wgArticlePath');

export interface SpecialPageLinkProps {
  logtype: string;
}

export const SpecialPageLink: FC<SpecialPageLinkProps> = ({
  logtype,
}) => {
  const logEventMeaning = {
    move: '移动',
    'delete': '删除',
    block: '封禁',
    rights: '用户权限',
    contentmodel: '内容模型更改',
  };

  return (
    <>
      （
      <a
        href={wgArticlePath.replace('$1', `Special:日志/${logtype}`)}
        title={`Special:日志/${logtype}`}
      >
        {logEventMeaning[logtype] ?? logtype}日志
      </a>
      ）
    </>
  );
};

export interface MWTitleProps {
  title: string;
  redirect?: boolean;
}

/** 页面链接 */
export const MWTitle = ({
  title,
  redirect = false,
}) => {
  return (
    <span className='mw-title'>
      <a
        href={wgArticlePath.replace('$1', title)}
        className={clsx(redirect && 'mw-redirect', 'mw-changeslist-title')}
        title={title}
      >
        {title}
      </a>
    </span>
  );
}
  ;
export interface HistoryLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  /** 页面标题 */
  title: string;
  /** 页面id */
  pageid: number | string;
}

/** 页面历史链接 */
export const HistoryLink: FC<HistoryLinkProps> = ({
  title,
  pageid,
  ...rest
}) => {
  const wgScript = mw.config.get('wgScript');
  const search = {
    title,
    curid: `${pageid}`,
    action: 'history',
  };
  return (
    <a
      {...rest}
      href={`${wgScript}?${(new URLSearchParams(search)).toString()}`}
      title={title}
    >
      历史
    </a>
  );
};
