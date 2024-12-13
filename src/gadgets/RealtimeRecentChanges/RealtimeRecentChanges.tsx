import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from 'oojs-ui-react';
import { ChangeslistLine, type ChangeslistLineProps } from './ChangeslistLine';

declare global {
  interface Window {
    /** 用户自定的每次实时更新后回调 */
    realtimeRecentChangeCallback?: () => void;
  }
}

const RecentChangeList: React.FC<{ initialData: ChangeslistLineProps[] }> = ({ initialData }) => {
  const [running, setRunning] = useState(false);
  const [data, setData] = useState<ChangeslistLineProps[]>(initialData);
  const api = new mw.Api();

  const queryData = async () => {
    // if (!running) {
    //   return;
    // }
    const res = await api.post({
      action: 'query',
      list: 'recentchanges',
      rclimit: 50,
      rcprop: ['patrolled', 'parsedcomment', 'flags', 'tags', 'title', 'timestamp', 'ids', 'sizes', 'user', 'userid', 'redirect'],
    });
    setData(res.query.recentchanges.map((recentchange) => ({
      ...recentchange,
      'new': 'new' in recentchange,
      minor: 'minor' in recentchange,
      bot: 'bot' in recentchange,
      patrolled: 'patrolled' in recentchange,
      autopatrolled: 'autopatrolled' in recentchange,
      unpatrolled: 'unpatrolled' in recentchange,
      redirect: 'redirect' in recentchange,
      last: true,
    })));
  };

  useEffect(() => {
    mw.loader.using(['mediawiki.api', 'oojs-ui', 'moment']);
    setTimeout(() => {
      queryData();
    }, 5000);
  }, []);

  useEffect(() => {
    if (typeof window.realtimeRecentChangeCallback === 'function') {
      window.realtimeRecentChangeCallback();
    }
  }, [data]);

  return (
    <div>
      {createPortal(
        <Button onClick={() => setRunning(!running)}>
          实时更新
        </Button>,
        document.querySelector('.rcoptions.cloptions')!,
      )}
      {data.map((changeData) => (
        <ChangeslistLine key={changeData.title} {...changeData} />
      ))}
    </div>
  );
};

export default RecentChangeList;
