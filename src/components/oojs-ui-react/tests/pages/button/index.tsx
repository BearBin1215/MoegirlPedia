import React, { type FC } from 'react';
import { Button, ButtonGroup } from 'oojs-ui-react';

const ButtonPage: FC = () => {
  return (
    <>
      <h1>Button - 按钮</h1>
      <h2>Button</h2>
      <Button>Normal</Button>
      <Button flags={['progressive']}>progressive</Button>
      <Button flags={['primary', 'progressive']}>primary, progressive</Button>
      <Button flags={['destructive']} icon='cancel'>destructive</Button>
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
