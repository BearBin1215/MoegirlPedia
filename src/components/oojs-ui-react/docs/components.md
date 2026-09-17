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
| title     | 内部<a>标签的title属性；未显式传且`invisibleLabel`为真时以标签文本兜底，`accessKey`有值时末尾附`[键]` | `string` |

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

## PopupTool / ToolGroupTool

二者不是独立组件，而是**工具的两个扩展配置**（`ToolProps`字段），可出现在任意工具组的`tools`里。

- `popup`（对齐原版`OO.ui.PopupTool`）：工具选中即开合浮层，浮层显隐期间工具呈激活态
  （对齐原版`onSelect`/`onPopupToggle`）。方位随工具栏位置（`bottom`时向上，同原版），
  不自动翻转（原版构造期`setAutoFlip(false)`），portal至body定位。
- `group`（对齐原版`OO.ui.ToolGroupTool`）：工具位渲染为该工具组元素，**不再渲染工具链接**，
  把手与面板由它自行提供。以React元素给出，故工具组可再嵌工具组（递归由组件树承担，
  无需原版`ToolGroupFactory`式的注册）。必须是带`tools`的工具组元素——JSX元素的类型不校验
  具体组件，传错组件不会报错。

```tsx
import React from 'react';
import { BarToolGroup, ListToolGroup, Toolbar, type ToolProps } from 'oojs-ui-react';

const tools: ToolProps[] = [
  { name: 'bold', title: '加粗', icon: 'bold', onSelect: () => {} },
  {
    name: 'help',
    title: '帮助',
    icon: 'help',
    popup: {
      content: <p>使用说明……</p>,
      head: true,
      label: '帮助',
      padded: true,
      onOpenChange: (open) => console.log(open),
    },
  },
  {
    name: 'settings',
    title: '设置',
    // 内嵌工具组：把手与面板由它提供，其禁用需在元素上自行声明
    group: <ListToolGroup icon='settings' label='设置' tools={[
      { name: 'setting1', title: '设置一', onSelect: () => {} },
      { name: 'setting2', title: '设置二', onSelect: () => {} },
    ]} />,
  },
];

const App = () => (
  <Toolbar>
    <BarToolGroup tools={tools} />
  </Toolbar>
);

export default App;
```

| 参数               | 说明                                                  | 类型                                                  |
| ------------------ | ----------------------------------------------------- | ----------------------------------------------------- |
| popup.content      | 浮层内容                                              | `ReactNode`                                           |
| popup.open         | 受控打开态（传入即受控）                              | `boolean`                                             |
| popup.defaultOpen  | 非受控初始打开态                                      | `boolean`                                             |
| popup.onOpenChange | 打开态变化回调（选中工具/点外部/关闭按钮/Escape）     | `(open: boolean) => void`                             |
| group              | 内嵌工具组元素（如`<ListToolGroup/>`/`<MenuToolGroup/>`） | `ReactElement<ToolGroupBaseProps>`（类型不校验组件） |

`popup`的其余字段与`Popup`一致（`head`/`hideCloseButton`/`padded`/`width`/`height`/`footer`/`align`/`anchor`/`autoFlip`/`hideWhenOutOfView`/`containerPadding`等），`container`/`autoClose`/`position`由工具自身接管。
弹出工具的`title`/`icon`/`active`/`disabled`照常生效，`onSelect`在选中时仍会触发（原版该回调被浮层开合占用，见docs/TODO.md）；
`group`工具因不渲染链接，`title`/`icon`/`active`/`onSelect`**不生效**（原版`$link.remove()`同样如此），只有`disabled`同步为工具位的禁用态（且不下发给内嵌组，内嵌组需自行声明）。
另：**弹出工具不要置于List/Menu组内**。选中工具会先收起该组面板，浮层虽经portal挂在body
（原版追加到`toolbar.$popups`）不会被面板的`display:none`连带隐藏，但锚点（工具元素）随面板隐藏而
矩形归零。实测：原版侧工具转为激活态但浮层不显示，React侧浮层会弹出但定位到视口左上角——两侧均不可用。

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

## SelectFileInputWidget

文件选择输入框，对齐原版`OO.ui.SelectFileInputWidget`：信息框（只读展示文件名，**清空指示器是唯一的清除入口**）
+ 选择按钮（`<input type=file>`覆盖在其锚点上，点击即开系统选择器），二者经`ActionFieldLayout`按`align='top'`排布。

```jsx
import React, { useState } from 'react';
import { SelectFileInputWidget } from 'oojs-ui-react';

const App = () => {
  const [files, setFiles] = useState([]);

  return (
    <SelectFileInputWidget
      accept={['image/*']}
      multiple
      // 非受控时也可直接用非受控初始值：defaultValue={[someFile]}
      value={files}
      onChange={setFiles}
    />
  );
};

export default App;
```

三种形态（对齐原版同名配置）：

- 默认：信息框 + 选择按钮，经`ActionFieldLayout`排布。
- `showDropTarget`：整块拖放区（含缩略图，非多选时加载），空态整块可点击开选择器；拖放中按能否接收切换`canDrop`/`cantDrop`类。
- `buttonOnly`：只渲染选择按钮，**根元素即按钮**（组件ref此时指向按钮元素）。

