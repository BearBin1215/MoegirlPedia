import React, { useEffect, useRef, useState } from 'react';
import { Button, Popup, PopupButton } from 'oojs-ui-react';
import { ensureOOUI, unwrapJQuery } from '../../components/ooui';

/** 原版侧：PopupButtonWidget + 手动toggle的PopupWidget */
function OriginalPopups() {
  const buttonHostRef = useRef<HTMLDivElement>(null);
  const popupHostRef = useRef<HTMLDivElement>(null);
  const sideHostRef = useRef<HTMLDivElement>(null);
  const noArrowHostRef = useRef<HTMLDivElement>(null);
  const hoverHostRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('未初始化');

  useEffect(() => {
    let cancelled = false;
    ensureOOUI().then((OO) => {
      if (cancelled || !buttonHostRef.current || !popupHostRef.current
        || !sideHostRef.current || !noArrowHostRef.current) {
        return;
      }
      // 与React版等价：带头部/关闭按钮、padded、autoClose并忽略按钮
      const button = new OO.ui.PopupButtonWidget({
        label: '原版弹层按钮',
        icon: 'help',
        popup: {
          padded: true,
          head: true,
        },
      });
      button.getPopup().$body.append(
        Object.assign(document.createElement('p'), { textContent: '这是原版PopupButtonWidget的内容。' }),
      );
      buttonHostRef.current.appendChild( unwrapJQuery( button.$element ) );

      // 原版PopupWidget的$content要求jQuery对象
      const $ = (window as unknown as { $: (arg: Node) => unknown }).$;
      const anchorButton = new OO.ui.ButtonWidget({ label: '原版上方弹出' });
      popupHostRef.current.appendChild( unwrapJQuery( anchorButton.$element ) );
      const popup = new OO.ui.PopupWidget( {
        $content: $(Object.assign(document.createElement('p'), { textContent: '原版受控Popup，上方弹出。' })),
        padded: true,
        $floatableContainer: anchorButton.$element,
        position: 'above',
        autoClose: true,
        $autoCloseIgnore: anchorButton.$element,
      } );
      popupHostRef.current.appendChild( unwrapJQuery( popup.$element ) );
      anchorButton.on( 'click', () => popup.toggle( true ) );

      // 侧面弹出对照：before（LTR下左侧）/after（LTR下右侧）
      ( [ { label: '原版左侧弹出', position: 'before' }, { label: '原版右侧弹出', position: 'after' } ] as const )
        .forEach( ( { label, position } ) => {
          const sideButton = new OO.ui.ButtonWidget( { label } );
          const sidePopup = new OO.ui.PopupWidget( {
            $content: $(Object.assign(document.createElement('p'), { textContent: `原版${label}内容。` })),
            padded: true,
            $floatableContainer: sideButton.$element,
            position,
            autoClose: true,
            $autoCloseIgnore: sideButton.$element,
          } );
          sideHostRef.current!.appendChild( unwrapJQuery( sideButton.$element ) );
          sideHostRef.current!.appendChild( unwrapJQuery( sidePopup.$element ) );
          sideButton.on( 'click', () => sidePopup.toggle() );
        } );

      // 无箭头对照：原版anchor:false，React对应anchor={false}
      const noArrowButton = new OO.ui.ButtonWidget( { label: '原版无箭头弹层' } );
      const noArrowPopup = new OO.ui.PopupWidget( {
        $content: $(Object.assign(document.createElement('p'), { textContent: '原版无箭头Popup，下方弹出。' })),
        padded: true,
        anchor: false,
        $floatableContainer: noArrowButton.$element,
        autoClose: true,
        $autoCloseIgnore: noArrowButton.$element,
      } );
      noArrowHostRef.current.appendChild( unwrapJQuery( noArrowButton.$element ) );
      noArrowHostRef.current.appendChild( unwrapJQuery( noArrowPopup.$element ) );
      noArrowButton.on( 'click', () => noArrowPopup.toggle() );

      // 悬浮触发对照：原版无内置封装，容器mouseenter/mouseleave手动toggle（两侧等价接线）
      const hoverButton = new OO.ui.ButtonWidget( { label: '悬浮我试试（原版）' } );
      const hoverPopup = new OO.ui.PopupWidget( {
        $content: $(Object.assign(document.createElement('p'), { textContent: '原版悬浮弹层，移开后消失。' })),
        padded: true,
        $floatableContainer: hoverButton.$element,
        position: 'below',
      } );
      const hoverHost = hoverHostRef.current;
      if (!hoverHost) {
        return;
      }
      hoverHost.appendChild( unwrapJQuery( hoverButton.$element ) );
      hoverHost.appendChild( unwrapJQuery( hoverPopup.$element ) );
      hoverHost.addEventListener( 'mouseenter', () => hoverPopup.toggle( true ) );
      hoverHost.addEventListener( 'mouseleave', () => hoverPopup.toggle( false ) );

      setStatus('原版已就绪');
    }).catch(() => {
      setStatus('原版加载失败');
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <p>{status}</p>
      <div ref={buttonHostRef} />
      <div style={{ height: '1em' }} />
      <div ref={popupHostRef} />
      <div style={{ height: '1em' }} />
      <div ref={sideHostRef} />
      <div style={{ height: '1em' }} />
      <div ref={noArrowHostRef} />
      <div style={{ height: '1em' }} />
      <div ref={hoverHostRef} style={{ display: 'inline-block', position: 'relative' }} />
    </div>
  );
}

/** React侧：受控Popup，锚定按钮、上方弹出（与原版手动toggle对照） */
function OriginalAboveReact() {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        ref={ref}
        onClick={() => setOpen((v) => !v)}
      >
        原版上方弹出
      </Button>
      <Popup
        open={open}
        container={ref}
        padded
        position='above'
        autoClose
        autoCloseIgnore={ref}
        onClose={() => setOpen(false)}
      >
        <p>React受控Popup，上方弹出。</p>
      </Popup>
    </>
  );
}

/** React侧：侧面弹出对照（before=左侧/after=右侧，与原版手动toggle对照） */
function SideReact({ label, position }: { label: string; position: 'before' | 'after' }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        ref={ref}
        onClick={() => setOpen((v) => !v)}
      >
        {label}
      </Button>
      <Popup
        open={open}
        container={ref}
        padded
        position={position}
        autoClose
        autoCloseIgnore={ref}
        onClose={() => setOpen(false)}
      >
        <p>React{label}内容。</p>
      </Popup>
    </>
  );
}

/** React侧：无箭头对照（anchor={false}，与原版noArrow对照） */
function NoArrowReact() {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        ref={ref}
        onClick={() => setOpen((v) => !v)}
      >
        React无箭头弹层
      </Button>
      <Popup
        open={open}
        container={ref}
        padded
        anchor={false}
        autoClose
        autoCloseIgnore={ref}
        onClose={() => setOpen(false)}
      >
        <p>React无箭头Popup，下方弹出。</p>
      </Popup>
    </>
  );
}

