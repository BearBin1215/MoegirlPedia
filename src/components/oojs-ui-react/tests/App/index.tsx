import React from 'react';
import { BookletLayout, PageLayout } from 'oojs-ui-react';
import ButtonPage from '../pages/button';
import 'oojs-ui/dist/oojs-ui-core-wikimediaui.min.css';
import 'oojs-ui/dist/oojs-ui-widgets-wikimediaui.min.css';

const App = () => {
  return (
    <BookletLayout defaultKey='2'>
      <PageLayout key='1' label='Hello, world!'>content 1</PageLayout>
      <PageLayout key='2' label='Button'>
        <ButtonPage />
      </PageLayout>
      <PageLayout key='3' label={<b>page 3</b>}>content 3</PageLayout>
    </BookletLayout>
  );
};

export default App;
