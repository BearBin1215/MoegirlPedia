import React, { useState } from 'react';
import { MenuTagMultiselect, TagMultiselect, type TagOptionProps } from 'oojs-ui-react';
import { createRowAppender, useOriginalWidgets } from '../../components/original';
import { CompareColumns, CompareLayout } from '../../components/CompareLayout';

/** 菜单选项（两侧共用数据，React侧另给出label/children） */
const menuItems = [
  { data: 'option1', label: '选项一' },
  { data: 'option2', label: '选项二' },
  { data: 'option3', label: '选项三', icon: 'tag' },
];

const reactMenuOptions: TagOptionProps[] = menuItems.map((item) => ({
  value: item.data,
  label: item.label,
  icon: item.icon,
}));

/** 固定标签演示选项：仅React侧会读取fixed */
const fixedItems = [
  { data: 'lock', label: '固定项' },
  { data: 'free1', label: '可移动1' },
  { data: 'free2', label: '可移动2' },
];

const reactFixedOptions: TagOptionProps[] = [
  { value: 'lock', label: '固定项', fixed: true },
  { value: 'free1', label: '可移动1' },
  { value: 'free2', label: '可移动2' },
];

type OriginalTagWidget = {
  $element: { addClass: (className: string) => void };
  on: (event: string, handler: () => void) => void;
  getValue: () => (string | number)[];
};

function OriginalTags() {
  const [values, setValues] = useState<Record<string, string>>({});
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as Record<string, unknown>;
    const append = createRowAppender(container, register);
    const Basic = ui.TagMultiselectWidget as unknown as new (config?: Record<string, unknown>) => OriginalTagWidget;
    const Menu = ui.MenuTagMultiselectWidget as unknown as new (config?: Record<string, unknown>) => OriginalTagWidget;

    /** 给原版控件根加测试标识类并登记change值输出 */
    const setup = (key: string, marker: string, widget: OriginalTagWidget) => {
      widget.$element.addClass(marker);
      widget.on('change', () => setValues((prev) => ({ ...prev, [key]: JSON.stringify(widget.getValue()) })));
    };

    setup('基础', 'cmp-basic', append(Basic, '基础（任意值，inline输入）', {
      allowArbitrary: true,
      inputPosition: 'inline',
      placeholder: '输入后回车添加',
    }));
    setup('白名单', 'cmp-whitelist', append(Basic, '白名单（仅foo/bar/baz，非法值不添加）', {
      allowedValues: ['foo', 'bar', 'baz'],
      inputPosition: 'inline',
      placeholder: 'foo / bar / baz',
    }));
    setup('菜单', 'cmp-menu', append(Menu, '菜单（outline输入，初始已选option1）', {
      inputPosition: 'outline',
      placeholder: '输入过滤或从菜单选择',
      selected: ['option1'],
      options: menuItems,
    }));
    setup('上限', 'cmp-limit', append(Basic, '上限3（任意值，满额输入禁用）', {
      allowArbitrary: true,
      tagLimit: 3,
      inputPosition: 'outline',
      placeholder: '最多3个标签',
    }));
    setup('非法展示', 'cmp-invalid', append(Basic, '非法展示（allowDisplayInvalidTags，重复即非法）', {
      allowDisplayInvalidTags: true,
      allowArbitrary: true,
      inputPosition: 'inline',
      placeholder: '可输入重复值观察invalid态',
    }));
    setup('宽度', 'cmp-width', append(Basic, '宽度自适应（inline，预设3标签，输入框铺满本行剩余空间）', {
      allowArbitrary: true,
      inputPosition: 'inline',
      placeholder: '输入框应铺满本行剩余空间',
      selected: ['alpha', 'beta', 'gamma'],
    }));
    setup('重排', 'cmp-reorder', append(Basic, '拖拽重排（allowReordering缺省true，拖动标签换位）', {
      allowArbitrary: true,
      inputPosition: 'outline',
      placeholder: '拖动标签可调整顺序',
      selected: ['一', '二', '三', '四'],
    }));
    setup('禁重排', 'cmp-noreorder', append(Basic, '禁用重排（allowReordering:false，新增按白名单顺序插入）', {
      allowedValues: ['x', 'y', 'z'],
      allowReordering: false,
      inputPosition: 'inline',
      placeholder: '依次输入z、x观察插入顺序',
      selected: ['y'],
    }));
    setup('固定', 'cmp-fixed', append(Menu, '固定标签（React增强：固定项不可拖拽/移除；原版无fixed概念）', {
      inputPosition: 'outline',
      selected: ['lock', 'free1'],
      options: fixedItems,
    }));
  });

  return (
    <div>
      <div ref={containerRef} />
      <p>change值：{JSON.stringify(values)}</p>
    </div>
  );
}

