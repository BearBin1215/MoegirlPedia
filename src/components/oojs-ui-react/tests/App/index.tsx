import React from 'react';
import { BookletLayout, PageLayout } from 'oojs-ui-react';
import LazyComponent from './LazyComponent';
import router from '../config/router';
import 'oojs-ui/dist/oojs-ui-core-wikimediaui.min.css';
import 'oojs-ui/dist/oojs-ui-widgets-wikimediaui.min.css';

const App = () => {
  return (
    <BookletLayout defaultKey='Home'>
      {router.map((route) => (
        <PageLayout key={route.title} label={route.title}>
          <LazyComponent route={route} />
        </PageLayout>
      ))}
    </BookletLayout>
  );
};

export default App;
