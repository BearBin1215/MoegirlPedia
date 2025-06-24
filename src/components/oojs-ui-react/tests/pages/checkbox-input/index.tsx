import React, { useState, type FC } from 'react';
import { CheckboxInput } from 'oojs-ui-react';

const CheckboxPage: FC = () => {
  const [value, setValue] = useState(false);
  return (
    <>
      <h1>CheckboxInput - 勾选框</h1>

      <h2>正常使用</h2>
      <p>
        当前值：{`${value}`}
      </p>
      <CheckboxInput
        value={value}
        onChange={(v) => setValue(v.value)}
      />
      <h2>禁用</h2>
      <p>
        <CheckboxInput disabled style={{ marginRight: '0.5em' }} />
        未勾选
      </p>
      <p>
        <CheckboxInput disabled value style={{ marginRight: '0.5em' }} />
        勾选
      </p>
    </>
  );
};

CheckboxPage.displayName = 'CheckboxPage';

export default CheckboxPage;
