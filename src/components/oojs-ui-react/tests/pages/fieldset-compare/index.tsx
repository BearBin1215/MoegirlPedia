import React, { useEffect, useRef, useState } from 'react';
import { CheckboxInput, FieldLayout, FieldsetLayout, TextInput } from 'oojs-ui-react';
import { ensureOOUI, unwrapJQuery } from '../../components/ooui';

/** 原版侧：FieldsetLayout（label/icon/inline help/popup help） */
function OriginalFieldsets() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('未初始化');

  useEffect(() => {
    let cancelled = false;
    ensureOOUI().then((OO) => {
      if (cancelled || !hostRef.current) {
        return;
      }
      const fieldset = new OO.ui.FieldsetLayout({
        label: '原版字段集',
        icon: 'settings',
        help: '这是原版弹出帮助文本。',
      });
      fieldset.addItems([
        new OO.ui.FieldLayout(new OO.ui.TextInputWidget(), { label: '用户名', align: 'top' }),
        new OO.ui.FieldLayout(new OO.ui.CheckboxInputWidget(), { label: '记住我', align: 'inline' }),
      ]);
      hostRef.current.appendChild(unwrapJQuery(fieldset.$element));
      setStatus('原版已就绪');
    }).catch(() => {
      setStatus('原版加载失败');
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      <p>{status}</p>
      <div ref={hostRef} />
    </div>
  );
}

function ComparePage() {
  return (
    <>
      <h1>FieldsetLayout对照 - 原版oojs-ui vs oojs-ui-react</h1>
      <p>
        左侧为本地安装的原版oojs-ui，右侧为本组件库实现。
        两者行为对照点：fieldset/legend元素结构、label与icon渲染、弹出帮助（点击info图标弹出说明层）、
        帮助弹层宽度（默认320）、与FieldLayout配合的排布。
      </p>

      <div style={{ display: 'flex', gap: '2em', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <h2>原版oojs-ui</h2>
          <OriginalFieldsets />
        </div>
        <div style={{ flex: 1, position: 'relative' }}>
          <h2>oojs-ui-react</h2>
          <FieldsetLayout label='React字段集' icon='settings' help='这是React弹出帮助文本。'>
            <FieldLayout label='用户名' align='top'>
              <TextInput />
            </FieldLayout>
            <FieldLayout label='记住我' align='inline'>
              <CheckboxInput />
            </FieldLayout>
          </FieldsetLayout>
        </div>
      </div>
    </>
  );
}

ComparePage.displayName = 'FieldsetComparePage';

export default ComparePage;
