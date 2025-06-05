import React, { useState, type FC } from "react";
import {
  NumberInput,
} from 'oojs-ui-react';

const NumberInputs: FC = () => {
  const [numberValue, setNumberValue] = useState(0);

  return (
    <>
      <h1>NumberInput - 数字输入</h1>
      <p>当前内容：<u>{numberValue}</u></p>
      <NumberInput
        value={numberValue}
        onChange={({ value }) => setNumberValue(value)}
      />
      <h2>显示+-按钮</h2>
      <p>按照<code>step</code>步距增减</p>
      <NumberInput showButtons />
    </>
  );
};

NumberInputs.displayName = 'NumberInputsPage';

export default NumberInputs;
