import React, {
  type AnchorHTMLAttributes,
  type FC,
} from 'react';

export interface HistoryLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  title: string;
  pageid: number;
}

/** 页面历史链接 */
const HistoryLink: FC<HistoryLinkProps> = ({
  title,
  pageid,
  ...rest
}) => {
  const wgScript = mw.config.get('wgScript');
  return (
    <a
      {...rest}
      href={`${wgScript}?title=${title}&curid=${pageid}&action=history`}
      title={title}
    >
      历史
    </a>
  )
}

export default HistoryLink;
