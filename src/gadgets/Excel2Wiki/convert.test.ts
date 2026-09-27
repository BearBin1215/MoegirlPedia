import { describe, expect, it } from 'vitest';
import { tableToWikitext } from './convert';

/** 构造模拟单元格，只需覆盖tableToWikitext实际读取的属性 */
const mockCell = (innerText: string, colSpan = 1, rowSpan = 1) => (
  { innerText, colSpan, rowSpan } as HTMLTableCellElement
);

/** 构造模拟行，querySelectorAll直接返回给定单元格 */
const mockRow = (...cells: HTMLTableCellElement[]) => (
  { querySelectorAll: () => cells } as unknown as HTMLTableRowElement
);

/** 构造模拟表格，querySelectorAll直接返回给定行 */
const mockTable = (...rows: HTMLTableRowElement[]) => (
  { querySelectorAll: () => rows } as unknown as HTMLTableElement
);

describe('tableToWikitext', () => {
  it('单竖线模式下首列输出|前缀，单元格间以<br>分隔', () => {
    const table = mockTable(mockRow(mockCell('A'), mockCell('B')));
    expect(tableToWikitext(table, false)).toBe('{|<br>| A<br>| B<br>|}');
  });

  it('多行时行间以<br>|-<br>分隔', () => {
    const table = mockTable(
      mockRow(mockCell('A'), mockCell('B')),
      mockRow(mockCell('C'), mockCell('D')),
    );
    expect(tableToWikitext(table, false)).toBe('{|<br>| A<br>| B<br>|-<br>| C<br>| D<br>|}');
  });

  it('双竖线模式下首列仍为|，后续列以||分隔且不加<br>', () => {
    const table = mockTable(mockRow(mockCell('A'), mockCell('B'), mockCell('C')));
    expect(tableToWikitext(table, true)).toBe('{|<br>| A || B || C<br>|}');
  });

  it('colspan大于1时输出colspan属性并补充内容前竖线', () => {
    const table = mockTable(mockRow(mockCell('合并', 2)));
    expect(tableToWikitext(table, false)).toBe('{|<br>| colspan="2" | 合并<br>|}');
  });

  it('rowspan大于1时输出rowspan属性并补充内容前竖线', () => {
    const table = mockTable(mockRow(mockCell('合并', 1, 2)));
    expect(tableToWikitext(table, false)).toBe('{|<br>| rowspan="2" | 合并<br>|}');
  });

  it('colspan与rowspan同时大于1时按序输出两个属性', () => {
    const table = mockTable(mockRow(mockCell('合并', 2, 2)));
    expect(tableToWikitext(table, true)).toBe('{|<br>| colspan="2" rowspan="2" | 合并<br>|}');
  });

  it('无行的表格输出空表结构', () => {
    expect(tableToWikitext(mockTable(), false)).toBe('{|<br><br>|}');
  });
});
