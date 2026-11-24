import './index.css';
import '@/styles/theme';
import exportIcon from './exportIcon.inline.svg';

/**
 * SheetJS的ESM构建地址，点击导出时按需加载
 * 该库约1MB，不打包进产物；若CDN不可达可下载xlsx.mjs自行托管后修改此地址
 */
const SHEETJS_URL = 'https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs';

document.querySelectorAll<HTMLTableElement>('table.wikitable').forEach((table) => {
  const exportButton = document.createElement('button');
  exportButton.type = 'button';
  exportButton.setAttribute('aria-label', '导出表格');
  exportButton.innerHTML = exportIcon;
  exportButton.classList.add('export-table-button');
  exportButton.title = '导出表格';

  /** 按需加载 SheetJS 并导出当前表格。 */
  const exportTable = async () => {
    if (exportButton.disabled) {
      return;
    }
    exportButton.disabled = true;
    try {
      // webpackIgnore跳过打包，保留浏览器原生的动态import
      const { utils, writeFile } = await import(/* webpackIgnore: true */ SHEETJS_URL);
      writeFile(utils.table_to_book(table), 'export.xlsx');
    } catch (err) {
      await mw.loader.using('mediawiki.notification');
      mw.notify(`导出失败：${err}`, { type: 'error' });
    } finally {
      exportButton.disabled = false;
    }
  };

  exportButton.addEventListener('click', exportTable);

  table.append(exportButton);
});
