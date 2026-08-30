import './index.less';
import exportIcon from './exportIcon.inline.svg';

/**
 * SheetJS的ESM构建地址，点击导出时按需加载
 * 该库约1MB，不打包进产物；若CDN不可达可下载xlsx.mjs自行托管后修改此地址
 */
const SHEETJS_URL = 'https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs';

/** 加载中样式类，同时用于阻止重复点击 */
const LOADING_CLASS = 'export-table-button-loading';

document.querySelectorAll<HTMLTableElement>('table.wikitable').forEach((table) => {
  const exportButton = document.createElement('div');
  exportButton.innerHTML = exportIcon;
  exportButton.classList.add('export-table-button');
  exportButton.title = '导出表格';

  /** 导出表格，避免将约1MB的SheetJS打包进产物 */
  const exportTable = async () => {
    if (exportButton.classList.contains(LOADING_CLASS)) {
      return;
    }
    exportButton.classList.add(LOADING_CLASS);
    try {
      // webpackIgnore跳过打包，保留浏览器原生的动态import
      const { utils, writeFile } = await import(/* webpackIgnore: true */ SHEETJS_URL);
      writeFile(utils.table_to_book(table), 'export.xlsx');
    } catch (err) {
      await mw.loader.using('mediawiki.notification');
      mw.notify(`导出失败：${err}`, { type: 'error' });
    } finally {
      exportButton.classList.remove(LOADING_CLASS);
    }
  };

  exportButton.addEventListener('click', exportTable);

  table.append(exportButton);
});
