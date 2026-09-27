/**
 * 将表格元素转换为wikitext（输出中的换行以`<br>`表示，由展示层决定是否还原为真实换行）
 * @param table 表格元素
 * @param useDouble 同行单元格是否使用`||`分隔（双竖线模式）
 * @returns wikitext字符串
 */
const tableToWikitext = (table: HTMLTableElement, useDouble: boolean): string => {
  const rows: string[] = []; // 用于存放各行内容
  table.querySelectorAll<HTMLTableRowElement>('tr').forEach((tr) => { // 遍历所有tr
    const cells: string[] = []; // 用于存放各单元格内容
    tr.querySelectorAll<HTMLTableCellElement>('td, th').forEach((td, index) => {
      // 对于每一个单元格，判断其是否有大于1的colspan或rowspan属性并加入
      cells.push(
        (index > 0 && useDouble ? ' || ' : '| ') +
        (td.colSpan > 1 ? `colspan="${td.colSpan}" ` : '') +
        (td.rowSpan > 1 ? `rowspan="${td.rowSpan}" ` : '') +
        (td.colSpan + td.rowSpan > 2 ? '| ' : '') +
        td.innerText,
      );
    });
    rows.push(cells.join(useDouble ? '' : '<br>'));
  });
  return `{|<br>${rows.join('<br>|-<br>')}<br>|}`;
};

export { tableToWikitext };
