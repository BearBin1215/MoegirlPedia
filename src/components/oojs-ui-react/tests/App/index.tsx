import React from 'react';
import { BookletLayout } from 'oojs-ui-react';
import LazyComponent from './LazyComponent';
import router from '../config/router';
import 'oojs-ui/dist/oojs-ui-core-wikimediaui.min.css';
import 'oojs-ui/dist/oojs-ui-widgets-wikimediaui.min.css';
import 'oojs-ui/dist/oojs-ui-images-wikimediaui.min.css';

const App = () => {
  return (
    <BookletLayout
      defaultKey='Layout'
      options={router.map((route) => ({
        key: route.title,
        label: route.title,
        children: <LazyComponent route={route} />,
      }))}
    />
  );
};

export default App;
