import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from 'oojs-ui-react';
import ConditionLine from './ConditionLine';
import './index.less';
import type { FC } from 'react';
import type { ChangeHandler } from 'oojs-ui-react';
import type { SearchCode, Condition } from './ConditionLine';

const AdvancedPanel: FC = () => {
  const [show, setShow] = useState(false);
  const [conditions, setConditions] = useState<Condition[]>([{
    index: 0,
    code: 'none',
    text: '',
  }]);

  /** 展开或隐藏面板 */
  const toggle = () => {
    setShow(!show);
  };

  /** 添加一行 */
  const handleAddLine = () => {
    setConditions([
      ...conditions,
      {
        index: (conditions.at(-1)?.index ?? -1) + 1,
        code: 'none',
        text: '',
      },
    ]);
  };

  useEffect(() => {
    // 条件列表发生变化，触发输入框更新
    document.querySelector<HTMLInputElement>('#searchText input')!.value =
      conditions.map(({ code, text }) => {
        if ([void 0, ''].includes(text)) {
          return null;
        }
        if (['none', void 0].includes(code)) {
          return text;
        }
        return `${code}:"${text?.replace('"', ' ')}"`;
      }).filter((item) => item !== null).join(' ');
  }, [conditions]);

  return (
    <div id='advanced-search-panel' className={show ? 'panel-show' : 'panel-hide'}>
      {createPortal( // 将按钮渲染在“搜索”按钮后面
        <Button onClick={toggle} id='advanced-search-toggle'>高级</Button>,
        document.querySelector('#mw-search-top-table .oo-ui-actionFieldLayout-button')!,
      )}
      <div className='panel-header'>高级搜索</div>
      <div className='panel-content'>
        {conditions.map(({ index, text, code }, i) => {
          const nextLine = i === conditions.length - 1;
          /** 移除此行 */
          const handleRemove = () => {
            setConditions(conditions.filter((condition) => condition.index !== index));
          };

          /** 搜索类型发生变化回调 */
          const handleCodeChange: ChangeHandler<SearchCode> = ({ value }) => {
            setConditions(conditions.map((condition) => {
              if (condition.index === index) {
                return { ...condition, code: value };
              }
              return condition;
            }));
          };

          /** 搜索内容发生变化回调 */
          const handleTextChange: ChangeHandler<any, HTMLInputElement> = ({ value }) => {
            setConditions(conditions.map((condition) => {
              if (condition.index === index) {
                return { ...condition, text: value };
              }
              return condition;
            }));
          };

          return (
            <ConditionLine
              code={code}
              text={text}
              key={index}
              onRemove={handleRemove}
              onCodeChange={handleCodeChange}
              onTextChange={handleTextChange}
              onFocus={nextLine ? handleAddLine : undefined}
              nextLine={nextLine}
            />
          );
        })}
      </div>
    </div>
  );
};

export default AdvancedPanel;
