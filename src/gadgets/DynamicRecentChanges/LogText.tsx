import React, { useContext } from 'react';
import { UserLink } from '@/components/MediaWiki';
import ChangeslistLineContext from './ChangeslistLineContext';

interface LogTextProps {
  logtype: string;
  logaction: string;
  logparams: Record<string, any>;
  title: string;
}

const {
  wgScript,
  wgArticlePath,
} = mw.config.get([
  'wgScript',
  'wgArticlePath',
]);

const LogText: React.FC<LogTextProps> = ({
  logtype,
  logaction,
  logparams,
  title,
}) => {
  /** 从上下文读取用户组含义 */
  const { groupMeanings } = useContext(ChangeslistLineContext);
  if (logtype === 'move') {
    const searchParams = new URLSearchParams({
      title,
      redirect: 'no',
    });
    return (
      <>
        移动页面
        <a
          href={`${wgScript}?${searchParams.toString()}`}
          title=''
        >
          {title}
        </a>
        至
        <a
          href={wgArticlePath.replace('$1', logparams.target_title)}
          title=''
        >
          {logparams.target_title}
        </a>
        {logaction === 'move_redir' && '覆盖重定向'}
      </>
    );
  }

  if (logaction === 'delete') {
    const searchParams = new URLSearchParams({
      title,
      action: 'edit',
      redlink: '1',
    });
    return (
      <>
        删除页面
        <a
          href={`${wgScript}?${searchParams.toString()}`}
          title=''
        >
          {title}
        </a>
      </>
    );
  }

  if (logaction === 'revision') {
    return (
      <>
        更改页面
        <a
          href={`/${title}`}
          title=''
        >
          {title}
          的
          {logparams.ids.length}
          个版本的可见性：
          {logparams.old.bitmask ? '隐藏内容' : '公开内容'}
        </a>
      </>
    );
  }

  if (logaction === 'delete_redir') {
    return (
      <>
        通过覆盖删除重定向
        <a href={wgArticlePath.replace('', title)}>
          {title}
        </a>
      </>
    );
  }

  const groupMapping = (group: string) => groupMeanings[group] ?? group;

  if (logaction === 'rights') {
    return (
      <>
        已将
        <UserLink user={title} showAvatar={false} />
        的用户组从
        {logparams.oldgroups.map(groupMapping).join('、') || '（无）'}
        更改至
        {logparams.newgroups.map(groupMapping).join('、') || '（无）'}
      </>
    );
  }

  if (logaction === 'autopromote') {
    return (
      <>
        被自动地提升自
        {logparams.oldgroups.map(groupMapping).join('、') || '（无）'}
        至
        {logparams.newgroups.map(groupMapping).join('、') || '（无）'}
      </>
    );
  }

  if (logtype === 'contentmodel' && logaction === 'change') {
    return (
      <>
        将页面
        <a href={wgArticlePath.replace('$1', title)} title=''>{title}</a>
        的内容模型从“{logparams.oldmodel}”更改为“{logparams.oldmodel}”
      </>
    );
  }

  if (logtype === 'contentmodel' && logaction === 'new') {
    return (
      <>
        已使用非默认的内容模型“{logparams.newmodel}”创建页面
        <a href={wgArticlePath.replace('$1', title)} title=''>{title}</a>
      </>
    );
  }

  if (logaction === 'block') {
    return (
      <>
        封禁了
        <UserLink user={title} showAvatar={false} />
        ，到期时间为
        {logparams.duration}
        （
        {logparams.flags.join('、')}
        ）
      </>
    );
  }

  if (logaction === 'unblock') {
    return (
      <>
        解封了
        <UserLink user={title} showAvatar={false} />
      </>
    );
  }

  return (
    <>
      （小工具不支持的日志类型，请
      <a href={wgArticlePath.replace('$1', 'User_talk:BearBin')}>
        联系BearBin
      </a>
      ）
    </>
  );
};

export default LogText;
