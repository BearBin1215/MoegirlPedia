import { describe, expect, it } from 'vitest';
import { findRelativeSelectableItem } from './utils';

/**
 * 相对导航纯函数（Select/TabSelect/RadioSelect/菜单导航共用）的契约测试。
 * 边界规则对齐原版SelectWidget.findRelativeSelectableItem：start不在集合内时
 * 正向自首项、反向自末项起步；wrap时端点环绕（最多扫一整圈）；filter用于前缀跳转。
 */
describe('findRelativeSelectableItem', () => {
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
