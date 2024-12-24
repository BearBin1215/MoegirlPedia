import React, { useState, useEffect } from 'react';
import { Button, CheckboxInput, FieldLayout } from 'oojs-ui-react';
import { type ChangeslistLineProps } from './ChangeslistLine';
import ChangeslistLineCollapse from './ChangeslistLineCollapse';
import type { ApiQueryResponse } from '@/@types/api';
import './index.less';

declare global {
  interface Window {
    /** 用户自定的每次实时更新后回调 */
    realtimeRecentChangeCallback?: () => void;
    realtimeRecentChangeDefaultActive?: boolean;
  }
}

const RecentChangeList: React.FC<{ initialData: ChangeslistLineProps[][] }> = ({ initialData }) => {
  const [defaultActive, setDefaultActive] = useState(!!(
    localStorage.getItem('realtimeRecentChangeDefaultActive') || window.realtimeRecentChangeDefaultActive
  ));
  const [running, setRunning] = useState(defaultActive);
  const [taskInterval, setTaskInterval] = useState<NodeJS.Timeout | undefined>(void 0);
  const [tagMeaningsMap, setTagMeaningsMap] = useState<Record<string, string>>({});
  const [data, setData] = useState<ChangeslistLineProps[][]>(initialData);
  const api = new mw.Api();

  const queryData = async () => {
    if (!running) {
      return;
    }
    const res = await api.post({
      action: 'query',
      format: 'json',
      utf8: true,
      list: 'recentchanges',
      rclimit: 500,
      rctype: ['edit', 'new'],
      rcprop: ['patrolled', 'parsedcomment', 'flags', 'tags', 'title', 'timestamp', 'ids', 'sizes', 'user', 'userid', 'redirect'],
    }) as ApiQueryResponse;
    const recentChanges = res.query.recentchanges.map((recentchange) => ({
      ...recentchange,
      'new': 'new' in recentchange,
      minor: 'minor' in recentchange,
      bot: 'bot' in recentchange,
      patrolled: 'patrolled' in recentchange,
      autopatrolled: 'autopatrolled' in recentchange,
      unpatrolled: 'unpatrolled' in recentchange,
      redirect: 'redirect' in recentchange,
    }));
    // 格式化后，聚合同标题的数据
    const formattedData: ChangeslistLineProps[][] = [];
    for (const change of recentChanges) {
      const existPage = formattedData.find((line) => line[0].title === change.title);
      if (existPage) {
        existPage.push(change);
      } else {
        formattedData.push([{ ...change, last: true }]);
      }
    }
    setData(formattedData);
  };

  const queryTagsData = async () => {
    const res = await api.post({
      action: 'query',
      format: 'json',
      utf8: true,
      list: 'tags',
      tgprop: ['name', 'displayname'],
      tglimit: 500,
    }) as ApiQueryResponse;
    if (res.query?.tags) {
      const meaningMap: Record<string, string> = {};
      for (const { name, displayname } of res.query.tags) {
        meaningMap[name] = displayname;
      }
      setTagMeaningsMap(meaningMap);
    }
  };

  useEffect(() => {
    queryTagsData();
  }, []);

  useEffect(() => {
    if (running) {
      const interval = setInterval(() => {
        queryData();
      }, 5000);
      setTaskInterval(interval);
    } else {
      clearInterval(taskInterval);
    }
  }, [running]);

  useEffect(() => {
    // 用户更新是否默认启动的设置时，将其存入localStorage
    localStorage.setItem('realtimeRecentChangeDefaultActive', defaultActive ? '1' : '');
  }, [defaultActive]);

  useEffect(() => {
    if (typeof window.realtimeRecentChangeCallback === 'function') {
      window.realtimeRecentChangeCallback();
    }
  }, [data]);

  return (
    <div>
      <fieldset className='realtime-rc-options'>
        <legend>动态更新选项</legend>
        <div className='active-panel'>
          <Button
            active={running}
            icon={running ? 'stop' : 'play'}
            onClick={() => setRunning(!running)}
          >
            动态更新
          </Button>
          <FieldLayout
            label='进入页面默认启动'
            align='inline'
          >
            <CheckboxInput
              value={defaultActive}
              onChange={({ value }) => setDefaultActive(value)}
            />
          </FieldLayout>
        </div>
      </fieldset>
      {data.map((changeData) => (
        <ChangeslistLineCollapse
          key={changeData[0].title}
          changes={changeData}
          tagMeaningsMap={tagMeaningsMap}
        />
      ))}
    </div>
  );
};

export default RecentChangeList;
