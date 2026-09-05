import React, { useEffect, useRef, useState } from 'react';
import { ensureOOUI, unwrapJQuery } from '../../components/ooui';



/** 原版OO.ui.Toolbar演示页（本工程尚未实现Toolbar，仅展示原版效果供参考） */
function ToolbarDemoPage() {
  const barHostRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('未初始化');
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    ensureOOUI().then((OO: any) => {
      if (cancelled || !barHostRef.current) {
        return;
      }

      const createTool = (name: string, title: string, icon: string) => {
        class DemoTool extends OO.ui.Tool {
          constructor(...args: unknown[]) {
            super(...args);
            this.setIcon(icon);
            this.on('select', () => this.setActive());
          }
          onUpdateState() { /* 演示工具不响应应用状态 */ }
        }
        // class语法不会执行OOJS的inheritClass，需手动建立子类自己的static（否则与Tool.static共享、互相覆盖）
        DemoTool.static = Object.create(OO.ui.Tool.static) as unknown as typeof DemoTool.static;
        Object.assign(DemoTool.static, {
          name,
          title,
          icon,
          group: 'demo',
        });
        return DemoTool;
      };

      const toolFactory = new OO.ui.ToolFactory();
      for (const tool of [
        createTool('person', '个人', 'user'),
        createTool('help', '帮助', 'help'),
        createTool('comment', '评论', 'comment'),
        createTool('settings', '设置', 'settings'),
        createTool('image', '图片', 'image'),
      ]) {
        toolFactory.register(tool);
      }
      const toolGroupFactory = new OO.ui.ToolGroupFactory();
      toolGroupFactory.register(OO.ui.BarToolGroup);
      toolGroupFactory.register(OO.ui.ListToolGroup);

      const toolbar = new OO.ui.Toolbar(toolFactory, toolGroupFactory);
      toolbar.setup([
        { type: 'bar', include: ['person', 'help'] },
        { type: 'list', include: ['comment', 'settings', 'image'], icon: 'ellipsis', indicator: 'down', label: '更多' },
      ]);
      toolbar.initialize();
      barHostRef.current.appendChild(unwrapJQuery(toolbar.$element));

      // 记录工具点击
      barHostRef.current.addEventListener('click', (ev) => {
        const label = (ev.target as HTMLElement).closest('.oo-ui-tool')?.getAttribute('aria-label')
          ?? (ev.target as HTMLElement).textContent ?? '';
        if (label.trim()) {
          setLog((prev) => [`点击：${label.trim()}`, ...prev].slice(0, 5));
        }
      });
      setStatus('已就绪');
    }).catch(() => {
      setStatus('加载失败');
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <h1>OO.ui.Toolbar 原版示例</h1>
      <p>
        Toolbar 是工具栏容器：由 ToolFactory 生产的工具（Tool）按 ToolGroup 分组排列在一条横栏上，
        点击工具触发应用动作。bar型分组平铺按钮、list型分组收进下拉把手（把手展开即PopupToolGroup的应用场景）。
        本工程尚未实现该组件，此页仅为原版效果演示。
      </p>
      <p>{status}</p>
      <div ref={barHostRef} />
      <h2>点击记录</h2>
      <ul>
        {log.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
    </>
  );
}

ToolbarDemoPage.displayName = 'ToolbarDemoPage';

export default ToolbarDemoPage;
