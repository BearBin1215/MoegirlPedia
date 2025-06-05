import React, { type FC } from 'react';
import { BookletLayout } from 'oojs-ui-react';
import LazyComponent from './LazyComponent';
import router from '../config/router';
import 'oojs-ui/dist/oojs-ui-core-wikimediaui.min.css';
import 'oojs-ui/dist/oojs-ui-widgets-wikimediaui.min.css';
import 'oojs-ui/dist/oojs-ui-images-wikimediaui.min.css';
import './index.less';

const topPages = ['Home 导航', 'Start 使用'];

const App: FC = () => {
  return (
    <BookletLayout
      defaultKey='Home 导航'
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
        children: <LazyComponent route={route} />,
      })}
    />
  );
};

App.displayName = 'App';

export default App;
