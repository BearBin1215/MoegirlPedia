import {
  utils,
  writeFile,
} from 'xlsx/dist/xlsx.mini.min';
import './index.less';
import exportIcon from './exportIcon.svg' assert { type: 'xml' };

document.querySelectorAll('table.wikitable').forEach((table) => {
  const exportButton = document.createElement('div');
  exportButton.innerHTML = exportIcon;
  exportButton.classList.add('export-table-button');
  exportButton.title = '导出表格';

  exportButton.addEventListener('click', () => {
    writeFile(utils.table_to_book(table), 'export.xlsx');
  });

  table.append(exportButton);
});
