import { describe, expect, it } from 'vitest';
import { normalizeTitle, parseRetiredCVs } from './retiredCVs';

describe('normalizeTitle', () => {
  it('首字母转大写', () => {
    expect(normalizeTitle('hatsune miku')).toBe('Hatsune miku');
  });

  it('下划线转空格', () => {
    expect(normalizeTitle('Hatsune_Miku')).toBe('Hatsune Miku');
  });
});

describe('parseRetiredCVs', () => {
  it('提取skewX斜体span中的链接标题', () => {
    const source = '<span style="transform: skewX(-10deg)">[[佐仓绫音]]、[[水濑祈]]</span>';
    expect(parseRetiredCVs(source)).toEqual(new Set(['佐仓绫音', '水濑祈']));
  });

  it('忽略非skewX样式的span内容', () => {
    const source = '<span>[[东山奈央]]</span>';
    expect(parseRetiredCVs(source)).toEqual(new Set());
  });

  it('对标题做规范化：下划线转空格并首字母大写', () => {
    const source = '<span style="transform: skewX(-10deg)">[[花守_みかり]]</span>';
    expect(parseRetiredCVs(source)).toEqual(new Set(['花守 みかり']));
  });

  it('剔除链接中的锚点与显示文本部分', () => {
    const source = '<span style="transform: skewX(-10deg)">[[早见沙织#相关曲目|早见]]</span>';
    expect(parseRetiredCVs(source)).toEqual(new Set(['早见沙织']));
  });

  it('无匹配内容时返回空集合', () => {
    expect(parseRetiredCVs('')).toEqual(new Set());
  });
});
