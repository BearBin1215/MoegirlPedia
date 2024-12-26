/**
 * @description 模拟高版本MediaWiki的最近更改动态更新功能
 */
import React, { useState, useEffect } from 'react';
import {
  Button,
  CheckboxInput,
  NumberInput,
  FieldLayout,
} from 'oojs-ui-react';
import type { ChangeslistLineProps } from './ChangeslistLine';
import ChangeslistLineCollapse from './ChangeslistLineCollapse';
import type { ApiQueryResponse } from '@/@types/api';
import './index.less';

declare global {
  interface Window {
    /** 用户设定的是否读取审核状态 */
    realtimeRecentChangeReadModetarion?: boolean;
    /** 用户设定的自动更新间隔 */
    realtimeRecentChangeUpdateInterval?: number;
    /** 用户设定的进入页面是否默认启动 */
    realtimeRecentChangeDefaultActive?: boolean;
    /** 用户自定的每次实时更新后回调 */
    realtimeRecentChangeCallback?: () => void;
  }
}

interface RecentChangeListProps {
  /** 初始数据 */
  initialData: ChangeslistLineProps[][];
}

const RecentChangeList: React.FC<RecentChangeListProps> = ({
  initialData,
}) => {
  // 动态更新间隔
  const [updateInterval, setUpdateInterval] = useState(
    window.realtimeRecentChangeUpdateInterval
    || Number(localStorage.getItem('realtimeRecentChangeUpdateInterval'))
    || 10,
  );
  // 更新后是否读取审核状态
  const [readModetarion, setReadModetarion] = useState(!!(
    window.realtimeRecentChangeReadModetarion
    || localStorage.getItem('realtimeRecentChangeReadModetarion')),
  );
  // 是否进入页面默认启动
  const [defaultActive, setDefaultActive] = useState(!!(
    window.realtimeRecentChangeDefaultActive
    || localStorage.getItem('realtimeRecentChangeDefaultActive')
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
      // 按照用户当前显示的最多更改数读取，不超过500
      rclimit: Math.min(500, +$('.rclinks a[data-keys="limit"] strong').text()),
      rctype: ['edit', 'new', 'log'],
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
        'loginfo',
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
      // 最近更改API的type可以包括edit/new/log/external/catorize，这里只渲染前三种
      const existPage = formattedData.find(([{ title, type, logtype }]) => {
        // 编辑或创建页面按照同标题合并，日志操作按同类型合并
        return (type !== 'log' && change.type !== 'log' && title === change.title)
          || (type === 'log' && change.type === 'log' && logtype === change.logtype);
      });
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
      if (!defaultActive) {
        // 如果用户没有设置默认启动，这里要读取一次，否则要等一个interval才会第一次更新
        queryData();
      }
      const interval = setInterval(() => {
        queryData();
      }, Math.max(updateInterval * 1000, 3000));
      setTaskInterval(interval);
    } else {
      clearInterval(taskInterval);
    }
  }, [running]);

  useEffect(() => {
    // 用户更改自动更新间隔时，存入localStorage
    localStorage.setItem('realtimeRecentChangeUpdateInterval', `${updateInterval || 0}`);

    // 如果在运行状态中，调整更新间隔，重新注册定时器
    if (running) {
      clearInterval(taskInterval);
      setTaskInterval(setInterval(() => {
        queryData();
      }, Math.max(updateInterval * 1000, 3000)));
    }
  }, [updateInterval]);

  useEffect(() => {
    // 用户设置是否读取审核状态时，存入localStorage
    localStorage.setItem('realtimeRecentChangeReadModetarion', readModetarion ? '1' : '');
  }, [readModetarion]);

  useEffect(() => {
    // 用户更新是否默认启动的设置时，将其存入localStorage
    localStorage.setItem('realtimeRecentChangeDefaultActive', defaultActive ? '1' : '');
  }, [defaultActive]);

  useEffect(() => {
    // 数据变化重新渲染后，执行用户的自定义回调
    if (typeof window.realtimeRecentChangeCallback === 'function') {
      window.realtimeRecentChangeCallback();
    }
  }, [data]);

  return (
    <>
      <fieldset className='dynamic-rc-options'>
        <legend>动态更新选项</legend>
        <div className='dynamic-rc-active-panel'>
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
        <div className='dynamic-rc-config-panel'>
          <div className='dynamic-rc-config-line'>
            <label className='dynamic-rc-config-label'>自动更新间隔（s）</label>
            <NumberInput
              name='updateInterval'
              className='dynamic-rc-config-input'
              value={updateInterval}
              onChange={({ value }) => setUpdateInterval(value)}
              min={3}
              placeholder='不低于3秒'
            />
          </div>
          <div className='dynamic-rc-config-line'>
            <label className='dynamic-rc-config-label'>读取审核状态</label>
            <CheckboxInput
              name='readModetarion'
              className='dynamic-rc-config-input'
              value={readModetarion}
              onChange={({ value }) => setReadModetarion(value)}
            />
          </div>
        </div>
      </fieldset>
      <h4>{moment.utc(data[0]?.[0].timestamp).local().format('YYYY年MM月DD日 (dddd)')}</h4>
      <div>
        {data.map((changeData) => (
          <ChangeslistLineCollapse
            key={changeData[0].rcid}
            changes={changeData}
            tagMeaningsMap={tagMeaningsMap}
          />
        ))}
      </div>
    </>
  );
};

export default RecentChangeList;
