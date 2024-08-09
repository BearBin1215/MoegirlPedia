import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Button,
  Dropdown,
  MenuOption,
  TextInput,
} from 'oojs-ui-react';
import './index.less';
import type { FC } from 'react';
import type { ChangeHandler } from 'oojs-ui-react';

/** 搜索代码及其映射中文 */
const searchCodes = {
  none: '无',
  insource: '源码包含',
  prefix: '前缀',
  intitle: '标题包含',
  incategory: '属于分类',
  linksto: '链接到',
  hastemplate: '嵌入模板',
  contentmodel: '内容模型',
  subpageof: '从属子页面',
  filetype: '文件类型',
  filemime: '文件MIME',
  filesize: '文件大小',
  filewidth: '文件宽度',
  fileheight: '文件高度',
  fileres: '文件分辨率',
  filebits: '文件色深',
};

/** 可用的搜索代码 */
type SearchCode = keyof typeof searchCodes;

/** 搜索条件 */
interface Condition {
  index: number;
  /** 条件类型 */
  type: SearchCode;
  /** 搜索文本 */
  value: string | undefined;
}

const AdvancedPanel: FC = () => {
  const [show, setShow] = useState(false);
  const [conditions, setConditions] = useState<Condition[]>([{
    index: 0,
    type: 'none',
    value: '',
  }]);

  /** 展开或隐藏面板 */
  const toggle = () => {
    setShow(!show);
  };

  /** 添加一条 */
  const handleAdd = () => {
    setConditions([
      ...conditions,
      {
        index: (conditions.at(-1)?.index ?? -1) + 1,
        type: 'none',
        value: '',
      },
    ]);
  };

  useEffect(() => {
    // 条件列表发生变化，触发输入框更新
    document.querySelector<HTMLInputElement>('#searchText input')!.value = conditions.map(({ type, value }) => {
      if ([void 0, ''].includes(value)) {
        return null;
      }
      if (['none', void 0].includes(type)) {
        return value;
      }
      return `${type}:"${value?.replace('"', ' ')}"`;
    }).filter((item) => item !== null).join(' ');
  }, [conditions]);

  return (
    <div id='advanced-search-panel' className={show ? 'panel-show' : 'panel-hide'}>
      {createPortal( // 将按钮渲染在“搜索”按钮后面
        <Button onClick={toggle} id='advanced-search-toggle'>高级</Button>,
        document.querySelector('#mw-search-top-table .oo-ui-actionFieldLayout-button')!,
      )}
      <div className='panel-header'>
        <div className='panel-title'>高级搜索</div>
        <Button icon='add' onClick={handleAdd} />
      </div>
      <div className='panel-content'>
        {conditions.map(({ index, value, type }) => {
          /** 移除此行 */
          const handleRemove = () => {
            setConditions(conditions.filter((condition) => condition.index !== index));
          };

          /** 搜索类型发生变化回调 */
          const handleTypeChange: ChangeHandler<SearchCode> = ({ value: newType }) => {
            setConditions(conditions.map((condition) => {
              if (condition.index === index) {
                return { ...condition, type: newType };
              }
              return condition;
            }));
          };

          /** 搜索内容发生变化回调 */
          const handleValueChange: ChangeHandler<any, HTMLInputElement> = ({ value: newValue }) => {
            setConditions(conditions.map((condition) => {
              if (condition.index === index) {
                return { ...condition, value: newValue };
              }
              return condition;
            }));
          };

          return (
            <div key={index} className='condition-item'>
              <Dropdown
                className='condition-type'
                value={type}
                onChange={handleTypeChange}
              >
                {Object.entries(searchCodes).map(([code, text]) => (
                  <MenuOption key={code} data={code}>{text}</MenuOption>
                ))}
              </Dropdown>
              <TextInput
                className='condition-value'
                value={value}
                onChange={handleValueChange}
              />
              <Button
                icon='subtract'
                onClick={handleRemove}
                tabIndex={-1}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdvancedPanel;
