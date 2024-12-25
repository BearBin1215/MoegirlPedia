import React from 'react';

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