| 参数                | 说明                                                                     | 类型                                        |
| ------------------- | ------------------------------------------------------------------------ | ------------------------------------------- |
| value / defaultValue | 文件集（受控/初始）。对齐原版`getValue`的数组化，非多选时只保留首个文件    | `File[]`                                    |
| onChange            | 文件集变化回调（选择/拖放/清除；与原值等价时不触发）                        | `(files: File[]) => void`                   |
| accept              | 接受类型（MIME或`image/*`），同时写`accept`属性并按此过滤选择与拖放         | `string[]`                                  |
| multiple            | 是否多选                                                                 | `boolean`                                   |
| droppable           | 是否可拖放（缺省`true`；`DataTransfer`不可用时强制关闭）                    | `boolean`                                   |
| showDropTarget      | 是否用拖放区形态（须`droppable`）                                          | `boolean`                                   |
| buttonOnly          | 只渲染选择按钮                                                            | `boolean`                                   |
| thumbnailSizeLimit  | 缩略图大小上限（MB，缺省20）                                              | `number`                                    |
| placeholder / icon  | 信息框占位文案（缺省`ooui-selectfile-placeholder`消息）/ 信息框图标（缺省无图标） | `string`                             |
| required            | 是否必填（落在文件`input`的`required`上）                                  | `boolean`                                   |
| name                | 文件字段名（写在文件`input`上，用于表单提交）                              | `string`                                    |
| title / accessKey   | 文件`input`的title与快捷键：title缺省为`''`（抑制浏览器"未选文件"默认提示），显式传入落在`input`上；`accessKey`有值时title末尾附`[键]` | `string` |
| buttonLabel / buttonProps | 选择按钮文案（缺省按`multiple`取消息）/ 按钮属性覆盖                  | `string` / `Partial<ButtonProps>`           |
| inputRef            | 获取内部文件`input`元素引用                                                | `Ref<HTMLInputElement>`                     |

**焦点与键盘**：Tab停靠点是选择按钮（原版把`$tabIndexed`让给`selectButton.$button`），信息框`input`为`tabindex=-1`
且恒为`disabled`（对齐原版`setDisabled`里那条无条件的`info.$input.attr('disabled', true)`），清除指示器置`tabindex=0`保证键盘可达。

**与其余组件一致的两点**：`value`/`defaultValue`声明初始文件集在 React 版**直接生效**（原版构造期传`value`会被丢弃，
属已修正的原版缺陷，见`docs/TODO.md`「增强」）；选择按钮根元素沿用 Button 的`<span>`（原版为`<label>`，见「等效替代」）。

## ButtonMenuSelectWidget

按钮式菜单选择，对齐原版`OO.ui.ButtonMenuSelectWidget`：**真 Button**（Tab 停靠点）触发菜单，
菜单浮动于按钮下方（间距 4px）。菜单是**命令菜单**——选定即回调并收起。

```jsx
import React from 'react';
import { ButtonMenuSelectWidget } from 'oojs-ui-react';

const options = [
  { value: 'edit', children: '编辑' },
  { value: 'delete', children: '删除' },
];

const App = () => (
  <ButtonMenuSelectWidget options={options} onChoose={(value) => console.log(value)}>
    更多操作
  </ButtonMenuSelectWidget>
);

export default App;
```

| 参数                        | 说明                                                                             | 类型                                          |
| --------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------- |
| options                     | 菜单选项集                                                                       | `SelectOptionProps[]`                         |
| open / defaultOpen          | 菜单打开态（受控/初始）                                                           | `boolean`                                     |
| onOpenChange                | 菜单开合回调                                                                     | `(open: boolean) => void`                     |
| onChoose                    | 选定选项回调（每次选定都触发，随后收起）                                          | [`ChangeHandler<string \| number>`](#基本类型) |
| clearOnSelect               | 选定后是否清除菜单选中态（缺省`true`即纯命令菜单；`false`保留最后选定项）          | `boolean`                                     |
| onClick                     | 点击回调（在切换开合前触发）                                                      | `ButtonProps['onClick']`                      |
| menuSpacing                 | 菜单与按钮的间距（px，缺省4，对齐原版`menu.spacing`）                             | `number`                                      |
| menuProps                   | 菜单属性覆盖（`open`/`container`/`options`/`onChoose`/`id`/`spacing`/`clearOnChoose`由本组件接管） | `Omit<MenuSelectProps, …>`                    |

其余字段与`Button`一致（按钮文本经`children`，另有`icon`/`flags`/`framed`/`disabled`等）。

**焦点与 aria**：焦点始终在按钮上（菜单不是Tab停靠点）；锚点上写`aria-haspopup`/`aria-expanded`/`aria-owns`，
高亮项的`aria-activedescendant`也落在锚点上；菜单打开期间按钮呈`oo-ui-buttonElement-pressed`。
键盘：收起时 Enter/空格/↑/↓展开（方向键展开为 React 版增强，见`docs/TODO.md`），展开后↑↓移动高亮、
Enter/空格选定（空格选定为本工程增强，原版空格仅关闭菜单，见`docs/TODO.md`）。

