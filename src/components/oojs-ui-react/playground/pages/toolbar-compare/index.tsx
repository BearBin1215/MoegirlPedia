import React, { useEffect, useRef, useState } from 'react';
import {
  BarToolGroup,
  ListToolGroup,
  MenuToolGroup,
  Toolbar,
  type ToolProps,
} from 'oojs-ui-react';
import { createOOUIWidgets, ensureOOUI, unwrapJQuery, compareLayoutStyle } from '../../components/ooui';

function OriginalToolbar() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('未初始化');
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    const host = createOOUIWidgets();
    ensureOOUI().then((OO) => {
      if (cancelled || !containerRef.current) {
        return;
      }
      const ui = OO.ui as any;
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
        // 图标名须为0.49.2主题CSS实际存在的图标（user/comment在该版本不存在，渲染为空白）
        createTool('person', '个人', 'userAvatar'),
        createTool('help', '帮助', 'help'),
        createTool('comment', '评论', 'speechBubbles'),
        createTool('settings', '设置', 'settings'),
        createTool('image', '图片', 'image'),
        // menu组工具无图标，与React侧menuTools一致
        createTool('optionOne', '选项一'),
        createTool('optionTwo', '选项二'),
        createTool('optionThree', '选项三'),
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
        { type: 'menu', include: ['optionOne', 'optionTwo'], icon: 'ellipsis', label: '右侧', align: 'after' },
      ]);
      // 原版要求先attach再initialize（narrow阈值依赖布局测量）
      containerRef.current.appendChild(unwrapJQuery(top.$element));
      top.initialize();
      host.add(top);

      // bottom工具栏：弹层面板向上展开、indicator随position翻转（原版由
      // oo-ui-toolbar-position-bottom的CSS承接），对照React侧的组件缺省展示
      const bottom = new ui.Toolbar(toolFactory, toolGroupFactory, { position: 'bottom' });
      bottom.setup([
        { type: 'list', include: ['comment', 'settings', 'image'], icon: 'ellipsis', indicator: 'down', label: '更多' },
        { type: 'menu', include: ['optionOne', 'optionTwo', 'optionThree'], icon: 'ellipsis', label: '菜单' },
      ]);
      containerRef.current.appendChild(unwrapJQuery(bottom.$element));
      bottom.initialize();
      host.add(bottom);

      setStatus('原版已就绪');
    }).catch(() => setStatus('原版加载失败'));
    return () => {
      cancelled = true;
      // 仅destroy()才解除initialize绑定的window resize监听并移除DOM，直接丢弃会残留监听
      host.destroyAll();
    };
  }, []);

  return (
    <div>
      <p>{status}</p>
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

function ReactToolbar() {
  const [active, setActive] = useState<Record<string, boolean>>({});
  const toggle = (name: string) => {
    setActive((prev) => ({ ...prev, [name]: !prev[name] }));
  };
  const [log, setLog] = useState<string[]>([]);

  const handleSelect = (label: string) => {
    setLog((prev) => [`点击：${label}`, ...prev].slice(0, 5));
  };

  return (
    <div>
      <Toolbar>
        <BarToolGroup
          tools={barTools(active, (name) => {
            toggle(name);
            handleSelect(barTools({}, () => undefined).find((t) => t.name === name)?.title ?? name);
          })}
        />
        <ListToolGroup
          label='更多'
          icon='ellipsis'
          indicator='down'
          tools={listTools(active, (name) => {
            toggle(name);
            handleSelect(listTools({}, () => undefined).find((t) => t.name === name)?.title ?? name);
          })}
        />
        <MenuToolGroup
          label='菜单'
          icon='ellipsis'
          tools={menuTools(active, (name) => {
            toggle(name);
            handleSelect(menuTools({}, () => undefined).find((t) => t.name === name)?.title ?? name);
          })}
        />
        {/* align='after'：排到工具栏右侧（对应原版ToolGroup的align配置） */}
        <MenuToolGroup
          label='右侧'
          icon='ellipsis'
          align='after'
          tools={menuTools(active, (name) => {
            toggle(name);
            handleSelect(menuTools({}, () => undefined).find((t) => t.name === name)?.title ?? name);
          })}
        />
      </Toolbar>
      {/* bottom工具栏：弹出面板向上展开、indicator随position翻转（均对齐原版），此处用组件缺省 */}
      <h3>bottom工具栏</h3>
      <Toolbar position='bottom'>
        <ListToolGroup
          label='更多'
          icon='ellipsis'
          tools={listTools(active, (name) => {
            toggle(name);
            handleSelect(listTools({}, () => undefined).find((t) => t.name === name)?.title ?? name);
          })}
        />
        <MenuToolGroup
          label='菜单'
          icon='ellipsis'
          tools={menuTools(active, (name) => {
            toggle(name);
            handleSelect(menuTools({}, () => undefined).find((t) => t.name === name)?.title ?? name);
          })}
        />
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
    <>
      <h1>Toolbar 对照 - 原版oojs-ui vs oojs-ui-react</h1>
      <p>
        对照点：Bar组平铺按钮（标题tooltip、按压态）、List组下拉面板（选中收起、标题为标签文本）、
        Menu组（把手标签按激活工具合成、选中不关闭时更新标签）、工具active态样式。
        原版为ToolFactory/ToolGroupFactory注册模式，React版为声明式tools props。
      </p>
      <div style={compareLayoutStyle}>
        <div style={{ flex: 1 }}>
          <h2>原版oojs-ui</h2>
          <OriginalToolbar />
        </div>
        <div style={{ flex: 1 }}>
          <h2>oojs-ui-react</h2>
          <ReactToolbar />
        </div>
      </div>
    </>
  );
}

ToolbarComparePage.displayName = 'ToolbarComparePage';

export default ToolbarComparePage;
