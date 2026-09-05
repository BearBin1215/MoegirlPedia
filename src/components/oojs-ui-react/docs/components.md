# 组件文档

各组件的使用示例与 API。示例基于以下约定：

- 基本上都支持常见标准属性，如`id`、`className`、`ref`、`onClick`等
- 主要用于生成oojs-ui的元素，api、使用逻辑可能有很大出入

## 基本类型

- ChangeHandler<T, P>: `(value: T, event?: React.ChangeEvent<P>) => void`，值优先；第二参数为触发变更的原生change事件，仅输入类组件提供
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

待补充。

## MultilineTextInput

待补充。

## NumberInput

待补充。

## CheckboxInput

待补充。

## Dropdown

### 基本用法
```jsx
import React from 'react';
import { Dropdown } from 'oojs-ui-react';

const App = () => {
  return (
    <Dropdown
      label='please select'
      options={[
        {
          value: 'a',
          children: 'foo',
        },
        {
          value: 'b',
          icon: 'check',
          children: 'bar',
        },
        {
          value: 'c',
          disabled: true,
          children: 'disabled',
        },
      ]}
    />
  );
};

export default App;
```

选项对象的**value**字段必须，选项在组件内部渲染为`MenuOption`。

### 分组

```jsx
import React from 'react';
import { Dropdown } from 'oojs-ui-react';

const App = () => {
  return (
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
  );
};

export default App;
```

不带`value`字段的选项渲染为分组标题（内部`MenuSectionOption`）。

### API

待补充。

## RadioInput

待补充。

## RadioSelect

```jsx
import React from 'react';
import { RadioSelect } from 'oojs-ui-react';

const App = () => {
  return (
    <RadioSelect
      options={[
        { value: 'a' },
        { value: 'b' },
        { value: 'c', disabled: true },
      ]}
    />
  );
};

export default App;
```

选项在组件内部渲染为`RadioOption`，其中`value`参数必须且不重复。

### API

#### RadioSelect

| 参数         | 说明                               | 类型                                                                          |
| ------------ | ---------------------------------- | ------------------------------------------------------------------------------ |
| disabled     | 是否禁用                           | `boolean`                                                                      |
| name         | 参数名                             | `string`                                                                       |
| value        | 当前选中值（受控，传入即受控模式） | `string \| number`                                                             |
| defaultValue | 非受控初始选中值                   | `string \| number`                                                             |
| onChange     | 值变化钩子                         | [`ChangeHandler<string \| number \| undefined, HTMLInputElement>`](#基本类型) |

#### 选项

| 参数      | 说明       | 类型                                                    |
| --------- | ---------- | ------------------------------------------------------- |
| accessKey | 快捷键     | `string`                                                |
| value     | 选项值     | `string \| number`                                      |
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

页签由`options`组成，选项的`value`值必须，会用于切换页签，不填则会导致无法显示。

```jsx
import React from 'react';
import { BookletLayout } from 'oojs-ui-react';

const App = () => {
  return (
    <BookletLayout
      defaultValue='2'
      options={[
        { value: '1', label: 'page 1', children: 'content 1' },
        { value: '2', label: 'page 2', children: 'content 2' },
        { value: '3', label: <b>page 3</b>, children: 'content 3' },
      ]}
    />
  );
};

export default App;
```
