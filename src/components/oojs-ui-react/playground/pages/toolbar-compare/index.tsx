import React, { useState } from 'react';
import {
  BarToolGroup,
  ListToolGroup,
  MenuToolGroup,
  Toolbar,
  type ToolProps,
} from 'oojs-ui-react';
import { unwrapJQuery } from '../../components/ooui';
import { useOriginalWidgets } from '../../components/original';
import { CompareColumns, CompareLayout } from '../../components/CompareLayout';

function OriginalToolbar() {
  const [log, setLog] = useState<string[]>([]);
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as any;
    const createTool = (name: string, title: string, icon?: string) => {
      class DemoTool extends ui.Tool {
        constructor(...args: unknown[]) {
          super(...args);
          if (icon) {
            this.setIcon(icon);
          }
        }
        // 原版要求子类实现onSelect原型方法（ToolGroup.onMouseKeyUp直接调用
        // this.pressed.onSelect()，基类无缺省实现，也不派发'select'事件）
        onSelect() {
          setLog((prev) => [`点击：${title}`, ...prev].slice(0, 5));
          // 原版ToolGroup将active兼作按压视觉态（mousedown时setActive(true)），
          // 故不能以isActive()取反（读到的是按压态），须用实例自有标志，与官方Demo一致
          this.reallyActive = !this.reallyActive;
          this.setActive(this.reallyActive);
          // updateState广播给工具实例所属的工具栏（Tool构造时记录this.toolbar）；
          // 两个工具栏共享工具工厂，不能经全局变量反查（会串到最后创建的那条）
          this.toolbar?.emit('updateState');
        }
        onUpdateState() { /* 演示工具不响应应用状态 */ }
      }
      DemoTool.static = Object.create(ui.Tool.static);
      Object.assign(DemoTool.static, { name, title, icon, group: 'demo' });
      return DemoTool;
    };

    const toolFactory = new ui.ToolFactory();
    for (const tool of [
      // 图标名须为当前版本主题CSS实际存在的图标（user/comment在该版本不存在，渲染为空白）
      createTool('person', '个人', 'userAvatar'),
      createTool('help', '帮助', 'help'),
      createTool('comment', '评论', 'speechBubbles'),
      createTool('settings', '设置', 'settings'),
      createTool('image', '图片', 'image'),
      // menu组工具无图标，与React侧menuTools一致
      createTool('optionOne', '选项一'),
      createTool('optionTwo', '选项二'),
      createTool('optionThree', '选项三'),
      // 原版工具按工具栏独占预留（ToolGroup.populate经isToolAvailable/reserveTool），
      // 同一工具不能同时进两个工具组，右侧组须用独立工具
      createTool('optionFour', '选项四'),
      createTool('optionFive', '选项五'),
    ]) {
      toolFactory.register(tool);
    }
    const toolGroupFactory = new ui.ToolGroupFactory();
    toolGroupFactory.register(ui.BarToolGroup);
    toolGroupFactory.register(ui.ListToolGroup);
    toolGroupFactory.register(ui.MenuToolGroup);

    // 工厂供两条工具栏共享（工具实例由各工具组自行创建），分组结构对齐React侧
    const top = new ui.Toolbar(toolFactory, toolGroupFactory);
    top.setup([
      { type: 'bar', include: ['person', 'help'] },
      { type: 'list', include: ['comment', 'settings', 'image'], icon: 'ellipsis', indicator: 'down', label: '更多' },
      { type: 'menu', include: ['optionOne', 'optionTwo', 'optionThree'], icon: 'ellipsis', label: '菜单' },
      // align:'after'：工具组排到工具栏右侧的$after容器（原版insertItemElements）
      { type: 'menu', include: ['optionFour', 'optionFive'], icon: 'ellipsis', label: '右侧', align: 'after' },
    ]);
    // 原版要求先attach再initialize（narrow阈值依赖布局测量）
    container.appendChild(unwrapJQuery(top.$element));
    top.initialize();
    register(top);

    // bottom工具栏：弹层面板向上展开、indicator随position翻转（原版由
    // oo-ui-toolbar-position-bottom的CSS承接），对照React侧的组件缺省展示
    const bottom = new ui.Toolbar(toolFactory, toolGroupFactory, { position: 'bottom' });
    bottom.setup([
      { type: 'list', include: ['comment', 'settings', 'image'], icon: 'ellipsis', indicator: 'down', label: '更多' },
      { type: 'menu', include: ['optionOne', 'optionTwo', 'optionThree'], icon: 'ellipsis', label: '菜单' },
    ]);
    container.appendChild(unwrapJQuery(bottom.$element));
    bottom.initialize();
    register(bottom);
  });

  return (
    <div>
      <div ref={containerRef} />
      <h3>点击记录</h3>
      <ul>
        {log.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
    </div>
  );
}

