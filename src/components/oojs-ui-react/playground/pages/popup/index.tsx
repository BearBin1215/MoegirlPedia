import React, { useRef, useState } from 'react';
import { Button, Popup, PopupButton, TextInput } from 'oojs-ui-react';

function PopupPage() {
  const [open, setOpen] = useState(false);
  const [openBelow, setOpenBelow] = useState(false);
  const [hoverOpen, setHoverOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const hoverRef = useRef<HTMLSpanElement>(null);

  return (
    <>
      <h1>Popup - 弹出层</h1>

      <h2>PopupButton（各方位）</h2>
      <p>
        <PopupButton framed={false} icon='info' padded aria-label='说明' popupContent='下方弹出的内容'>
          下方弹出
        </PopupButton>{' '}
        <PopupButton label='上方弹出' padded position='above' popupContent='上方弹出的内容'>
          上方弹出
        </PopupButton>{' '}
        <PopupButton label='右侧弹出' padded position='after' align='forwards' popupContent='右侧弹出的内容'>
          右侧弹出
        </PopupButton>{' '}
        <PopupButton label='左侧弹出' padded position='before' popupContent='左侧弹出的内容'>
          左侧弹出
        </PopupButton>
      </p>

      <h2>带头部与关闭按钮</h2>
      <p>
        <PopupButton label='带标题的弹层' padded head icon='help' popupContent='这是说明内容。点击右上角×或点击外部区域可关闭。'>
          带标题弹层
        </PopupButton>
      </p>

      <h2>受控Popup（含autoCloseIgnore）</h2>
      <p>
        <Button
          ref={containerRef}
          onClick={() => setOpen((v) => !v)}
          active={open}
        >
          {open ? '关闭' : '打开'}受控弹层
        </Button>{' '}
        <Popup
          open={open}
          container={containerRef}
          autoClose
          autoCloseIgnore={containerRef}
          head
          label='受控弹层'
          padded
          width={260}
          onClose={() => setOpen(false)}
        >
          点击按钮或弹层外部可关闭。
        </Popup>
      </p>

      <h2>悬浮触发（原版无此封装，经open受控属性自行接线）</h2>
      <p>
        {/* ref/onMouseEnter直接挂Button（锚定容器=按钮本身）：若挂在包裹span等inline盒上，
            其底边比按钮实际底边高，弹层会与按钮重合，悬停重合带时将陷入"关闭→mouseenter→打开"闪烁 */}
        <Button
          ref={hoverRef}
          onMouseEnter={() => setHoverOpen(true)}
          onMouseLeave={() => setHoverOpen(false)}
        >
          悬浮我试试
        </Button>
        <Popup
          open={hoverOpen}
          container={hoverRef}
          padded
          align='forwards'
          anchor={false}
        >
          鼠标悬浮显示，移开后消失。
        </Popup>
      </p>

      <h2>自动翻转（靠近视口底部时向上翻转）</h2>
      <p style={{ marginTop: '60vh' }}>
        <PopupButton label='接近底部' padded position='below' open={openBelow} onClick={() => setOpenBelow((v) => !v)} onClose={() => setOpenBelow(false)} popupContent='我应该向上翻转显示。'>
          接近底部
        </PopupButton>
      </p>

      <h2>表单内容</h2>
      <p>
        <PopupButton label='含表单的弹层'
          padded
          head
          width={280}
          popupContent={
            <div>
              <p>
                <TextInput placeholder='在弹层中输入' />
              </p>
              <Button flags='primary'>确定</Button>
            </div>
          }
        >
          弹层表单
        </PopupButton>
      </p>
    </>
  );
}

PopupPage.displayName = 'PopupPage';

export default PopupPage;
