import {
  utils,
  writeFile,
} from 'xlsx';
import './index.less';
import exportIcon from './exportIcon.inline.svg';

document.querySelectorAll<HTMLTableElement>('table.wikitable').forEach((table) => {
  const exportButton = document.createElement('div');
  exportButton.innerHTML = exportIcon;
  exportButton.classList.add('export-table-button');
  exportButton.title = '导出表格';

  exportButton.addEventListener('click', () => {
    writeFile(utils.table_to_book(table), 'export.xlsx');
  });

  table.append(exportButton);
});
