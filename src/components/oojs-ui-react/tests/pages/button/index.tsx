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
      <Button flags={['primary', 'destructive']}>primary, progressive</Button>

      <h2>禁用</h2>
      <Button disabled>disabled</Button>

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
