# oojs-ui-react

基本上都支持常见标准属性，如`id`、`className`、`ref`、`onClick`等。

## 基本类型

- ChangeValue<T, P>: `{ value: T, oldValue: T | undefined, event?: React.ChangeEvent<P> }`
- ChangeHandler<T, P>: `(change?: ChangeValue<T, P>) => void;`
- Indicator: `'clear' | 'up' | 'down' | 'required'`
- LabelPosition: `'before' | 'after'`


## Icon

```tsx
import React from 'react';
import { Icon } from 'oojs-ui-react';

const App = () => {
  return (
    <>
      <Icon icon='search' />
      <Icon icon='search' disabled />
      <Icon icon='search' flags={['progressive']} />
    </>
  );
};

export default App;
```

### API

| 参数     | 说明     | 类型                                                                   |
| -------- | -------- | ---------------------------------------------------------------------- |
| disabled | 是否禁用 | `boolean`                                                              |
| flags    | 样式标志 | `'progressive' \| 'destructive' \| ('progressive' \| 'destructive')[]` |
| icon     | 图标     | `string`                                                               |


## Indicator

```tsx
import React from 'react';
import { Indicator } from 'oojs-ui-react';

const App = () => {
  return (
    <>
      <Indicator indicator='up' />
      <Indicator indicator='down' disabled />
    </>
  );
};

export default App;
```

### API

| 参数      | 说明     | 类型                     |
| --------- | -------- | ------------------------ |
| disabled  | 是否禁用 | `boolean`                |
| indicator | 图标     | [`Indicator`](#基本类型) |


## Button

```tsx
import React from 'react';
import { Button } from 'oojs-ui-react';

const App = () => {
  return (
    <>
      <Button icon='check'>Button</Button>
      <Button flags={['primary', 'progressive']}>Button</Button>
      <Button flags='destructive'>Button</Button>
      <Button indicator='down' disabled>Button</Button>
    </>
  );
};

export default App;
```

### API

| 参数      | 说明                                   | 类型                                                                                             |
| --------- | -------------------------------------- | ------------------------------------------------------------------------------------------------ |
| accessKey | 快捷键                                 | `string`                                                                                         |
| active    | 是否为激活状态                         | `boolean`                                                                                        |
| disabled  | 是否禁用                               | `boolean`                                                                                        |
| flags     | 样式标志                               | `'primary' \| 'progressive' \| 'destructive' \| ('primary' \| 'progressive' \| 'destructive')[]` |
| framed    | 是否生成边框                           | `boolean`                                                                                        |
| href      | 按钮跳转链接                           | `string`                                                                                         |
| icon      | 图标                                   | `string`                                                                                         |
| indicator | 右侧指示器                             | [`Indicator`](#基本类型)                                                                         |
| rel       | 内部<a>标签的rel属性，默认为`nofollow` | `string`                                                                                         |
| title     | 内部<a>标签的title属性                 | `string`                                                                                         |


### TextInput



### MultilineTextInput



### NumberInput



### CheckboxInput



### Dropdown



### RadioInput



### RadioSelect

```tsx
import React from 'react';
import { RadioOption, RadioSelect } from 'oojs-ui-react';

const App = () => {
  return (
    <RadioSelect>
      <RadioOption data='a'>A</RadioOption>
      <RadioOption data='b'>B</RadioOption>
      <RadioOption data='c' disabled>C</RadioOption>
    </RadioSelect>
  );
};

export default App;
```

由多个[`RadioOption`](#RadioOption)作为子组件，其中`data`参数必须且不应重复。

#### API

##### RadioSelect

| 参数         | 说明                                                     | 类型                                                             |
| ------------ | -------------------------------------------------------- | ---------------------------------------------------------------- |
| defaultValue | 默认值，组件会查找子组件中`data`参数相同的作为默认勾选项 | `string \| number`                                               |
| disabled     | 是否禁用                                                 | `boolean`                                                        |
| name         | 参数名                                                   | `string`                                                         |
| onChange     | 值变化钩子                                               | [`ChangeHandler<string \| number, HTMLInputElement>`](#基本类型) |

##### RadioOption

| 参数      | 说明       | 类型                                                    |
| --------- | ---------- | ------------------------------------------------------- |
| accessKey | 快捷键     | `string`                                                |
| data      | 选项值     | `string \| number`                                      |
| disabled  | 是否禁用   | `boolean`                                               |
| onChange  | 值变化钩子 | [`ChangeHandler<boolean, HTMLInputElement>`](#基本类型) |
