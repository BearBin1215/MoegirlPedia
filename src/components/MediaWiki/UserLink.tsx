import React, {
  type AnchorHTMLAttributes,
  type FC,
} from 'react';
import classNames from 'classnames';

export interface UserLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  user: string;
  userid: number;
}

const UserLink: FC<UserLinkProps> = ({
  user,
  userid,
  ...rest
}) => {
  const wgArticlePath = mw.config.get('wgArticlePath');
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
  )
};

export default UserLink;
