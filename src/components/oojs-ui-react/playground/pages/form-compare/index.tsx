import React, { useEffect, useRef, useState } from 'react';
import {
  ActionFieldLayout,
  ButtonInput,
  CheckboxMultiselectInput,
  DropdownInput,
  FieldLayout,
  FieldsetLayout,
  FormLayout,
  RadioSelectInput,
  TextInput,
} from 'oojs-ui-react';
import { createOOUIWidgets, ensureOOUI, unwrapJQuery, compareLayoutStyle } from '../../components/ooui';

const serialize = (form: HTMLFormElement) => {
  const data: Record<string, string> = {};
  for (const [key, value] of new FormData(form).entries()) {
    data[key] = data[key] ? `${data[key]},${String(value)}` : String(value);
  }
  return JSON.stringify(data);
};

const dropdownOptions = [
  { optgroup: '分组一' },
  { data: 'a', label: 'Option A' },
  { data: 'b', label: 'Option B', disabled: true },
  { optgroup: '分组二' },
  { data: 'c', label: 'Option C' },
];
const radioOptions = [
  { data: 'r1', label: '单选一' },
  { data: 'r2', label: '单选二' },
  { data: 'r3', label: '单选禁用', disabled: true },
];
const checkboxOptions = [
  { data: 'c1', label: '多选一' },
  { data: 'c2', label: '多选二' },
  { data: 'c3', label: '多选禁用', disabled: true },
];

function OriginalForm() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('未初始化');
  const [result, setResult] = useState('（尚未提交）');

  useEffect(() => {
    let cancelled = false;
    const host = createOOUIWidgets();
    ensureOOUI().then((OO) => {
      if (cancelled || !containerRef.current) {
        return;
      }
      const ui = OO.ui as unknown as {
        TextInputWidget: new (config?: Record<string, unknown>) => { $element: unknown };
        DropdownInputWidget: new (config?: Record<string, unknown>) => { $element: unknown };
        RadioSelectInputWidget: new (config?: Record<string, unknown>) => { $element: unknown };
        CheckboxMultiselectInputWidget: new (config?: Record<string, unknown>) => { $element: unknown };
        ButtonInputWidget: new (config?: Record<string, unknown>) => { $element: unknown };
        FieldLayout: new (field: unknown, config?: Record<string, unknown>) => { $element: unknown };
        FieldsetLayout: new (config?: Record<string, unknown>) => { $element: unknown; addItems: (items: unknown[]) => void };
        ActionFieldLayout: new (field: unknown, button: unknown, config?: Record<string, unknown>) => { $element: unknown };
        FormLayout: new (config?: Record<string, unknown>) => {
          $element: unknown;
          addItems: (items: unknown[]) => void;
          on: (event: string, handler: () => boolean) => void;
        };
      };

      const username = new ui.TextInputWidget({ placeholder: '用户名', name: 'username' });
      const dropdown = new ui.DropdownInputWidget({
        name: 'dropdown',
        options: dropdownOptions,
        value: 'c',
      });
      const radio = new ui.RadioSelectInputWidget({
        name: 'radio',
        options: radioOptions,
        value: 'r2',
      });
      const checks = new ui.CheckboxMultiselectInputWidget({
        name: 'checks',
        options: checkboxOptions,
        value: ['c1'],
      });

      const searchInput = new ui.TextInputWidget({ placeholder: '搜索', name: 'search' });
      const searchButton = new ui.ButtonInputWidget({
        label: '搜索',
        type: 'submit',
        flags: 'primary',
        useInputTag: true,
      });
      const searchField = new ui.ActionFieldLayout(searchInput, searchButton, {
        label: 'ActionField（input标签按钮）',
        align: 'top',
      });

      const searchInput2 = new ui.TextInputWidget({ placeholder: '搜索', name: 'search2' });
      const searchButton2 = new ui.ButtonInputWidget({
        label: '搜索',
        type: 'submit',
        flags: 'primary',
      });
      const searchField2 = new ui.ActionFieldLayout(searchInput2, searchButton2, {
        label: 'ActionField（button标签按钮）',
        align: 'top',
      });

      const fieldset = new ui.FieldsetLayout({ label: '表单对照' });
      const fieldLayouts = [
        new ui.FieldLayout(username, { label: '用户名', align: 'top' }),
        new ui.FieldLayout(dropdown, { label: '下拉（含分组与禁用项）', align: 'top' }),
        new ui.FieldLayout(radio, { label: '单选组', align: 'top' }),
        new ui.FieldLayout(checks, { label: '多选组', align: 'top' }),
      ];
      host.add(
        username, dropdown, radio, checks,
        searchInput, searchButton, searchField,
        searchInput2, searchButton2, searchField2,
        fieldset, ...fieldLayouts,
      );
      fieldset.addItems([...fieldLayouts, searchField, searchField2]);

      const form = new ui.FormLayout({ items: [fieldset], method: 'post' });
      host.add(form);
      form.on('submit', () => {
        const formEl = unwrapJQuery(form.$element) as HTMLFormElement;
        setResult(serialize(formEl));
        // 返回false阻止默认提交（对齐原版FormLayout.onFormSubmit）
        return false;
      });

      containerRef.current.appendChild(unwrapJQuery(form.$element));
      setStatus('原版已就绪');
    }).catch(() => setStatus('原版加载失败'));
    return () => {
      cancelled = true;
      host.destroyAll();
    };
  }, []);

  return (
    <div>
      <p>{status}</p>
      <div ref={containerRef} />
      <p style={{ wordBreak: 'break-all' }}>提交结果：{result}</p>
    </div>
  );
}

