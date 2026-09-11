import React from 'react';
import { Dropdown } from 'oojs-ui-react';

function DropdownPage() {
  return (
    <>
      <h1>Dropdown - 下拉选择框</h1>
      <h2>正常使用</h2>
      <Dropdown
        label='please select'
        options={[
          {
            value: 'a',
            children: 'foo',
          },
          {
            value: 'b',
            children: 'bar',
          },
          {
            value: 'c',
            disabled: true,
            children: '禁用选项（disabled: "true"）',
          },
          {
            value: 'check',
            icon: 'check',
            children: '带图标（icon: "check"）',
          },
        ]}
      />

      <h2>分组</h2>
      <p>
        不带<code>value</code>属性的选项将作为分组。
      </p>
      <Dropdown
        label='please select'
        options={[
          {
            icon: 'check',
            children: 'group1',
          },
          {
            value: 'a',
            children: 'foo',
          },
          {
            value: 'b',
            children: 'bar',
          },
          {
            icon: 'cancel',
            children: 'group2',
          },
          {
            value: 'c',
            disabled: true,
            children: 'disabled',
          },
        ]}
      />
    </>
  );
}

DropdownPage.displayName = 'DropdownPage';

export default DropdownPage;
