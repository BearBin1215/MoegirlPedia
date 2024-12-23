import React, {
  type AnchorHTMLAttributes,
  type FC,
} from 'react';

export interface HistoryLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  /** 页面标题 */
  title: string;
  /** 页面id */
  pageid: number;
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
