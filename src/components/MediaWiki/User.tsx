import React, {
  createContext,
  useContext,
  type FC,
} from 'react';

export type CachedUserGroups = Record<string, string[]>;

const wgArticlePath = mw.config.get('wgArticlePath');

/** 使用context传递部分参数，以免props冗余 */
export const UserLinkContext = createContext({
  /** 是否显示头像 */
  showAvatar: false,
  /** 是否显示用户组标识（从localStorage）读取 */
  showGroup: false,
  /** usergroup小工具缓存的用户组数据 */
  userGroups: {} as CachedUserGroups,
});

export interface UserLinkProps {
  user: string;
  userid: number;
  showAvatar?: boolean;
  showGroup?: boolean;
  userGroups?: CachedUserGroups;
}

/** 用户页链接 */
export const UserLink: FC<UserLinkProps> = (props) => {
  const userLinkContext = useContext(UserLinkContext);
  const {
    user,
    userid,
    showAvatar = userLinkContext.showAvatar,
    showGroup = userLinkContext.showGroup,
    userGroups = userLinkContext.userGroups,
  } = props;
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
        href={wgArticlePath.replace('$1', `User:${user}`)}
        className='mw-userlink'
        title={`User:${user}`}
        data-user-id={userid}
        data-user-avatar={`https://img.moegirl.org.cn/common/avatars/${userid}/128.png`}
      >
        <bdi>{user}</bdi>
      </a>
      {showGroup && Object.entries(userGroups)
        .filter((group) => group[1].includes(user))
        .map(([group]) => (
          <sup key={group} className={`markrights-${group}`} />
        ))}
    </>
  );
};

export interface UserToolLinksProps {
  user: string;
}

/** （讨论 | 贡献）链接 */
export const UserToolLinks: FC<UserToolLinksProps> = ({ user }) => (
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
      href={wgArticlePath.replace('$1', `Special:用户贡献/${user}`)}
      className='mw-usertoollinks-contribs'
      title={`Special:用户贡献/${user}`}
    >
      贡献
    </a>
    ）
  </span>
);
