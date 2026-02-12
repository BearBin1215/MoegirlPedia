import React, { useState, useEffect, type FC } from 'react';
import { createPortal } from 'react-dom';
import { Button, type ChangeHandler } from 'oojs-ui-react';
import ConditionLine, { type Condition, searchCodes } from './ConditionLine';
import './index.less';

const AdvancedPanel: FC = () => {
  const [show, setShow] = useState(false);
  const [firstOpen, setFirstOpen] = useState(true);
  const [conditions, setConditions] = useState<Condition[]>([{
    index: 0,
    code: 'none',
    value: '',
  }]);

  /** 展开或隐藏面板 */
  const toggle = () => {
    setShow(!show);
    setFirstOpen(false);
  };

  /** 添加一行 */
  const handleAddLine = () => {
    setConditions([
      ...conditions,
      {
        index: (conditions.at(-1)?.index ?? -1) + 1,
        code: 'none',
        value: '',
      },
    ]);
  };

  useEffect(() => {
    if (firstOpen) {
      return;
    }
    // 条件列表发生变化，触发输入框更新
    document.querySelector<HTMLInputElement>('#searchText input')!.value =
      conditions.map(({ code, value }) => {
        if (['undefined', ''].includes(String(value))) {
          return null;
        }
        if (['none', void 0].includes(code)) {
          return value;
        }
        return `${code}:"${String(value).replace(/"/g, ' ')}"`;
      }).filter((item) => item !== null).join(' ');
  }, [conditions]);

  // 解析输入框内文本
  const parseInputValue = (inputValue: string): Condition[] => {
    const initConditions: Condition[] = [];
    const regex = /(\w+):"([^"]*)"|([^ ]+)/g;
    let match;
    let index = 0;

    while ((match = regex.exec(inputValue)) !== null) {
      if (match[1] && match[2]) {
        // 匹配到 code:"value" 格式
        const code = match[1] as keyof typeof searchCodes;
        const value = match[2];
        if (code in searchCodes) {
          initConditions.push({ index: index++, code, value });
        }
      } else if (match[3]) {
        // 匹配到普通文本
        initConditions.push({ index: index++, code: 'none', value: match[3] });
      }
    }

    initConditions.push({ index: initConditions.length, code: 'none', value: '' });

    return initConditions;
  };

  // 初始化时解析输入框内容
  useEffect(() => {
    const inputValue = document.querySelector<HTMLInputElement>('#searchText input')?.value || '';
    if (inputValue) {
      const parsedConditions = parseInputValue(inputValue);
      setConditions(parsedConditions);
    }
  }, []);

  return (
    <div id='advanced-search-panel' className={show ? 'panel-show' : 'panel-hide'}>
      {createPortal( // 将按钮渲染在“搜索”按钮后面
        <Button onClick={toggle} id='advanced-search-toggle'>高级</Button>,
        document.querySelector('#mw-search-top-table .oo-ui-actionFieldLayout-button')!,
      )}
      <div className='panel-header'>高级搜索</div>
      <div className='panel-content'>
        {conditions.map(({ index, value, code }, i) => {
          const nextLine = i === conditions.length - 1;
          /** 移除此行 */
          const handleRemove = () => {
            setConditions(conditions.filter((condition) => condition.index !== index));
          };

          /** 搜索内容发生变化回调 */
          const handleChange: ChangeHandler = (data) => {
            setConditions(conditions.map((condition) => {
              if (condition.index === index) {
                return {
                  index,
                  ...data.value,
                };
              }
              return condition;
            }));
          };

          return (
            <ConditionLine
              code={code}
              value={value}
              key={index}
              onRemove={handleRemove}
              onChange={handleChange}
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
