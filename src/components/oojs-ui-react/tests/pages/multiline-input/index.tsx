import React, { type FC } from "react";
import {
  MultilineTextInput,
} from 'oojs-ui-react';

const TextInputs: FC = () => {
  return (
    <>
      <h1>MultilineTextInput - 文本域</h1>

      <MultilineTextInput />

      <h3>设定行数（rows=3）</h3>
      <MultilineTextInput rows={3} />

      <h3>autosize</h3>
      <MultilineTextInput autosize />

      <h3>带图标</h3>
      <MultilineTextInput rows={3} icon='edit' indicator='required' />

      <h3>label</h3>
      <MultilineTextInput rows={3} label='after (default)' />
      <MultilineTextInput rows={3} label='before' labelPosition='before' style={{ marginTop: 10 }} />

      <h3>禁用</h3>
      <MultilineTextInput disabled />
    </>
  );
};

TextInputs.displayName = 'TextInputsPage';

export default TextInputs;
