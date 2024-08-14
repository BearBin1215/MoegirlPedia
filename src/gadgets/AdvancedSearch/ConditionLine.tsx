import React, { type FC } from 'react';
import {
  Button,
  Dropdown,
  TextInput,
  NumberInput,
  type ChangeHandler,
} from 'oojs-ui-react';

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

export const contentModels = [
  'GadgetDefinition',
  'sanitized-css',
  'Scribunto',
  'wikitext',
  'javascript',
  'json',
  'css',
  'text',
];

/** 可用的搜索代码 */
export type SearchCode = keyof typeof searchCodes;

/** 行值 */
export interface LineValue {
  /** 搜索代码 */
  code: SearchCode;
  /** 搜索文本 */
  value: string | number | undefined;
}

/** 搜索条件 */
export interface Condition extends LineValue {
  index: number;
}

interface ConditionLineProps extends Omit<Condition, 'index'> {
  onChange?: ChangeHandler<LineValue>;
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
  onChange,
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

  const handleCodeChange: ChangeHandler<SearchCode> = (data) => {
    if (!onChange) {
      return;
    }
    let newValue = value;
    if (identifyType(data.value) === 'contentmodel' && !contentModels.includes(value as string)) {
      // 若新搜索代码为内容模型，判断其是否为有效的内容模型值，不是则清空value
      newValue = '';
    } else if (identifyType(data.value) === 'number' && identifyType(code) === 'text') {
      // 若新代码为数字类型，判断其是否为有效的数字值，不是则清空value
      if (Number.isFinite(Number(value))) {
        newValue = Number(value);
      } else {
        newValue = void 0;
      }
    }
    onChange({
      value: { code: data.value, value: newValue },
      oldValue: { code, value },
    });
  };

  const handleValueChange: ChangeHandler<any> = (data) => {
    if (onChange) {
      onChange({
        value: { code, value: data.value },
        oldValue: { code, value },
      });
    }
  };

  return (
    <div className={`condition-line ${nextLine ? 'condition-line-next' : ''}`}>
      <Dropdown
        className='condition-code'
        value={code}
        onChange={handleCodeChange}
        onFocus={onFocus}
        options={Object.entries(searchCodes).map(([searchCode, searchText]) => ({
          key: searchCode,
          data: searchCode,
          children: searchText,
        }))}
      />
      {selectType === 'text' && (
        <TextInput
          className='condition-text'
          value={value as string}
          onChange={handleValueChange}
          onFocus={onFocus}
        />
      )}
      {selectType === 'number' && (
        <NumberInput
          className='condition-text'
          value={value as number}
          onChange={handleValueChange}
          onFocus={onFocus}
        />
      )}
      {selectType === 'contentmodel' && (
        <Dropdown
          className='condition-text'
          value={value as string}
          onChange={handleValueChange}
          onFocus={onFocus}
          options={contentModels.map((model) => ({
            key: model,
            data: model,
            children: model,
          }))}
        />
      )}
      <Button
        className='condition-removebutton'
        icon='subtract'
        tabIndex={-1}
        onClick={onRemove}
        disabled={nextLine}
      />
    </div>
  );
};

export default ConditionLine;
