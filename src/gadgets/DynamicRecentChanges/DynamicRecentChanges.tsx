import React, { useState, useEffect } from 'react';
import {
  Button,
  CheckboxInput,
  NumberInput,
  FieldLayout,
} from 'oojs-ui-react';
import { type ChangeslistLineProps } from './ChangeslistLine';
import ChangeslistLineCollapse from './ChangeslistLineCollapse';
import type { ApiQueryResponse } from '@/@types/api';
import './index.less';

declare global {
  interface Window {
    /** 用户自定的每次实时更新后回调 */
    realtimeRecentChangeCallback?: () => void;
    /** 用户设定的进入页面是否默认启动 */
    realtimeRecentChangeDefaultActive?: boolean;
  }
}

const RecentChangeList: React.FC<{ initialData: ChangeslistLineProps[][] }> = ({ initialData }) => {
  // 是否进入页面默认启动
  const [defaultActive, setDefaultActive] = useState(!!(
    localStorage.getItem('realtimeRecentChangeDefaultActive') || window.realtimeRecentChangeDefaultActive
  ));
  // 是否运行
  const [running, setRunning] = useState(defaultActive);
  // 记录定时器id，用于停止
  const [taskInterval, setTaskInterval] = useState<NodeJS.Timeout | undefined>(void 0);
  // 标签含义映射，用于渲染标签
  const [tagMeaningsMap, setTagMeaningsMap] = useState<Record<string, string>>({});
  // 用于渲染最终列表的数据
  const [data, setData] = useState<ChangeslistLineProps[][]>(initialData);

  const api = new mw.Api();

  /** 使用API读取最近更改数据，并转化为组件所需的格式 */
  const queryData = async () => {
    const res = await api.post({
      action: 'query',
      format: 'json',
      utf8: true,
      list: 'recentchanges',
      rclimit: 500,
      rctype: ['edit', 'new'],
      rcprop: [
        'patrolled',
        'parsedcomment',
        'flags',
        'tags',
        'title',
        'timestamp',
        'ids',
        'sizes',
        'user',
        'userid',
        'redirect',
      ],
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

  /** 读取标签数据 */
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
    // 运行状态变化，注册或清除定时器
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
    // 数据发生变化时会触发列表的重新渲染，执行用户的自定义回调
    if (typeof window.realtimeRecentChangeCallback === 'function') {
      window.realtimeRecentChangeCallback();
    }
  }, [data]);

  return (
    <div>
      <fieldset className='realtime-rc-options'>
        <legend>动态更新选项</legend>
        <div className='realtime-rc-active-panel'>
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
        <div className='realtime-rc-config-panel'>
          <div className='realtime-rc-config-line'>
            <label className='realtime-rc-config-label'>自动更新间隔（s）</label>
            <NumberInput
              name='updateInterval'
              className='realtime-rc-config-input'
            />
          </div>
          <div className='realtime-rc-config-line'>
            <label className='realtime-rc-config-label'>读取审核状态</label>
            <CheckboxInput
              name='readModetarion'
              className='realtime-rc-config-input'
            />
          </div>
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