const barTools = (active: Record<string, boolean>, toggle: (name: string) => void): ToolProps[] => [
  { name: 'person', title: '个人', icon: 'userAvatar', active: !!active.person, onSelect: () => toggle('person') },
  { name: 'help', title: '帮助', icon: 'help', active: !!active.help, onSelect: () => toggle('help') },
];
const listTools = (active: Record<string, boolean>, toggle: (name: string) => void): ToolProps[] => [
  { name: 'comment', title: '评论', icon: 'speechBubbles', active: !!active.comment, onSelect: () => toggle('comment') },
  { name: 'settings', title: '设置', icon: 'settings', active: !!active.settings, onSelect: () => toggle('settings') },
  { name: 'image', title: '图片', icon: 'image', active: !!active.image, onSelect: () => toggle('image') },
];
const menuTools = (active: Record<string, boolean>, toggle: (name: string) => void): ToolProps[] => [
  { name: 'optionOne', title: '选项一', active: !!active.optionOne, onSelect: () => toggle('optionOne') },
  { name: 'optionTwo', title: '选项二', active: !!active.optionTwo, onSelect: () => toggle('optionTwo') },
  { name: 'optionThree', title: '选项三', disabled: true, onSelect: () => toggle('optionThree') },
];
// 右侧组用独立工具（原版工具按工具栏独占预留，同一工具不能进两个组）
const rightMenuTools = (active: Record<string, boolean>, toggle: (name: string) => void): ToolProps[] => [
  { name: 'optionFour', title: '选项四', active: !!active.optionFour, onSelect: () => toggle('optionFour') },
  { name: 'optionFive', title: '选项五', active: !!active.optionFive, onSelect: () => toggle('optionFive') },
];

/** 每个工具组独立的active状态：toggle切换本组激活项并记录点击的工具标题 */
function useGroupTools(
  defs: (active: Record<string, boolean>, toggle: (name: string) => void) => ToolProps[],
  onLog: (title: string) => void,
) {
  const [active, setActive] = useState<Record<string, boolean>>({});
  const toggle = (name: string) => {
    setActive((prev) => ({ ...prev, [name]: !prev[name] }));
    onLog(defs({}, () => undefined).find((t) => t.name === name)?.title ?? name);
  };
  return defs(active, toggle);
}

function ReactBarGroup({ onLog }: { onLog: (title: string) => void }) {
  const tools = useGroupTools(barTools, onLog);
  return <BarToolGroup tools={tools} />;
}

function ReactListGroup({ onLog, label, indicator }: { onLog: (title: string) => void; label: string; indicator?: 'down' }) {
  const tools = useGroupTools(listTools, onLog);
  return <ListToolGroup label={label} icon='ellipsis' indicator={indicator} tools={tools} />;
}

function ReactMenuGroup({ onLog, label, align, defs = menuTools }: {
  onLog: (title: string) => void;
  label: string;
  align?: 'after';
  defs?: (active: Record<string, boolean>, toggle: (name: string) => void) => ToolProps[];
}) {
  const tools = useGroupTools(defs, onLog);
  return <MenuToolGroup label={label} icon='ellipsis' align={align} tools={tools} />;
}

function ReactToolbar() {
  const [log, setLog] = useState<string[]>([]);

  const handleSelect = (title: string) => {
    setLog((prev) => [`点击：${title}`, ...prev].slice(0, 5));
  };

  return (
    <div>
      {/* active状态按组隔离：对齐原版各ToolGroup实例化各自Tool实例的语义，
          未激活本组工具时把手标签显示组标签而非激活项标题 */}
      <Toolbar>
        <ReactBarGroup onLog={handleSelect} />
        <ReactListGroup onLog={handleSelect} label='更多' indicator='down' />
        <ReactMenuGroup onLog={handleSelect} label='菜单' />
        {/* align='after'：排到工具栏右侧（对应原版ToolGroup的align配置） */}
        <ReactMenuGroup onLog={handleSelect} label='右侧' align='after' defs={rightMenuTools} />
      </Toolbar>
      {/* bottom工具栏：弹出面板向上展开、indicator随position翻转（均对齐原版），此处用组件缺省 */}
      <Toolbar position='bottom'>
        <ReactListGroup onLog={handleSelect} label='更多' />
        <ReactMenuGroup onLog={handleSelect} label='菜单' />
      </Toolbar>
      <h3>点击记录</h3>
      <ul>
        {log.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
    </div>
  );
}

function ToolbarComparePage() {
  return (
    <CompareLayout
      title='Toolbar 对照 - 原版oojs-ui vs oojs-ui-react'
      description={(
        <>
          对照点：Bar组平铺按钮（标题tooltip、按压态）、List组下拉面板（选中收起、标题为标签文本）、
          Menu组（把手标签按激活工具合成、选中不关闭时更新标签）、工具active态样式。
          原版为ToolFactory/ToolGroupFactory注册模式，React版为声明式tools props。
        </>
      )}
    >
      <CompareColumns original={<OriginalToolbar />}>
        <ReactToolbar />
      </CompareColumns>
    </CompareLayout>
  );
}

ToolbarComparePage.displayName = 'ToolbarComparePage';

export default ToolbarComparePage;
