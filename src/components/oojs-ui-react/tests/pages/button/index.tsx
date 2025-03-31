import React from "react";
import { Button } from 'oojs-ui-react';

const ButtonPage = () => {
  return (
    <>
      <h1>Button - 按钮</h1>
      <Button>Normal</Button>
      <Button flags={['progressive']}>progressive</Button>
      <Button flags={['primary', 'progressive']}>primary, progressive</Button>
      <Button flags={['destructive']} icon='cancel'>destructive</Button>
    </>
  );
};

export default ButtonPage;
