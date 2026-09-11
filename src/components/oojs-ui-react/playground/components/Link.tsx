import React, { type ReactNode } from 'react';

interface LinkProps {
  href: string;
  children?: ReactNode;
}

function Link({ href, children }: LinkProps) {
  return (
    <a
      className='link'
      href={href}
      target='_blank'
      rel='noopener noreferrer'
    >
      {children}
    </a>
  );
}

Link.displayName = 'Link';

export default Link;
