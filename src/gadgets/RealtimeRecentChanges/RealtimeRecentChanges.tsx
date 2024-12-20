import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from 'oojs-ui-react';
import ChangeslistLine, { type ChangeslistLineProps } from './ChangeslistLine';
import type { ApiQueryResponse } from '@/@types/api';

declare global {
  interface Window {
    /** 用户自定的每次实时更新后回调 */
    realtimeRecentChangeCallback?: () => void;
  }
}

const RecentChangeList: React.FC<{ initialData: ChangeslistLineProps[] }> = ({ initialData }) => {
  const [running, setRunning] = useState(false);
  const [tagMeaningsMap, setTagMeaningsMap] = useState<Record<string, string>>({});
  const [data, setData] = useState<ChangeslistLineProps[]>(initialData);
  const api = new mw.Api();

  const queryData = async () => {
    // if (!running) {
    //   return;
    // }
    const res = await api.post({
      action: 'query',
      format: 'json',
      utf8: true,
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

  const queryTagsData = async () => {
    const res = await api.post({
      action: 'query',
      format: 'json',
      list: 'tags',
      tgprop: ['name', 'displayName'],
    }) as ApiQueryResponse;
    if (res.query?.tags) {
      const meaningMap: Record<string, string> = {};
      for (const { name, displayName} of res.query.tags) {
        meaningMap[name] = displayName;
      }
      setTagMeaningsMap(meaningMap);
    }
  };

  useEffect(() => {
    mw.loader.using(['mediawiki.api', 'oojs-ui', 'moment']).then(() => {
      queryTagsData();
    });
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
        <Button active={running} icon={running ? 'stop' : 'play'} onClick={() => setRunning(!running)}>
          实时更新
        </Button>,
        document.querySelector('.rcoptions.cloptions')!,
      )}
      {data.map((changeData) => (
        <ChangeslistLine
          key={changeData.title}
          {...changeData}
          tagMeaningsMap={tagMeaningsMap}
        />
      ))}
    </div>
  );
};

export default RecentChangeList;