function ReactTags() {
  const [basic, setBasic] = useState<(string | number)[]>([]);
  const [whitelist, setWhitelist] = useState<(string | number)[]>([]);
  const [menu, setMenu] = useState<(string | number)[]>(['option1']);
  const [limit, setLimit] = useState<(string | number)[]>([]);
  const [invalidTags, setInvalidTags] = useState<(string | number)[]>([]);
  const [reorder, setReorder] = useState<(string | number)[]>(['一', '二', '三', '四']);
  const [noReorder, setNoReorder] = useState<(string | number)[]>(['y']);
  const [fixed, setFixed] = useState<(string | number)[]>(['lock', 'free1']);

  return (
    <div>
      <div>
        基础（任意值，inline输入）
        <TagMultiselect
          className='cmp-basic'
          allowArbitrary
          inputPosition='inline'
          placeholder='输入后回车添加'
          value={basic}
          onChange={setBasic}
        />
      </div>
      <div>
        白名单（仅foo/bar/baz，非法值不添加）
        <TagMultiselect
          className='cmp-whitelist'
          allowedValues={['foo', 'bar', 'baz']}
          inputPosition='inline'
          placeholder='foo / bar / baz'
          value={whitelist}
          onChange={setWhitelist}
        />
      </div>
      <div>
        菜单（outline输入，初始已选option1）
        <MenuTagMultiselect
          className='cmp-menu'
          inputPosition='outline'
          placeholder='输入过滤或从菜单选择'
          options={reactMenuOptions}
          value={menu}
          onChange={setMenu}
        />
      </div>
      <div>
        上限3（任意值，满额输入禁用）
        <TagMultiselect
          className='cmp-limit'
          allowArbitrary
          tagLimit={3}
          inputPosition='outline'
          placeholder='最多3个标签'
          value={limit}
          onChange={setLimit}
        />
      </div>
      <div>
        非法展示（allowDisplayInvalidTags，重复即非法）
        <TagMultiselect
          className='cmp-invalid'
          allowDisplayInvalidTags
          allowArbitrary
          inputPosition='inline'
          placeholder='可输入重复值观察invalid态'
          value={invalidTags}
          onChange={setInvalidTags}
        />
      </div>
      <div>
        宽度自适应（inline，预设3标签，输入框铺满本行剩余空间）
        <TagMultiselect
          className='cmp-width'
          allowArbitrary
          inputPosition='inline'
          placeholder='输入框应铺满本行剩余空间'
          defaultValue={['alpha', 'beta', 'gamma']}
        />
      </div>
      <div>
        拖拽重排（allowReordering缺省true，拖动标签换位）
        <TagMultiselect
          className='cmp-reorder'
          allowArbitrary
          inputPosition='outline'
          placeholder='拖动标签可调整顺序'
          value={reorder}
          onChange={setReorder}
        />
        <span className='cmp-reorder-value'>{JSON.stringify(reorder)}</span>
      </div>
      <div>
        禁用重排（allowReordering:false，新增按白名单顺序插入）
        <TagMultiselect
          className='cmp-noreorder'
          allowedValues={['x', 'y', 'z']}
          allowReordering={false}
          inputPosition='inline'
          placeholder='依次输入z、x观察插入顺序'
          value={noReorder}
          onChange={setNoReorder}
        />
        <span className='cmp-noreorder-value'>{JSON.stringify(noReorder)}</span>
      </div>
      <div>
        固定标签（React增强：固定项不可拖拽/移除；原版无fixed概念）
        <MenuTagMultiselect
          className='cmp-fixed'
          inputPosition='outline'
          options={reactFixedOptions}
          value={fixed}
          onChange={setFixed}
        />
        <span className='cmp-fixed-value'>{JSON.stringify(fixed)}</span>
      </div>
      <p>
        change值：
        {JSON.stringify({
          基础: basic,
          白名单: whitelist,
          菜单: menu,
          上限: limit,
          非法展示: invalidTags,
          重排: reorder,
          禁重排: noReorder,
          固定: fixed,
        })}
      </p>
    </div>
  );
}

function TagMultiselectComparePage() {
  return (
    <CompareLayout
      title='TagMultiselect / MenuTagMultiselect 对照'
      description={(
        <>
          对照点：标签以chip呈现、输入后Enter添加、Backspace（未输入时）移除末尾标签并回填文本、
          点击标签移回输入框编辑、←→在标签与输入框间导航、Escape清空输入；白名单校验（非法值不添加）、
          tagLimit满额后输入禁用、allowDisplayInvalidTags以invalid态展示非法/重复值；
          菜单形态：输入过滤菜单、↑↓移动高亮、Enter选定、点击切换标签、已添加标签的菜单项呈选中态；
          inline输入框宽度自适应（输入框铺满本行剩余空间，空间不足时换行取整行）；
          拖拽重排（拖动标签换位，drop后写回值顺序）；固定标签为React增强（原版无fixed概念）。
        </>
      )}
    >
      <CompareColumns original={<OriginalTags />}>
        <ReactTags />
      </CompareColumns>
    </CompareLayout>
  );
}

TagMultiselectComparePage.displayName = 'TagMultiselectComparePage';

export default TagMultiselectComparePage;
