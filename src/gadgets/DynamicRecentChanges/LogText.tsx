import React from 'react';

interface LogTextProps {
  logtype: string;
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

const logEventMeaning = {
  move: '移动',
  'delete': '删除',
  block: '封禁',
};

const LogText: React.FC<LogTextProps> = ({
  logtype,
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
export { logEventMeaning };
