import React from 'react';
import { Dropdown } from 'oojs-ui-react';

const DropdownPage = () => {
  return (
    <>
      <h1>Dropdown - 下拉选择框</h1>
      <h2>正常使用</h2>
      <Dropdown
        label='please select'
        options={[
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
            key: 'c',
            data: 'c',
            disabled: true,
            children: '禁用选项（disabled: true）',
          },
          {
            key: 'check',
            data: 'check',
            icon: 'check',
            children: '带图标',
          },
        ]}
      />

      <h2>分组</h2>
      不带<code>data</code>属性的选项将作为分组。
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

export default DropdownPage;
