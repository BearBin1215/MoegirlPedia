import React from 'react';
import { Collapse } from '@itg/itg-react-ui';

const CollapsePage = () => {
  return (
    <>
      <h1>折叠组件</h1>
      <Collapse label='折叠组件'>
        内容
        <br />
        内容
      </Collapse>
    </>
  );
};

export default CollapsePage;
