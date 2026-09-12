import React from 'react';
import { CheckboxInput, FieldLayout, FieldsetLayout, TextInput } from 'oojs-ui-react';
import { unwrapJQuery } from '../../components/ooui';
import { useOriginalWidgets } from '../../components/original';
import { CompareColumns, CompareLayout } from '../../components/CompareLayout';

/** 原版侧：FieldsetLayout（label/icon/弹出help） */
function OriginalFieldsets() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const fieldset = new oo.ui.FieldsetLayout({
      label: '原版字段集',
      icon: 'settings',
      help: '这是原版弹出帮助文本。',
    });
    register(fieldset);
    fieldset.addItems([
      new oo.ui.FieldLayout(new oo.ui.TextInputWidget(), { label: '用户名', align: 'top' }),
      new oo.ui.FieldLayout(new oo.ui.CheckboxInputWidget(), { label: '记住我', align: 'inline' }),
    ]);
    container.appendChild(unwrapJQuery(fieldset.$element));
  });

  return (
    <div style={{ position: 'relative' }}>
      <div ref={containerRef} />
    </div>
  );
}

function FieldsetComparePage() {
  return (
    <CompareLayout
      title='FieldsetLayout 对照 - 原版oojs-ui vs oojs-ui-react'
      description={(
        <>
          左侧为本地安装的原版oojs-ui，右侧为本组件库实现。
          两者行为对照点：fieldset/legend元素结构、label与icon渲染、弹出帮助（点击info图标弹出说明层）、
          帮助弹层宽度（默认320）、与FieldLayout配合的排布。
        </>
      )}
    >
      <CompareColumns original={<OriginalFieldsets />}>
        <div style={{ position: 'relative' }}>
          <FieldsetLayout label='React字段集' icon='settings' help='这是React弹出帮助文本。'>
            <FieldLayout label='用户名' align='top'>
              <TextInput />
            </FieldLayout>
            <FieldLayout label='记住我' align='inline'>
              <CheckboxInput />
            </FieldLayout>
          </FieldsetLayout>
        </div>
      </CompareColumns>
    </CompareLayout>
  );
}

FieldsetComparePage.displayName = 'FieldsetComparePage';

export default FieldsetComparePage;
