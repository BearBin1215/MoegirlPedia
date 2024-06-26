interface SummaryDetail {
  name: string;
  detail: string;
}

$(document.body).on('click', '#Wikiplus-Edit-TopBtn, .Wikiplus-Edit-SectionBtn, .Wikiplus-Edit-EveryWhereBtn', () => {
  const si = setInterval;
  const WPSummary: (string | SummaryDetail)[] = (window as any).WPSummary || [
    '修饰语句',
    '修正笔误',
    '内容扩充',
    '排版',
    '内部链接',
    '分类',
    '消歧义',
    '萌百化',
  ];
  const itv = si(() => {
    if (!document.getElementById('Wikiplus-Quickedit-Summary-Input')) {
      return;
    }
    clearInterval(itv);
    const $WSList = $('<div id="ws-buttons" style="margin-top:0.2em;font-size:0.875em"></div>');
    const $WSButtons = WPSummary.reduce((acc, val, index, { length }) => {
      let $button: JQuery<HTMLElement>;
      let summaryDetail: string;
      if (typeof val === 'string') {
        $button = $(`<a>${val}</a>`);
        summaryDetail = val;
      } else if (typeof val === 'object') {
        $button = $(`<a>${val.name}</a>`);
        summaryDetail = val.detail;
      } else {
        return acc;
      }
      $button.on('click', () => {
        const $summary = $('#Wikiplus-Quickedit-Summary-Input') as JQuery<HTMLInputElement>;
        const summary = $summary.val() as string;
        $summary.val(summary.replace(/(\/\*.+\*\/ ?)?(.+)/, `$1${summaryDetail} $2`)).trigger('focus');
      });
      acc.push($button); // 逐一插入按钮
      if (index < length - 1) {
        acc.push($('<span> | </span>')); // 除最后一个外，插入分割线
      }
      return acc;
    }, [] as JQuery<HTMLElement>[]);

    $WSList.append(
      $('<span>摘要：</span>'),
      $WSButtons,
      '<br/>',
    );
    $('#Wikiplus-Quickedit-Summary-Input+br').replaceWith($WSList);
    $('.Wikiplus-InterBox').css('top', +$('.Wikiplus-InterBox').css('top').replace('px', '') - 50); // 将w+窗口上移以免挡住快速摘要和提交编辑按钮
  }, 500);
});
