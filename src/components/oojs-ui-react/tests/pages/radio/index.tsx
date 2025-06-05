import React, { type FC } from 'react';
import { RadioSelect } from 'oojs-ui-react';

const RadioPage: FC = () => {
  return (
    <>
      <h1>Radio - 单选框</h1>
      <RadioSelect
        options={[
          { data: 'a', children: <span style={{ color: 'blue' }}>a</span> },
          { data: 'b', children: 'b' },
          { data: 'c', children: 'disabled', disabled: true },
        ]}
      />
    </>
  );
};

RadioPage.displayName = 'RadioPage';

export default RadioPage;
