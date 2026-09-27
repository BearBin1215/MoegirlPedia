import { describe, expect, it } from 'vitest';
import { normalizeViewportSpacing } from './config';

/**
 * 全局配置的纯函数契约测试。normalizeViewportSpacing把OOUIProvider.viewportSpacing的
 * 两种入参形态归一化为四边数值，缺省边回落VIEWPORT_SPACING——本工程缺省各边5px
 * （对应原版OO.ui.getViewportSpacing，原版缺省0，见docs/comparison-guide.md全局能力映射）。
 */
describe('normalizeViewportSpacing（viewportSpacing归一化）', () => {
  it('数值形态四边同值', () => {
    expect(normalizeViewportSpacing(12)).toEqual({ top: 12, right: 12, bottom: 12, left: 12 });
  });

  it('0不被当作缺省，四边皆为0', () => {
    expect(normalizeViewportSpacing(0)).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
  });

  it('逐边对象只覆盖给出的边，其余回落缺省5px', () => {
    expect(normalizeViewportSpacing({ top: 20, left: 8 }))
      .toEqual({ top: 20, right: 5, bottom: 5, left: 8 });
  });

  it('逐边显式0同样不回落缺省（按?? nullish判定，不走真值）', () => {
    expect(normalizeViewportSpacing({ top: 0, left: 0 }))
      .toEqual({ top: 0, right: 5, bottom: 5, left: 0 });
  });

  it.each([undefined, {}] as const)('未配置（%p）时四边皆为缺省5px', (input) => {
    expect(normalizeViewportSpacing(input)).toEqual({ top: 5, right: 5, bottom: 5, left: 5 });
  });
});
