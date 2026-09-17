import { describe, expect, it } from 'vitest';
import {
  findRelativeSelectableItem,
  getSelectableValues,
  resolveElement,
  resolveOptionDisabled,
  resolveSelectableValue,
} from './utils';

/**
 * utils.ts纯函数的契约测试：相对导航（键盘导航公共口径，对齐原版SelectWidget）、
 * 选择集的判定与派生、非法受控值回退、选项禁用的组继承（以上为Select/Dropdown/
 * DropdownInput/ComboBoxInput/RadioSelect系/TabSelect/CheckboxMultiselect等选择族
 * 组件共用）、浮层锚点解析。
 */
describe('findRelativeSelectableItem', () => {
  // 边界规则对齐原版SelectWidget.findRelativeSelectableItem：start不在集合内时
  // 正向自首项、反向自末项起步；wrap时端点环绕（最多扫一整圈）；filter用于前缀跳转。

  const values = ['a', 'b', 'c', 'd'];

  it('空集合返回undefined', () => {
    expect(findRelativeSelectableItem([], 'a', 1)).toBeUndefined();
  });

  it('从start不含自身正向移动一步', () => {
    expect(findRelativeSelectableItem(values, 'a', 1)).toBe('b');
    expect(findRelativeSelectableItem(values, 'c', 1)).toBe('d');
  });

  it('反向移动一步', () => {
    expect(findRelativeSelectableItem(values, 'd', -1)).toBe('c');
  });

  it('端点环绕（wrap缺省为true）', () => {
    expect(findRelativeSelectableItem(values, 'd', 1)).toBe('a');
    expect(findRelativeSelectableItem(values, 'a', -1)).toBe('d');
  });

  it('wrap=false时超出端点返回undefined', () => {
    expect(findRelativeSelectableItem(values, 'd', 1, undefined, false)).toBeUndefined();
    expect(findRelativeSelectableItem(values, 'a', -1, undefined, false)).toBeUndefined();
  });

  it('多步offset按方向跳过对应步数', () => {
    expect(findRelativeSelectableItem(values, 'a', 2)).toBe('c');
    expect(findRelativeSelectableItem(values, 'b', -2)).toBe('d');
  });

  it('start不在集合内时正向自首项、反向自末项起步', () => {
    expect(findRelativeSelectableItem(values, 'z', 1)).toBe('a');
    expect(findRelativeSelectableItem(values, 'z', -1)).toBe('d');
  });

  it('start为undefined时正向自首项、反向自末项起步', () => {
    expect(findRelativeSelectableItem(values, undefined, 1)).toBe('a');
    expect(findRelativeSelectableItem(values, undefined, -1)).toBe('d');
  });

  it('filter跳过不匹配项', () => {
    expect(findRelativeSelectableItem(values, 'a', 1, (value) => value === 'c')).toBe('c');
    expect(findRelativeSelectableItem(values, 'a', -1, (value) => value === 'c')).toBe('c');
  });

  it('filter无匹配项时环绕一整圈后返回undefined', () => {
    expect(findRelativeSelectableItem(values, 'a', 1, () => false)).toBeUndefined();
  });

  it('数值型值同样按集合顺序导航', () => {
    expect(findRelativeSelectableItem([10, 20, 30], 10, 1)).toBe(20);
    expect(findRelativeSelectableItem([10, 20, 30], 30, 1)).toBe(10);
  });
});

describe('getSelectableValues（可选值序列）', () => {
  /** 分组标题在选项集中即"没有value的项"（本函数只读value/disabled） */
  const groupTitle = { label: '分组' } as { value?: string | number; disabled?: boolean };

  it('跳过无value的分组标题与禁用项，保持展示顺序', () => {
    expect(getSelectableValues([
      { value: 'a' },
      groupTitle,
      { value: 'b', disabled: true },
      { value: 'c' },
    ])).toEqual(['a', 'c']);
  });

  it('无可选项时返回空数组', () => {
    expect(getSelectableValues([groupTitle, { value: 'b', disabled: true }])).toEqual([]);
    expect(getSelectableValues([])).toEqual([]);
  });

  it('数值型value原样保留（不做String归一化）', () => {
    expect(getSelectableValues([{ value: 1 }, { value: 2 }])).toEqual([1, 2]);
  });

  it('仅undefined视为无value：0与空串都是合法可选值（按!== undefined判定，不走真值）', () => {
    expect(getSelectableValues([{ value: 0 }, { value: '' }])).toEqual([0, '']);
  });
});

describe('resolveSelectableValue（非法受控值回退）', () => {
  it('值在可选值集合内则原样返回', () => {
    expect(resolveSelectableValue('b', ['a', 'b', 'c'])).toBe('b');
  });

  it('值非法（不在集合内）时回退首个可选值', () => {
    expect(resolveSelectableValue('z', ['a', 'b', 'c'])).toBe('a');
  });

  it('值缺失时取首个可选值，无可选值时为undefined', () => {
    expect(resolveSelectableValue(undefined, ['a', 'b'])).toBe('a');
    expect(resolveSelectableValue('a', [])).toBeUndefined();
  });
});

describe('resolveOptionDisabled（选项禁用态的组继承）', () => {
  it('选项自身disabled为真时禁用', () => {
    expect(resolveOptionDisabled({ disabled: true })).toBe(true);
  });

  it('组禁用时选项一律禁用（原版语义：选项无法在禁用组内单独启用）', () => {
    expect(resolveOptionDisabled({}, true)).toBe(true);
    expect(resolveOptionDisabled({ disabled: false }, true)).toBe(true);
  });

  it('两者皆否时为否（未声明disabled时透传undefined）', () => {
    expect(resolveOptionDisabled({ disabled: false }, false)).toBe(false);
    expect(resolveOptionDisabled({})).toBeUndefined();
  });
});

describe('resolveElement（ref与真实元素的统一解析）', () => {
  const element = { id: 'anchor' } as unknown as HTMLElement;

  it('RefObject取其current', () => {
    expect(resolveElement({ current: element })).toBe(element);
  });

  it('current为null时返回null（ref已挂载但尚未赋值）', () => {
    expect(resolveElement({ current: null })).toBeNull();
  });

  it('真实元素原样返回（以current为判别特征，无需依赖instanceof HTMLElement）', () => {
    expect(resolveElement(element)).toBe(element);
  });

  it('null/undefined返回null（浮层锚点未就绪）', () => {
    expect(resolveElement(null)).toBeNull();
    expect(resolveElement(undefined)).toBeNull();
  });
});
