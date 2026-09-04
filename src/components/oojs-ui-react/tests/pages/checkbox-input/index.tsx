import React, { useState } from 'react';
import { CheckboxInput } from 'oojs-ui-react';

function CheckboxPage() {
  const [value, setValue] = useState(false);
  return (
    <>
      <h1>CheckboxInput - 勾选框</h1>

      <h2>正常使用</h2>
      <p>
        当前值：{`${value}`}
      </p>
      <CheckboxInput
        checked={value}
        onChange={(v) => setValue(v)}
      />
      <h2>禁用</h2>
      <p>
        <CheckboxInput disabled style={{ marginRight: '0.5em' }} />
        未勾选
      </p>
      <p>
        <CheckboxInput disabled checked style={{ marginRight: '0.5em' }} />
        勾选
      </p>
    </>
  );
}

CheckboxPage.displayName = 'CheckboxPage';

export default CheckboxPage;
