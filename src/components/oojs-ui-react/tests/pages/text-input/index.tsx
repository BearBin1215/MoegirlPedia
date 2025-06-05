import React, { useState, type FC } from "react";
import {
  TextInput,
  MultilineTextInput,
} from 'oojs-ui-react';

const TextInputs: FC = () => {
  const [textValue, setTextValue] = useState('');

  return (
    <>
      <h1>TextInput - 输入框</h1>
      <p>使用state和onChange事件读取内容。</p>

      <h2>TextInput</h2>
      <p>当前内容：<u>{textValue}</u></p>
      <TextInput
        value={textValue}
        onChange={({ value }) => setTextValue(value)}
        placeholder='输入文本'
        label='label'
      />

      <h2>MultilineTextInput</h2>
      <p>在其他组件库内通常被称为TextArea</p>
      <MultilineTextInput autosize />
    </>
  );
};

TextInputs.displayName = 'TextInputsPage';

export default TextInputs;
