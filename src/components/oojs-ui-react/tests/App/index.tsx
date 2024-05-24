import React from 'react';
import { BookletLayout, PageLayout } from 'oojs-ui-react';
import 'oojs-ui/dist/oojs-ui-core-wikimediaui.min.css';
import 'oojs-ui/dist/oojs-ui-widgets-wikimediaui.min.css';

const App = () => {
  return (
    <BookletLayout defaultKey='1'>
      <PageLayout key='1' label='page 1'>content 1</PageLayout>
      <PageLayout key='2' label='page 2'>content 2</PageLayout>
      <PageLayout key='3' label={<b>page 3</b>}>content 3</PageLayout>
    </BookletLayout>
  );
};

export default App;
