# 组件文档

各组件的使用示例与 API。示例基于以下约定：

- 基本上都支持常见标准属性，如`id`、`className`、`ref`、`onClick`等
- 主要用于生成OOUI（oojs-ui）的元素，api、使用逻辑可能有很大出入

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

## HiddenInputWidget

隐藏输入，用于承载不展示但要随表单提交的值。

```jsx
import React from 'react';
import { FieldLayout, FormLayout, HiddenInputWidget } from 'oojs-ui-react';

const App = () => {
  return (
    <FormLayout method='post' onSubmit={(event) => event.preventDefault()}>
      <FieldLayout label='隐藏值' align='top'>
        <HiddenInputWidget name='hidden' value='hidden-value' />
      </FieldLayout>
    </FormLayout>
  );
};

export default App;
```

| 参数     | 说明                     | 类型      |
| -------- | ------------------------ | --------- |
| value    | 提交的值，默认为空串     | `string`  |
| name     | 表单字段名               | `string`  |
| disabled | 是否禁用（不参与表单提交） | `boolean` |

## ButtonSelect

按钮式选择，选项以一排按钮呈现，同时只能选中一个。

```jsx
import React from 'react';
import { ButtonSelect } from 'oojs-ui-react';

const App = () => {
  return (
    <ButtonSelect
      defaultValue='b'
      options={[
        { value: 'a', children: '选项A' },
        { value: 'b', children: '选项B', icon: 'edit' },
        { value: 'c', children: '禁用项', disabled: true },
      ]}
      onChange={(value) => console.log(value)}
    />
  );
};

export default App;
```

选项对象中`value`必须，其余字段与其它选择类组件一致（`children`为文本、`disabled`、`icon`、`indicator`），
另有`framed`（是否带边框，缺省带边框）。选中值经`value`/`defaultValue`/`onChange`受控或非受控。

