import React from 'react';
import { CheckboxInput, FieldLayout, FieldsetLayout, TextInput } from 'oojs-ui-react';

function FieldsetLayoutPage() {
  return (
    <>
      <h1>FieldsetLayout - 字段集布局</h1>

      <h2>基础用法</h2>
      <FieldsetLayout label='基本信息'>
        <FieldLayout label='用户名' align='top'>
          <TextInput />
        </FieldLayout>
        <FieldLayout label='邮箱' align='top'>
          <TextInput />
        </FieldLayout>
      </FieldsetLayout>

      <h2>带图标</h2>
      <FieldsetLayout label='带图标的字段集' icon='settings'>
        <FieldLayout label='选项一' align='inline'>
          <CheckboxInput />
        </FieldLayout>
        <FieldLayout label='选项二' align='inline'>
          <CheckboxInput />
        </FieldLayout>
      </FieldsetLayout>

      <h2>内联帮助</h2>
      <FieldsetLayout label='内联帮助示例' help='这是一段内联帮助文本' helpInline>
        <FieldLayout label='名称' align='top'>
          <TextInput />
        </FieldLayout>
      </FieldsetLayout>

      <h2>弹出帮助</h2>
      <FieldsetLayout label='弹出帮助示例' help='这是点击帮助图标后弹出的说明文本。'>
        <FieldLayout label='名称' align='top'>
          <TextInput />
        </FieldLayout>
      </FieldsetLayout>

      <h2>无标签</h2>
      <FieldsetLayout>
        <FieldLayout label='仅分组容器' align='top'>
          <TextInput />
        </FieldLayout>
      </FieldsetLayout>
    </>
  );
}

FieldsetLayoutPage.displayName = 'FieldsetLayoutPage';

export default FieldsetLayoutPage;