function ReactPopups() {
  const hoverRef = useRef<HTMLDivElement>(null);
  const [hoverOpen, setHoverOpen] = useState(false);

  return (
    <div>
      <p>React版已就绪</p>
      <PopupButton padded head icon='help' popupContent={<p>这是React版PopupButton的内容。</p>}>
        React弹层按钮
      </PopupButton>
      <div style={{ height: '1em' }} />
      <OriginalAboveReact />
      <div style={{ height: '1em' }} />
      <p>
        <SideReact label='左侧弹出' position='before' />{' '}
        <SideReact label='右侧弹出' position='after' />
      </p>
      <p>
        <NoArrowReact />
      </p>
      <div
        ref={hoverRef}
        style={{ display: 'inline-block', position: 'relative' }}
        onMouseEnter={() => setHoverOpen(true)}
        onMouseLeave={() => setHoverOpen(false)}
      >
        <Button>悬浮我试试（React）</Button>
        {/* 弹层portal在body上，若不保持悬浮，指针从按钮移入弹层的瞬间会先触发关闭；
            原版弹层是宿主的子节点无此问题，此处补齐等价行为 */}
        <Popup
          open={hoverOpen}
          container={hoverRef}
          padded
          onMouseEnter={() => setHoverOpen(true)}
          onMouseLeave={() => setHoverOpen(false)}
        >
          <p>React悬浮弹层，移开后消失。</p>
        </Popup>
      </div>
    </div>
  );
}

function ComparePage() {
  return (
    <>
      <h1>Popup对照 - 原版oojs-ui vs oojs-ui-react</h1>
      <p>
        左侧为本地安装的原版oojs-ui，右侧为本组件库实现。
        两者行为对照点：点击开合、锚点箭头指向、position/align定位（含before/after侧面弹出）、
        无箭头弹层、autoFlip翻转、autoClose（点击外部关闭且忽略触发按钮）、头部关闭按钮、容器边缘钳制（就近滚动容器+containerPadding，钳制后锚点仍指向触发器中心）。
      </p>

      <div style={{ display: 'flex', gap: '2em', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minHeight: 220, position: 'relative' }}>
          <h2>原版oojs-ui</h2>
          <OriginalPopups />
        </div>
        <div style={{ flex: 1, minHeight: 220, position: 'relative' }}>
          <h2>oojs-ui-react</h2>
          <ReactPopups />
        </div>
      </div>
    </>
  );
}

ComparePage.displayName = 'PopupComparePage';

export default ComparePage;