| 参数           | 说明                     | 类型                                            |
| -------------- | ------------------------ | ----------------------------------------------- |
| options        | 选项集                   | `ButtonSelectOptionProps[]`                     |
| value          | 当前选中值（受控）       | `string \| number`                              |
| defaultValue   | 非受控初始选中值         | `string \| number`                              |
| onChange       | 选中变化回调（值优先）   | [`ChangeHandler<string \| number>`](#基本类型)  |
| disabled       | 整组禁用（选项一并禁用） | `boolean`                                       |

## CopyTextLayout

只读文本框加复制按钮，聚焦文本框或点击按钮时自动全选文本，点击按钮写入剪贴板并回调结果。

```jsx
import React from 'react';
import { CopyTextLayout } from 'oojs-ui-react';

const App = () => {
  return (
    <CopyTextLayout
      label='分享链接'
      copyText='https://zh.moegirl.org.cn/Special:Random'
      onCopyResult={(copied) => console.log(copied)}
    />
  );
};

export default App;
```

```jsx
// 多行：文本框换用MultilineTextInput，复制按钮换行右浮
<CopyTextLayout
  label='批量文本'
  multiline
  copyText={'第一行\n第二行'}
  buttonProps={{ children: '复制文本', icon: 'link' }}
/>
```

| 参数          | 说明                                        | 类型                                              |
| ------------- | ------------------------------------------- | ------------------------------------------------- |
| copyText      | 待复制文本，作为文本框初始值                | `string`                                          |
| multiline     | 是否多行                                    | `boolean`                                         |
| textInputProps | 文本框props覆盖（`readOnly`缺省`true`）    | `CopyTextLayoutTextInputProps`                    |
| buttonProps   | 复制按钮props覆盖（`children`为按钮文本）   | `Partial<ButtonProps>`                            |
| onCopyResult  | 复制结束回调，入参为是否成功                | `(copied: boolean) => void`                       |

其余字段与`FieldLayout`一致（`label`、`align`、`disabled`等）。
复制优先走`navigator.clipboard`，不可用或被拒时回落到`document.execCommand('copy')`。

`CopyTextLayoutTextInputProps` = `Partial<TextInputProps<HTMLInputElement | HTMLTextAreaElement>>`（去掉`inputRef`，
布局自身占用该ref）再交叉多行专属的`rows`/`maxRows`/`autosize`，故单行与多行两种形态共用同一份配置。

## TagMultiselect / MenuTagMultiselect

标签多选输入框（chip输入）。`TagMultiselect`为自由输入形态，`MenuTagMultiselect`在其上提供候选菜单。

```jsx
import React from 'react';
import { MenuTagMultiselect, TagMultiselect } from 'oojs-ui-react';

const App = () => {
  return (
    <>
      {/* 自由输入：回车添加任意标签 */}
      <TagMultiselect allowArbitrary placeholder='输入后回车添加' onChange={(v) => console.log(v)} />
      {/* 白名单：仅列表内的值可添加 */}
      <TagMultiselect allowedValues={['foo', 'bar', 'baz']} placeholder='foo / bar / baz' />
      {/* 带候选菜单：输入过滤、↑↓高亮、Enter选定、点击切换 */}
      <MenuTagMultiselect
        defaultValue={['option1']}
        options={[
          { value: 'option1', label: '选项一' },
          { value: 'option2', label: '选项二' },
          { value: 'option3', label: '选项三', icon: 'tag' },
        ]}
      />
    </>
  );
};

export default App;
```

交互与原版一致：输入后回车添加；输入为空时按Backspace移除末尾标签并把其文本回填输入框（按Ctrl/Cmd则纯删除）；
点击标签把其移回输入框编辑（`allowEditTags`）；←→在标签与输入框间移动焦点；Escape清空输入；
失焦时把输入框文本提交为标签；拖动标签可调整顺序（`allowReordering`，drop后按新顺序写回值）。
`inputPosition='inline'`时输入框自动铺满所在行的剩余空间，空间不足时换行取整行宽度（对齐原版`updateInputSize`）。
值为`(string | number)[]`，经`value`/`defaultValue`/`onChange`受控或非受控。

| 参数                  | 说明                                                          | 类型                                    |
| --------------------- | ------------------------------------------------------------- | --------------------------------------- |
| value / defaultValue  | 标签值集合（当前/初始）                                       | `(string \| number)[]`                  |
| onChange              | 标签增删回调                                                  | [`ChangeHandler<(string \| number)[]>`](#基本类型) |
| inputPosition         | 输入框位置：`inline`（标签区末尾）/`outline`（标签区下方）/`none`（无输入） | `'inline' \| 'outline' \| 'none'`       |
| allowArbitrary        | 允许添加任意值（否则仅`allowedValues`/菜单选项）              | `boolean`                               |
| allowDuplicates       | 允许重复值                                                    | `boolean`                               |
| allowReordering       | 允许拖拽调整标签顺序；关闭时不可拖拽，且新增标签按 `allowedValues`/菜单选项的给定顺序插入 | `boolean` |
| allowedValues         | 合法值白名单                                                  | `(string \| number)[]`                  |
| allowDisplayInvalidTags | 非法/重复值也显示（呈invalid态），整体随之标记为非法        | `boolean`                               |
| tagLimit              | 标签数量上限（满额输入禁用）                                  | `number`                                |
| allowEditTags         | 允许点击标签移回输入框编辑                                    | `boolean`                               |
| placeholder           | 输入框占位符                                                  | `string`                                |
| name                  | 输入框`name`属性                                              | `string`                                |
| icon / indicator / flags | 图标/指示器/标志                                           | 同其余组件                              |

`MenuTagMultiselect`另有：

| 参数              | 说明                                                       | 类型              |
| ----------------- | ---------------------------------------------------------- | ----------------- |
| options           | 菜单选项集（`label`为标签与菜单项文本，`children`可自定义菜单项渲染） | `TagOptionProps[]` |
| clearInputOnChoose | 选定菜单项后清空过滤文本                                  | `boolean`         |

未开启`allowArbitrary`时，菜单选项构成标签的合法值域；已添加标签对应的菜单项呈选中态，点击已选中项即移除该标签。
`TagOptionProps` = `{ value, label?, children?, icon?, disabled?, fixed? }`，`fixed`为真时该标签不可移除、不可拖拽，且拖拽不会把其它标签移到它之前（固定项顺序不受拖拽影响）。

## LabelToolGroup

工具栏内的静态标签组，只展示文本/图标/指示器，**不可交互、不能承载工具**
（对齐原版`OO.ui.LabelToolGroup`：`populate`为空实现且移除了`.oo-ui-toolGroup-tools`容器）。

```jsx
import React from 'react';
import { LabelToolGroup, Toolbar } from 'oojs-ui-react';

const App = () => (
  <Toolbar>
    <LabelToolGroup label='标签组' icon='userAvatar' indicator='down' title='标签工具组' />
    <LabelToolGroup label='纯文本' />
  </Toolbar>
);

export default App;
```

| 参数      | 说明                                                              | 类型                  |
| --------- | ----------------------------------------------------------------- | --------------------- |
| label     | 把手标签                                                          | `ReactNode`           |
| icon      | 把手图标                                                          | `string`              |
| indicator | 把手指示器                                                        | `Indicators`          |
| title     | 把手tooltip（落在**根元素**，对齐原版TitledElement的`$titled=$element`） | `string`         |
| align     | `before`排左侧/`after`排到工具栏右侧                              | `'before' \| 'after'` |

其余字段与`Widget`一致（`disabled`等）。

## SearchWidget

查询输入框 + **始终可见**的结果列表（对齐原版`OO.ui.SearchWidget`，与浮层式查找菜单相对）。
组件本身不实现检索：查询变化只经`onQueryChange`回调，结果由调用方填入`results`
（对齐原版"查询变化清空结果、由子类重填"的分工）。焦点留在查询框，
↑↓在结果间移动高亮（端点环绕）、Enter选定高亮结果、点击结果亦可选定。

```jsx
import React, { useMemo, useState } from 'react';
import { SearchWidget } from 'oojs-ui-react';

const candidates = ['alpha', 'alto', 'beta'];

const App = () => {
  const [query, setQuery] = useState('');
  const results = useMemo(
    () => candidates.filter((c) => c.startsWith(query)).map((c) => ({ value: c, children: c })),
    [query],
  );

  return (
    // 根与两个子块均为绝对定位，须由宿主给出尺寸与定位（原版的使用场景是Dialog）
    <div style={{ position: 'relative', width: 420, height: 240 }}>
      <SearchWidget
        placeholder='输入 al 试试'
        value={query}
        onQueryChange={setQuery}
        results={results}
        onChoose={(value) => console.log(value)}
      />
    </div>
  );
};

export default App;
```

| 参数          | 说明                                                         | 类型                                          |
| ------------- | ------------------------------------------------------------ | --------------------------------------------- |
| results       | 结果选项集（由调用方按查询重填）                             | `SelectOptionProps[]`                         |
| value / defaultValue | 查询值（受控/初始）                                   | `string`                                      |
| onQueryChange | 查询变化回调                                                 | [`ChangeHandler<string>`](#基本类型)          |
| onChoose      | 选定结果回调（Enter选定高亮项、或点击结果）                   | [`ChangeHandler<string \| number>`](#基本类型) |
| placeholder   | 查询框占位符                                                 | `string`                                      |
| inputProps    | 查询框props覆盖（`value`/`defaultValue`/`onChange`由组件接管，`inputRef`与内部ref合并） | `Partial<SearchInputProps>`                   |

其余字段与`Widget`一致。查询框即`SearchInput`（`type=search` + 清空指示器）。
`results`与HTML原生`results`属性（`<input type=search>`）同名，故props类型先`Omit`掉原生属性再声明。
结果列表的`aria-activedescendant`归属**查询框**（对齐原版`results.setFocusOwner(query.$input)`）、
列表自身不作Tab停靠点（`tabIndex=-1`），点击结果不改变焦点。

