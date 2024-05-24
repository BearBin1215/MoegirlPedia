import React from "react";
import { Button } from 'oojs-ui-react';

const ButtonPage = () => {
  return (
    <>
      <Button>Normal</Button>
      <Button flags={['progressive']}>progressive</Button>
      <Button flags={['primary', 'progressive']}>primary, progressive</Button>
      <Button flags={['destructive']}>destructive</Button>
    </>
  );
};

export default ButtonPage;
