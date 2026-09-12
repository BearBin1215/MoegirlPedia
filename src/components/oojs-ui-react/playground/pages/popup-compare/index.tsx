import React, { useRef, useState } from 'react';
import { Button, Popup, PopupButton } from 'oojs-ui-react';
import { unwrapJQuery } from '../../components/ooui';
import { useOriginalWidgets } from '../../components/original';
import { CompareColumns, CompareLayout } from '../../components/CompareLayout';

/** 原版侧：PopupButtonWidget + 手动toggle的PopupWidget（各方位/无箭头/悬浮） */
function OriginalPopups() {
  const buttonHostRef = useRef<HTMLDivElement>(null);
  const aboveHostRef = useRef<HTMLDivElement>(null);
  const sideHostRef = useRef<HTMLDivElement>(null);
  const noArrowHostRef = useRef<HTMLDivElement>(null);
  const hoverHostRef = useRef<HTMLDivElement>(null);
  useOriginalWidgets((oo, _container, register) => {
    const $ = (window as unknown as { $: (arg: Node) => unknown }).$;
    // 与React版等价：带头部/关闭按钮、padded
    const button = new oo.ui.PopupButtonWidget({
      label: '原版弹层按钮',
      icon: 'help',
      popup: {
        padded: true,
        head: true,
      },
    });
    register(button);
    button.getPopup().$body.append(
      Object.assign(document.createElement('p'), { textContent: '这是原版PopupButtonWidget的内容。' }),
    );
    buttonHostRef.current?.appendChild(unwrapJQuery(button.$element));

    // 原版PopupWidget的$content要求jQuery对象
    const anchorButton = new oo.ui.ButtonWidget({ label: '原版上方弹出' });
    const popup = new oo.ui.PopupWidget({
      $content: $(Object.assign(document.createElement('p'), { textContent: '原版受控Popup，上方弹出。' })),
      padded: true,
      $floatableContainer: anchorButton.$element,
      position: 'above',
      autoClose: true,
      $autoCloseIgnore: anchorButton.$element,
    });
    register(anchorButton, popup);
    aboveHostRef.current?.appendChild(unwrapJQuery(anchorButton.$element));
    aboveHostRef.current?.appendChild(unwrapJQuery(popup.$element));
    anchorButton.on('click', () => popup.toggle(true));

    // 侧面弹出对照：before（LTR下左侧）/after（LTR下右侧）
    ([{ label: '原版左侧弹出', position: 'before' }, { label: '原版右侧弹出', position: 'after' }] as const)
      .forEach(({ label, position }) => {
        const sideButton = new oo.ui.ButtonWidget({ label });
        const sidePopup = new oo.ui.PopupWidget({
          $content: $(Object.assign(document.createElement('p'), { textContent: `原版${label}内容。` })),
          padded: true,
          $floatableContainer: sideButton.$element,
          position,
          autoClose: true,
          $autoCloseIgnore: sideButton.$element,
        });
        register(sideButton, sidePopup);
        sideHostRef.current?.appendChild(unwrapJQuery(sideButton.$element));
        sideHostRef.current?.appendChild(unwrapJQuery(sidePopup.$element));
        sideButton.on('click', () => sidePopup.toggle());
      });

    // 无箭头对照：原版anchor:false，React对应anchor={false}
    const noArrowButton = new oo.ui.ButtonWidget({ label: '原版无箭头弹层' });
    const noArrowPopup = new oo.ui.PopupWidget({
      $content: $(Object.assign(document.createElement('p'), { textContent: '原版无箭头Popup，下方弹出。' })),
      padded: true,
      anchor: false,
      $floatableContainer: noArrowButton.$element,
      autoClose: true,
      $autoCloseIgnore: noArrowButton.$element,
    });
    register(noArrowButton, noArrowPopup);
    noArrowHostRef.current?.appendChild(unwrapJQuery(noArrowButton.$element));
    noArrowHostRef.current?.appendChild(unwrapJQuery(noArrowPopup.$element));
    noArrowButton.on('click', () => noArrowPopup.toggle());

    // 悬浮触发对照：原版无内置封装，容器mouseenter/mouseleave手动toggle（两侧等价接线）
    const hoverButton = new oo.ui.ButtonWidget({ label: '悬浮我试试（原版）' });
    const hoverPopup = new oo.ui.PopupWidget({
      $content: $(Object.assign(document.createElement('p'), { textContent: '原版悬浮弹层，移开后消失。' })),
      padded: true,
      $floatableContainer: hoverButton.$element,
      position: 'below',
    });
    register(hoverButton, hoverPopup);
    const hoverHost = hoverHostRef.current;
    if (hoverHost) {
      hoverHost.appendChild(unwrapJQuery(hoverButton.$element));
      hoverHost.appendChild(unwrapJQuery(hoverPopup.$element));
      hoverHost.addEventListener('mouseenter', () => hoverPopup.toggle(true));
      hoverHost.addEventListener('mouseleave', () => hoverPopup.toggle(false));
    }
  });

  return (
    <div>
      <div ref={buttonHostRef} />
      <div style={{ height: '1em' }} />
      <div ref={aboveHostRef} />
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

/** 原版侧：靠近视口底部的PopupButton，autoFlip默认开启应向上翻转 */
function OriginalAutoFlip() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const $ = (window as unknown as { $: (arg: Node) => unknown }).$;
    const button = new oo.ui.PopupButtonWidget({
      label: '原版接近底部',
      popup: {
        padded: true,
        $content: $(Object.assign(document.createElement('p'), { textContent: '我应该向上翻转显示。' })),
      },
    });
    register(button);
    container.appendChild(unwrapJQuery(button.$element));
  });

  return (
    <div>
      <p style={{ marginTop: '60vh' }} ref={containerRef} />
    </div>
  );
}

/** React侧：靠近视口底部的PopupButton（受控开关），验证autoFlip翻转 */
function ReactAutoFlip() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <p style={{ marginTop: '60vh' }}>
        <PopupButton
          label='接近底部'
          padded
          position='below'
          open={open}
          onClick={() => setOpen((v) => !v)}
          onClose={() => setOpen(false)}
          popupContent={<p>我应该向上翻转显示。</p>}
        >
          接近底部
        </PopupButton>
      </p>
    </div>
  );
}

function PopupComparePage() {
  return (
    <CompareLayout
      title='Popup对照 - 原版oojs-ui vs oojs-ui-react'
      description={(
        <>
          左侧为本地安装的原版oojs-ui，右侧为本组件库实现。
          两者行为对照点：点击开合、锚点箭头指向、position/align定位（含before/after侧面弹出）、
          无箭头弹层、autoFlip翻转、autoClose（点击外部关闭且忽略触发按钮）、头部关闭按钮、
          容器边缘钳制（就近滚动容器+containerPadding，钳制后锚点仍指向触发器中心）。
        </>
      )}
    >
      <h2>各方位与形态</h2>
      <CompareColumns original={<OriginalPopups />}>
        <ReactPopups />
      </CompareColumns>

      <h2>接近视口底部自动翻转</h2>
      <CompareColumns original={<OriginalAutoFlip />}>
        <ReactAutoFlip />
      </CompareColumns>
    </CompareLayout>
  );
}

PopupComparePage.displayName = 'PopupComparePage';

export default PopupComparePage;
