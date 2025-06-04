import React from 'react';
import { RadioSelect } from 'oojs-ui-react';

const RadioPage = () => {
  return (
    <>
      <h1>Radio - 单选框</h1>
      <RadioSelect
        options={[
          { data: 'a', children: <span style={{ color: 'blue' }}>a</span> },
          { data: 'b', children: 'b' },
          { data: 'c', children: 'c', disabled: true },
        ]}
      />
    </>
  );
};

export default RadioPage;
