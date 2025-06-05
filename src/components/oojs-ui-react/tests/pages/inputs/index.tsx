import React, { useState, type FC } from "react";
import {
  TextInput,
  NumberInput,
  CheckboxInput,
} from 'oojs-ui-react';

const Inputs: FC = () => {
  const [textValue, setTextValue] = useState('');
  const [numberValue, setNumberValue] = useState(0);
  const [checkboxValue, setCheckboxValue] = useState(false);

  return (
    <>
      <h1>Inputs - 输入框</h1>
      <p>使用state和onChange事件读取内容。</p>

      <h2>TextInput</h2>
      <p>当前内容：<u>{textValue}</u></p>
      <TextInput
        value={textValue}
        onChange={({ value }) => setTextValue(value)}
        placeholder='输入文本'
        label='label'
      />

      <h2>NumberInput</h2>
      <p>当前内容：<u>{numberValue}</u></p>
      <NumberInput
        value={numberValue}
        onChange={({ value }) => setNumberValue(value)}
      />
      <h3>显示+-按钮</h3>
      <p>按照<code>step</code>步距增减</p>
      <NumberInput showButtons />

      <h2>CheckboxInput</h2>
      <p>当前值：{`${checkboxValue}`}</p>
      <CheckboxInput
        value={checkboxValue}
        onChange={({ value }) => setCheckboxValue(value)}
      />
    </>
  );
};

Inputs.displayName = 'InputsPage';

export default Inputs;
