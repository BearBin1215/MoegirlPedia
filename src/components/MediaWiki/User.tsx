import React, {
  createContext,
  useContext,
  type AnchorHTMLAttributes,
  type FC,
} from 'react';
import classNames from 'classnames';

const wgArticlePath = mw.config.get('wgArticlePath');

/** 使用context传递是否显示头像，以免props冗余 */
export const ShowAvatarContext = createContext(false);

export interface UserLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  user: string;
  userid: number;
  showAvatar?: boolean;
}

/** 用户页链接 */
export const UserLink: FC<UserLinkProps> = ({
  user,
  userid,
  ...rest
}) => {
  const className = classNames('mw-userlink', rest.className);
  const showAvatar = rest.showAvatar ?? useContext(ShowAvatarContext);

  return (
    <>
      {showAvatar && (
        <a
          className='userlink-avatar'
          href={`https://commons.moegirl.org.cn/Special:ViewAvatar?user=${user}`}
          target='_blank'
          title='查看头像'
        >
          <img
            loading='lazy'
            src={`https://img.moegirl.org.cn/common/avatars/${userid}/128.png`}
            alt={`${user}的头像`}
            className='userlink-avatar-small'
          />
        </a>
      )}
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
    </>
  );
};

export interface UserToolLinksProps {
  user: string;
}

/** （讨论 | 贡献）链接 */
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
