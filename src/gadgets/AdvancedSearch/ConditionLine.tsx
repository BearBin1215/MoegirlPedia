import React from 'react';
import {
  Button,
  Dropdown,
  MenuOption,
  TextInput,
  NumberInput,
} from 'oojs-ui-react';
import type { FC } from 'react';
import type { ChangeHandler } from 'oojs-ui-react';

/** 搜索代码及其映射中文 */
export const searchCodes = {
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
export type SearchCode = keyof typeof searchCodes;

/** 搜索条件 */
export interface Condition {
  index: number;
  /** 搜索代码 */
  code: SearchCode;
  /** 搜索文本 */
  value: string | number | undefined;
}

interface ConditionLineProps extends Omit<Condition, 'index'> {
  /** 搜索代码变化 */
  onCodeChange: ChangeHandler<SearchCode>;
  /** 搜索值变化 */
  onValueChange: ChangeHandler<any, HTMLInputElement>;
  /** 点击移除行按钮 */
  onRemove: () => void;
  /** 聚焦事件 */
  onFocus?: () => void;
  /** 是否为待用行 */
  nextLine?: boolean;
}

const ConditionLine: FC<ConditionLineProps> = ({
  code,
  value,
  onCodeChange,
  onValueChange,
  onRemove,
  onFocus,
  nextLine = false,
}) => {
  const identifyType = (searchCode: SearchCode) => {
    switch (searchCode) {
      case 'filewidth':
      case 'fileheight':
      case 'filebits':
        return 'number';
      case 'contentmodel':
        return 'contentmodel';
      default:
        return 'text';
    }
  };

  const selectType = identifyType(code);

  return (
    <div className={`condition-line ${nextLine ? 'condition-line-next' : ''}`}>
      <Dropdown
        className='condition-code'
        value={code}
        onChange={onCodeChange}
        onFocus={onFocus}
      >
        {Object.entries(searchCodes).map(([searchCode, searchText]) => (
          <MenuOption key={searchCode} data={searchCode}>{searchText}</MenuOption>
        ))}
      </Dropdown>
      {selectType === 'text' && (
        <TextInput
          className='condition-text'
          value={value as string}
          onChange={onValueChange}
          onFocus={onFocus}
        />
      )}
      {selectType === 'number' && (
        <NumberInput
          className='condition-text'
          value={value as number}
          onChange={onValueChange}
          onFocus={onFocus}
        />
      )}
      {!nextLine && (
        <Button
          icon='subtract'
          tabIndex={-1}
          onClick={onRemove}
        />
      )}
    </div>
  );
};

export default ConditionLine;