function ReactForm() {
  const [result, setResult] = useState('（尚未提交）');

  return (
    <div>
      <FormLayout
        method='post'
        onSubmit={(event) => {
          event.preventDefault();
          setResult(serialize(event.currentTarget));
        }}
      >
        <FieldsetLayout label='表单对照'>
          <FieldLayout label='用户名' align='top'>
            <TextInput placeholder='用户名' name='username' />
          </FieldLayout>
          <FieldLayout label='下拉（含分组与禁用项）' align='top'>
            <DropdownInput
              name='dropdown'
              options={[
                { children: '分组一' },
                { value: 'a', children: 'Option A' },
                { value: 'b', children: 'Option B', disabled: true },
                { children: '分组二' },
                { value: 'c', children: 'Option C' },
              ]}
              defaultValue='c'
            />
          </FieldLayout>
          <FieldLayout label='单选组' align='top'>
            <RadioSelectInput
              name='radio'
              options={[
                { value: 'r1', children: '单选一' },
                { value: 'r2', children: '单选二' },
                { value: 'r3', children: '单选禁用', disabled: true },
              ]}
              defaultValue='r2'
            />
          </FieldLayout>
          <FieldLayout label='多选组' align='top'>
            <CheckboxMultiselectInput
              name='checks'
              options={[
                { value: 'c1', children: '多选一' },
                { value: 'c2', children: '多选二' },
                { value: 'c3', children: '多选禁用', disabled: true },
              ]}
              defaultValue={['c1']}
            />
          </FieldLayout>
          <ActionFieldLayout label='ActionField（input标签按钮）' align='top' button={<ButtonInput type='submit' flags='primary' useInputTag>搜索</ButtonInput>}>
            <TextInput placeholder='搜索' name='search' />
          </ActionFieldLayout>
          <ActionFieldLayout label='ActionField（button标签按钮）' align='top' button={<ButtonInput type='submit' flags='primary'>搜索</ButtonInput>}>
            <TextInput placeholder='搜索' name='search2' />
          </ActionFieldLayout>
        </FieldsetLayout>
      </FormLayout>
      <p style={{ wordBreak: 'break-all' }}>提交结果：{result}</p>
    </div>
  );
}

function FormComparePage() {
  return (
    <>
      <h1>Form/Inputs 对照 - 原版oojs-ui vs oojs-ui-react</h1>
      <p>
        对照点：FormLayout包裹表单、DropdownInput（隐藏select+分组optgroup+禁用项）、
        RadioSelectInput（默认选中首项语义）、CheckboxMultiselectInput（checkbox的name/value表单提交）、
        ButtonInput（submit按钮触发原生提交，两种标签形态）、ActionFieldLayout（输入框+按钮组合）、
        点击两侧提交按钮后FormData序列化结果应一致。
      </p>
      <div style={compareLayoutStyle}>
        <div style={{ flex: 1 }}>
          <h2>原版oojs-ui</h2>
          <OriginalForm />
        </div>
        <div style={{ flex: 1 }}>
          <h2>oojs-ui-react</h2>
          <ReactForm />
        </div>
      </div>
    </>
  );
}

FormComparePage.displayName = 'FormComparePage';

export default FormComparePage;
