import React from 'react';
import { TextInput, type TextInputProps } from 'oojs-ui-react';
import { createRowAppender, useOriginalWidgets } from '../../components/original';
import { CompareColumns, CompareLayout } from '../../components/CompareLayout';

/** 两侧同配的文本框变体：config给原版、props给React版，逐行同名对照 */
type TextInputVariant = {
  /** 行标题（两侧同一文案） */
  name: string;
  /** 原版侧config */
  config: Record<string, unknown>;
  /** React侧props */
  props: Partial<TextInputProps>;
};

/**
 * 文本框变体清单：两侧配置一一对应（config给原版、props给React版），
 * 覆盖全部对外可表达的形态，作为输入族的回归基线
 */
const variants: TextInputVariant[] = [
  {
    name: '默认（placeholder）',
    config: { placeholder: '请输入' },
    props: { placeholder: '请输入' },
  },
  {
    name: '图标 + 指示器',
    config: { icon: 'search', indicator: 'up' },
    props: { icon: 'search', indicator: 'up' },
  },
  {
    name: 'label after（默认）',
    config: { label: 'after' },
    props: { label: 'after' },
  },
  {
    name: 'label before',
    config: { label: 'before', labelPosition: 'before' },
    props: { label: 'before', labelPosition: 'before' },
  },
  {
    name: 'required（指示器缺省回退required）',
    config: { required: true, placeholder: '必填' },
    props: { required: true, placeholder: '必填' },
  },
  {
    name: 'invisibleLabel（保留可访问名，根无labelElement类）',
    config: { label: '搜索', invisibleLabel: true },
    props: { label: '搜索', invisibleLabel: true },
  },
  {
    name: 'readOnly（只读）',
    config: { value: '只读内容', readOnly: true },
    props: { defaultValue: '只读内容', readOnly: true },
  },
  {
    name: 'disabled（禁用）',
    config: { value: '禁用内容', disabled: true },
    props: { defaultValue: '禁用内容', disabled: true },
  },
  {
    name: 'maxLength=5',
    config: { maxLength: 5, placeholder: '最多5字' },
    props: { maxLength: 5, placeholder: '最多5字' },
  },
  {
    name: 'type=password',
    config: { type: 'password', value: 'secret' },
    props: { type: 'password', defaultValue: 'secret' },
  },
  {
    name: 'type=number',
    config: { type: 'number', value: '42' },
    props: { type: 'number', defaultValue: '42' },
  },
  {
    name: 'validate=non-empty（清空后失焦即标红）',
    config: { validate: 'non-empty', placeholder: '留空后点别处' },
    props: { validate: 'non-empty', placeholder: '留空后点别处' },
  },
  {
    name: 'validate=正则（仅数字合法）',
    config: { validate: /^\d+$/, placeholder: '输入字母试试' },
    props: { validate: /^\d+$/, placeholder: '输入字母试试' },
  },
];

/** 原版侧：逐行生成与variants同名的文本框 */
function OriginalTextInputs() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const row = createRowAppender(container, register);
    for (const variant of variants) {
      row(oo.ui.TextInputWidget, variant.name, variant.config);
    }
  });

  return <div ref={containerRef} />;
}

/** React侧：逐行渲染同一批变体，非受控用法（受控见form-compare） */
function ReactTextInputs() {
  return (
    <div>
      {variants.map((variant) => (
        <div key={variant.name}>
          {variant.name}
          <TextInput {...variant.props} />
        </div>
      ))}
    </div>
  );
}

/**
 * 仅React侧的能力：`inputProps`把属性写到原生input上（组件props的...rest落在根元素）。
 * 原版经jQuery命令式设置属性，没有对应的声明式通道，故不作左右对照
 */
function ReactInputPropsDemo() {
  return (
    <div>
      <TextInput
        placeholder='aria-describedby经inputProps落到input'
        inputProps={{ 'aria-describedby': 'text-input-compare-hint' }}
      />
      <span id='text-input-compare-hint'>输入框下方的说明文字</span>
    </div>
  );
}

function TextInputComparePage() {
  return (
    <CompareLayout
      title='TextInput 对照'
      description={(
        <>
          对照点：根类链（<code>oo-ui-inputWidget oo-ui-textInputWidget oo-ui-textInputWidget-type-*</code>
          ）与 labelPosition 修饰符类、图标/指示器的 noIcon 占位与 required 指示器缺省回退、
          label 处的 input 内边距让位（labelPosition 两侧同步随标签宽度变化）、
          readOnly/disabled 原生属性与 <code>aria-disabled</code>、
          软校验的 input <code>aria-invalid</code> 与根元素 invalid 标志类（值变更防抖250ms、失焦立即、聚焦清除）。
          <br />
          交互对照：点击图标或指示器应聚焦输入框（<code>onIconMouseDown</code>/
          <code>onIndicatorMouseDown</code>）；窗口缩放引起标签宽度变化时 input 的内边距须随之更新。
        </>
      )}
    >
      <CompareColumns original={<OriginalTextInputs />}>
        <ReactTextInputs />
      </CompareColumns>

      <h2>仅React侧：inputProps通道</h2>
      <ReactInputPropsDemo />
    </CompareLayout>
  );
}

TextInputComparePage.displayName = 'TextInputComparePage';

export default TextInputComparePage;
