import React, {
  type AnchorHTMLAttributes,
  type FC,
} from 'react';
import classNames from 'classnames';

const wgArticlePath = mw.config.get('wgArticlePath');

export interface UserLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  user: string;
  userid: number;
}

export const UserLink: FC<UserLinkProps> = ({
  user,
  userid,
  ...rest
}) => {
  const className = classNames('mw-userlink', rest.className);

  return (
    <a
      {...rest}
      href={wgArticlePath.replace('$1', `User:${user}`)}
      className={className}
      title={`User:${user}`}
      data-user-id={userid}
      data-user-avatar={`https://img.moegirl.org.cn/common/avatars/${userid}/128.png`}
    >
      <bdi>{user}</bdi>
    </a>
  );
};

export interface UserToolLinksProps {
  user: string;
}

export const UserToolLinks: FC<UserToolLinksProps> = ({ user }) => {
  return (
    <span className='mw-usertoollinks'>
      （
      <a
        href={wgArticlePath.replace('$1', `User_talk:${user}`)}
        className='mw-usertoollinks-talk'
        title={`User talk:${user}`}
      >
        讨论
      </a>
      {' | '}
      <a
        href={wgArticlePath.replace('$1', `/Special:用户贡献/${user}`)}
        className='mw-usertoollinks-contribs'
        title={`Special:用户贡献/${user}`}
      >
        贡献
      </a>
      ）
    </span>
  );
};
