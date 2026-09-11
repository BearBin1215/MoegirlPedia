import React, { useState } from 'react';
import { CheckboxMultiselect, FieldLayout, FieldsetLayout } from 'oojs-ui-react';

const options = [
  { value: 'a', children: '选项A' },
  { value: 'b', children: '选项B' },
  { value: 'c', children: '禁用项', disabled: true },
  { value: 'd', children: '选项D' },
];

function CheckboxMultiselectPage() {
  const [selected, setSelected] = useState<Array<string | number>>(['a']);

  return (
    <>
      <h1>CheckboxMultiselect - 多选框组</h1>

      <h2>非受控</h2>
      <CheckboxMultiselect options={options} defaultValue={['b']} name='demo-uncontrolled' />

      <h2>受控</h2>
      <CheckboxMultiselect
        options={options}
        value={selected}
        name='demo-controlled'
        onChange={(value) => setSelected(value)}
      />
      <p>当前选中：{JSON.stringify(selected)}</p>

      <h2>整体禁用</h2>
      <CheckboxMultiselect options={options} disabled />

      <h2>配合FieldsetLayout</h2>
      <FieldsetLayout label='多选字段集' icon='listBullet'>
        <FieldLayout align='inline'>
          <CheckboxMultiselect options={options} />
        </FieldLayout>
      </FieldsetLayout>
    </>
  );
}

CheckboxMultiselectPage.displayName = 'CheckboxMultiselectPage';

export default CheckboxMultiselectPage;
