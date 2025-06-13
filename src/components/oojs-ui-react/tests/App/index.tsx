import React, { useState, type FC, type Key } from 'react';
import { BookletLayout, ChangeHandler } from 'oojs-ui-react';
import LazyComponent from './LazyComponent';
import router from '../config/router';
import 'oojs-ui/dist/oojs-ui-core-wikimediaui.min.css';
import 'oojs-ui/dist/oojs-ui-widgets-wikimediaui.min.css';
import 'oojs-ui/dist/oojs-ui-images-wikimediaui.min.css';
import './index.less';

const topPages = ['Home 导航', 'Start 使用'];

const App: FC = () => {
  const [activeKey, setActiveKey] = useState<Key>('Home 导航');

  const handlePageChange: ChangeHandler<Key> = ({ value }) => {
    setActiveKey(value);
  };

  return (
    <div className='oojs-ui-react'>
      <div className='oojs-ui-react-header'>
        <div className='oojs-ui-react-title'>
          oojs-ui-react
        </div>
      </div>
      <div className='oojs-ui-react-content'>
        <BookletLayout
          defaultKey='Home 导航'
          onChange={handlePageChange}
          activeKey={activeKey}
          options={router.map((route) => 'section' in route ? {
            key: route.title,
            label: route.title,
            disabled: true,
          } : {
            key: route.title,
            label: (
              <span style={{ paddingLeft: topPages.includes(route.title) ? void 0 : '1em' }}>
                {route.title}
              </span>
            ),
            // 适配懒加载
            children: activeKey === route.title && <LazyComponent route={route} />,
          })}
        />
      </div>
    </div>
  );
};

App.displayName = 'App';

export default App;
