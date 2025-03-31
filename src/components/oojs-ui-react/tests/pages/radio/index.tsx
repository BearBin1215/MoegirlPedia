import React from 'react';
import { RadioSelect } from 'oojs-ui-react';

const RadioPage = () => {
  return (
    <>
      <h1>Radio - 单选框</h1>
      <RadioSelect
        options={[
          { data: 'a' },
          { data: 'b' },
          { data: 'c', disabled: true },
        ]}
      />
    </>
  );
};

export default RadioPage;
