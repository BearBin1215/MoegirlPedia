import React, { FC, type ReactNode } from 'react';

interface LinkProps {
  href: string;
  children?: ReactNode;
}

const Link: FC<LinkProps> = ({ href, children }) => (
  <a
    className='link'
    href={href}
    target='_blank'
    rel='noopener noreferrer'
  >
    {children}
  </a>
);

Link.displayName = 'Link';

export default Link;
