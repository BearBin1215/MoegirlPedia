import { describe, expect, it } from 'vitest';
import { resolveLayoutSelection, resolvePanelAlignSide } from './hooks';

/**
 * hooks.ts纯函数的契约测试（不含需要React/DOM环境的hook）。
 * resolveLayoutSelection是IndexLayout/BookletLayout共用的激活值派生：有效值原样、
 * 缺失（首次无值）或失效（不在新options内，如页被移除）时按"原位置→前一项→首项"
 * 三档邻近回退，且须以**上一轮**的options为定位依据（失效值可能已不在新列表中）。
 */
describe('resolveLayoutSelection（布局激活值的缺失/失效回退）', () => {
  const pages = (...values: string[]) => values.map((value) => ({ value }));

  it('options为空时返回undefined（无可用激活项，即使原值非空）', () => {
    expect(resolveLayoutSelection('b', [], pages('a', 'b'))).toBeUndefined();
    expect(resolveLayoutSelection(undefined, [], [])).toBeUndefined();
  });

  it('值缺失（首次无值）时取首项', () => {
    expect(resolveLayoutSelection(undefined, pages('a', 'b'), [])).toBe('a');
  });

  it('值有效（在新options内）时原样返回，不做邻近回退', () => {
    expect(resolveLayoutSelection('c', pages('a', 'b', 'c'), pages('a'))).toBe('c');
  });

  it('值失效时取其在上一轮options中的原位置项（该位置已被新项占据）', () => {
    expect(resolveLayoutSelection('a', pages('x', 'b', 'c'), pages('a', 'b', 'c'))).toBe('x');
  });

  it('值失效且在上一轮为末位、新列表更短时回退到前一项', () => {
    expect(resolveLayoutSelection('c', pages('a', 'b'), pages('a', 'b', 'c'))).toBe('b');
  });

  it('值在上一轮options中也找不到时回退首项', () => {
    expect(resolveLayoutSelection('z', pages('a', 'b'), pages('a', 'b'))).toBe('a');
  });

  it('数值型值同样按同一回退规则处理', () => {
    const options = [{ value: 1 }, { value: 2 }];
    expect(resolveLayoutSelection(2, options, [{ value: 1 }, { value: 2 }, { value: 3 }])).toBe(2);
    expect(resolveLayoutSelection(3, options, [{ value: 1 }, { value: 2 }, { value: 3 }])).toBe(2);
    expect(resolveLayoutSelection(undefined, options, [])).toBe(1);
  });
});

/**
 * resolvePanelAlignSide：锚定浮层的对齐侧降级顺序（对齐原版PopupToolGroup.setActive）：
 * 首选侧放得下即用首选侧，否则试对侧，再试居中，都不足时取空间较大的一侧
 */
describe('resolvePanelAlignSide（面板对齐侧的降级顺序）', () => {
  it('首选侧放得下时用首选侧', () => {
    expect(resolvePanelAlignSide('start', { start: 200, end: 100, center: 300 }, 150)).toBe('start');
    expect(resolvePanelAlignSide('end', { start: 100, end: 200, center: 300 }, 150)).toBe('end');
  });

  it('首选侧放不下时改试对侧', () => {
    expect(resolvePanelAlignSide('start', { start: 100, end: 200, center: 300 }, 150)).toBe('end');
    expect(resolvePanelAlignSide('end', { start: 200, end: 100, center: 300 }, 150)).toBe('start');
  });

  it('两侧都放不下但居中放得下时取居中', () => {
    expect(resolvePanelAlignSide('start', { start: 100, end: 100, center: 150 }, 150)).toBe('center');
    expect(resolvePanelAlignSide('end', { start: 100, end: 100, center: 150 }, 150)).toBe('center');
  });

  it('都不足时取空间较大的一侧', () => {
    expect(resolvePanelAlignSide('start', { start: 100, end: 120, center: 100 }, 150)).toBe('end');
    expect(resolvePanelAlignSide('start', { start: 120, end: 100, center: 100 }, 150)).toBe('start');
  });

  it('可用空间等于面板宽度时视为放得下（等价于原版的"不裁剪"判定）', () => {
    expect(resolvePanelAlignSide('start', { start: 150, end: 0, center: 0 }, 150)).toBe('start');
  });
});
