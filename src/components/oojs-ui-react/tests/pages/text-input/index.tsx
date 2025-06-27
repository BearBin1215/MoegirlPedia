import React, { useState, type FC } from "react";
import {
  TextInput,
} from 'oojs-ui-react';

const TextInputs: FC = () => {
  const [textValue, setTextValue] = useState('');
  const [length, setLength] = useState(0);

  return (
    <>
      <h1>TextInput - 文本输入</h1>
      <p>使用state和onChange事件读取内容。</p>

      <p>当前内容：<u>{textValue}</u></p>
      <TextInput
        value={textValue}
        onChange={({ value }) => setTextValue(value)}
        placeholder='输入文本'
        label='label'
      />

      <h3>图标</h3>
      <TextInput icon='search' indicator='required' />

      <h3>label</h3>
      <TextInput label='after (default)' />
      <TextInput label='before' labelPosition='before' style={{ marginTop: 10 }} />

      <h3>禁用</h3>
      <TextInput disabled />

      <h3>限制长度</h3>
      可以通过label和onChange配合显示剩余长度
      <TextInput
        maxLength={10}
        label={10 - length}
        onChange={({ value }) => setLength(value.length)}
      />
    </>
  );
};

TextInputs.displayName = 'TextInputsPage';

export default TextInputs;
