import React from 'react';
import { Button, Dropdown } from 'oojs-ui-react';

const ButtonPage = () => {
  return (
    <>
      <Button>123</Button>
      <Dropdown
        label='please select'
        options={[
          {
            key: 'group1',
            icon: 'check',
            children: 'group1',
          },
          {
            key: 'a',
            data: 'a',
            children: 'foo',
          },
          {
            key: 'b',
            data: 'b',
            children: 'bar',
          },
          {
            key: 'group2',
            icon: 'cancel',
            children: 'group2',
          },
          {
            key: 'c',
            data: 'c',
            disabled: true,
            children: 'disabled',
          },
        ]}
      />
    </>
  );
};

export default ButtonPage;
