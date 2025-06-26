import React, { type FC } from 'react';
import { Button, ButtonGroup } from 'oojs-ui-react';

const ButtonPage: FC = () => {
  return (
    <>
      <h1>Button - 按钮</h1>

      <h2>样式</h2>
      <p>根据<code>flags</code>控制样式</p>
      <Button flags={[]}>Normal</Button>

      <h3>progressive</h3>
      <Button flags={['progressive']}>progressive</Button>
      <Button flags={['primary', 'progressive']}>primary, progressive</Button>

      <h3>destructive</h3>
      <Button flags={['destructive']}>destructive</Button>
      <Button flags={['primary', 'destructive']}>primary, destructive</Button>

      <h2>禁用</h2>
      <Button disabled>disabled</Button>

      <h2>带图标</h2>
      <Button icon='edit'>icon=edit</Button>
      <Button icon='check'>icon=check</Button>
      <Button icon='help'>icon=help</Button>
      <Button indicator='clear'>indicator=clear</Button>
      <Button indicator='required'>indicator=required</Button>
      <h3>仅图标</h3>
      <Button icon='edit' />
      <Button icon='check' />
      <Button icon='help' />
      <Button indicator='clear' />
      <Button indicator='required' />

      <h2>无边框</h2>
      <Button framed={false}>framed=false</Button>
      <Button framed={false} disabled>framed=false, disabled</Button>

      <h2>ButtonGroup</h2>
      <ButtonGroup>
        <Button>按钮1</Button>
        <Button>按钮2</Button>
        <Button disabled>按钮3</Button>
      </ButtonGroup>
    </>
  );
};

ButtonPage.displayName = 'ButtonPage';

export default ButtonPage;
