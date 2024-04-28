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
import { Icon } from '@/components/oojs-ui-react';
import { createRoot } from 'react-dom/client';

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

| 参数 | 说明 | 类型 |
| ---- | ---- | ---- |
| disabled | 是否禁用 | `boolean` |
| flags | 样式标志 | `'progressive' \| 'destructive' \| ('progressive' \| 'destructive')[]` |
| icon | 图标 | `string` |


## Indicator

```tsx
import React from 'react';
import { Indicator } from 'oojs-ui-react';
import { createRoot } from 'react-dom/client';

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

| 参数 | 说明 | 类型 |
| ---- | ---- | ---- |
| disabled | 是否禁用 | `boolean` |
| indicator | 图标 | [`Indicator`](#基本类型) |


## Button

```tsx
import React from 'react';
import { Button } from 'oojs-ui-react';
import { createRoot } from 'react-dom/client';

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

| 参数 | 说明 | 类型 |
| ---- | ---- | ---- |
| active | 是否为激活状态 | `boolean` |
| disabled | 是否禁用 | `boolean` |
| flags | 样式标志 | `'primary' \| 'progressive' \| 'destructive' \| ('primary' \| 'progressive' \| 'destructive')[]` |
| framed | 是否生成边框| `boolean` |
| href | 按钮跳转链接 | `string` |
| icon | 图标 | `string` |
| indicator | 右侧指示器 | [`Indicator`](#基本类型) |
| rel | 内部<a>标签的rel属性，默认为`nofollow` | `string` |
| title | 内部<a>标签的title属性 | `string` |


### TextInput



### MultilineTextInput



### NumberInput



### CheckboxInput



### Dropdown



### RadioSelect

```tsx
import React from 'react';
import { RadioOption, RadioSelect } from 'oojs-ui-react';
import { createRoot } from 'react-dom/client';

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
