import React from 'react';
import { RadioSelect } from 'oojs-ui-react';

function RadioPage() {
  return (
    <>
      <h1>Radio - 单选框</h1>
      <RadioSelect
        options={[
          { value: 'a', children: <span style={{ color: 'blue' }}>a</span> },
          { value: 'b', children: 'b' },
          { value: 'c', children: 'disabled', disabled: true },
        ]}
      />
    </>
  );
}

RadioPage.displayName = 'RadioPage';

export default RadioPage;
