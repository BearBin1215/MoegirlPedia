# oojs-ui-react

[oojs-ui](https://github.com/wikimedia/oojs-ui)部分组件的React实现，施工中。

基本上都支持常见标准属性，如`id`、`className`、`ref`、`onClick`等。

主要用于生成oojs-ui的元素，api、使用逻辑可能有很大出入。

## 基本类型

- ChangeValue<T, P>: `{ value: T, oldValue: T | undefined, event?: React.ChangeEvent<P> }`
- ChangeHandler<T, P>: `(change?: ChangeValue<T, P>) => void;`
- Indicator: `'clear' | 'up' | 'down' | 'required'`
- LabelPosition: `'before' | 'after'`


## Icon

```jsx
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

```jsx
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

```jsx
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


## TextInput



## MultilineTextInput



## NumberInput



## CheckboxInput



## Dropdown

### 基本用法
```jsx
import React from 'react';
import { Dropdown, MenuOption } from 'oojs-ui-react';

const App = () => {
  return (
    <Dropdown label='please select'>
      <MenuOption data='a'>foo</MenuOption>
      <MenuOption data='b' icon='check'>bar</MenuOption>
      <MenuOption data='c' disabled>disabled</MenuOption>
    </Dropdown>
  );
};

export default App;
```

`MenuOption`组件的**data**字段必须。

### 分组

```jsx
import React from 'react';
import { Dropdown, MenuOption, MenuSectionOption } from 'oojs-ui-react';

const App = () => {
  return (
    <Dropdown label='please select'>
      <MenuSectionOption icon='check'>group1</MenuSectionOption>
      <MenuOption data='a'>foo</MenuOption>
      <MenuOption data='b'>bar</MenuOption>
      <MenuSectionOption icon='cancel'>group2</MenuSectionOption>
      <MenuOption data='c' disabled>disabled</MenuOption>
    </Dropdown>
  );
};

export default App;
```

### API


## RadioInput



## RadioSelect

```jsx
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

由多个[`RadioOption`](#RadioOption)作为子组件，其中`data`参数必须且不重复。

### API

#### RadioSelect

| 参数         | 说明                                                     | 类型                                                                        |
| ------------ | -------------------------------------------------------- | --------------------------------------------------------------------------- |
| defaultValue | 默认值，组件会查找子组件中`data`参数相同的作为默认勾选项 | `string \| number \| boolean`                                               |
| disabled     | 是否禁用                                                 | `boolean`                                                                   |
| name         | 参数名                                                   | `string`                                                                    |
| onChange     | 值变化钩子                                               | [`ChangeHandler<string \| number \| boolean, HTMLInputElement>`](#基本类型) |

#### RadioOption

| 参数      | 说明       | 类型                                                    |
| --------- | ---------- | ------------------------------------------------------- |
| accessKey | 快捷键     | `string`                                                |
| data      | 选项值     | `string \| number \| boolean`                           |
| disabled  | 是否禁用   | `boolean`                                               |
| onChange  | 值变化钩子 | [`ChangeHandler<boolean, HTMLInputElement>`](#基本类型) |


## Dialog

```jsx
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Button, Dialog } from 'oojs-ui-react';

const App = () => {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button onClick={handleClick}>Open</Button>
      <Dialog open={open}>
        <Button onClick={handleClose}>close</Button>
        <hr />
        content
      </Dialog>
    </>
  );
};

export default App;
```

## BookletLayout (Menu)

子元素由`PageLayout`组成。`PageLayout`的key值必须，会用于切换页签，不填则会导致无法显示。

```jsx
import React from 'react';
import { BookletLayout, PageLayout } from 'oojs-ui-react';

const App = () => {
  return (
    <BookletLayout defaultKey='2'>
      <PageLayout key='1' label='page 1'>content 1</PageLayout>
      <PageLayout key='2' label='page 2'>content 2</PageLayout>
      <PageLayout key='3' label={<b>page 3</b>}>content 3</PageLayout>
    </BookletLayout>
  );
};

export default App;
```
