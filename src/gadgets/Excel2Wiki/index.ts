import './index.less';

if (['edit', 'submit'].includes(mw.config.get('wgAction'))) {
  mw.loader.using('oojs-ui').done(() => {
    const itv = setInterval(() => {
      if (!document.getElementById('wikiEditor-section-advanced')) {
        return;
      }
      clearInterval(itv);

      let tableWikitext = '';

      const useDoubleSelect = new OO.ui.CheckboxInputWidget();
      const useDoubleField = new OO.ui.FieldLayout(useDoubleSelect, {
        label: $('<span>同行使用<code>||</code></span>'),
        align: 'inline',
        id: 'e2w-usedouble',
      });
      const $e2wInput = $('<div id="e2w-input" contenteditable="true"/>');
      // 输入面板
      const $e2wHTML = $('<div id="excel-to-wiki"/>').append(
        '<button id="e2w-close" title="关闭">×</button>',
        $('<div id="e2w-panel"/>').append(
          '<h5>在此处粘贴表格</h5>',
          $e2wInput,
          '<h5>输出<a id="e2w-copy">[复制]</a></h5>',
          useDoubleField.$element,
          '<div id="e2w-output"/>',
        ),
      ).appendTo($(document.body)).hide();

      // 从编辑栏中复制插入表格的按钮并修改图标，绑定事件
      const tableButton = $('[rel="table"]') as JQuery<HTMLSpanElement>;
      const excelButton = tableButton.clone();
      excelButton.attr('rel', 'excel2wiki')
        .children().attr('title', '从Excel粘贴表格').on('click', (e) => {
          e.preventDefault();
          $e2wHTML.show();
        })
        .children('.oo-ui-icon-table').removeClass('oo-ui-icon-table').addClass('oo-ui-icon-tableCaption');

      /** 读取表格并解析 */
      const parseTable = () => {
        const table = $e2wInput.get(0)!.firstElementChild;
        if (table?.tagName === 'TABLE') { // 判断粘贴的内容是否为table标签
          const useDouble: boolean = useDoubleSelect.isSelected();
          const wikitable: string[] = []; // 用于存放各tr内容
          table.querySelectorAll('tr').forEach((tr) => { // 遍历所有tr
            const tableRow: string[] = []; // 用于存放各td内容
            tr.querySelectorAll<HTMLTableCellElement>('td, th').forEach((td, index) => {
              // 对于每一个td，判断其是否有大于1的colspan或rowspan属性并加入
              tableRow.push(
                /* eslint-disable prefer-template */
                (index > 0 && useDouble ? ' || ' : '| ') +
                (td.colSpan > 1 ? `colspan="${td.colSpan}" ` : '') +
                (td.rowSpan > 1 ? `rowspan="${td.rowSpan}" ` : '') +
                (td.colSpan + td.rowSpan > 2 ? '| ' : '') +
                td.innerText,
                /* eslint-enable prefer-template */
              );
            });
            wikitable.push(tableRow.join(useDouble ? '' : '<br>'));
          });
          // 加入换行后显示在输出栏以供复制
          tableWikitext = `{|<br>${wikitable.join('<br>|-<br>')}<br>|}`;
          $('#e2w-output').html(tableWikitext);
        } else {
          console.info('Excel2Wiki: 非table标签。');
        }
      };

      // 监视粘贴事件
      $('#e2w-input').on('paste', async () => {
        await new Promise((resolve) => setTimeout(resolve, 30)); // 要等待一下，不然获取不到子元素
        parseTable();
      });

      // 切换双竖线模式时也执行解析
      useDoubleSelect.on('change', parseTable);

      // 点×关闭面板
      $('#e2w-close').on('click', () => $e2wHTML.hide());

      // 复制
      $('#e2w-copy').on('click', (e) => {
        navigator.clipboard.writeText(tableWikitext.replaceAll('<br>', '\n')).then(() => {
          $(e.target).text('[复制成功]');
          setTimeout(() => $(e.target).text('[复制]'), 3000); // 恢复文字
        }, (err) => {
          $(e.target).text(`[复制失败：${err}]`);
          setTimeout(() => $(e.target).text('[复制]'), 3000);
        });
      });

      tableButton.after(excelButton);
    }, 500);
  });
}
