$(document.body).on('click', '#Wikiplus-Edit-TopBtn, .Wikiplus-Edit-SectionBtn, .Wikiplus-Edit-EveryWhereBtn', () => {
  const WPSummary = window.WPSummary || [
    '修饰语句',
    '修正笔误',
    '内容扩充',
    '排版',
    '内部链接',
    '分类',
    '消歧义',
    '萌百化',
  ];
  const itv = setInterval(() => {
    if (!document.getElementById('Wikiplus-Quickedit-Summary-Input')) {
      return;
    }
    clearInterval(itv);
    const $WSList = $('<div></div>', { id: 'ws-buttons' }).css('margin-top', '0.2em');
    const $WSButtons = WPSummary.reduce((acc, val, index, arr) => {
      let $button,
        summaryDetail;
      if (typeof val === 'string') {
        $button = $(`<a>${val}</a>`);
        summaryDetail = val;
      } else if (typeof val === 'object') {
        $button = $(`<a>${val.name}</a>`);
        summaryDetail = val.detail;
      }
      $button.on('click', () => {
        const $summary = $('#Wikiplus-Quickedit-Summary-Input');
        const summary = $summary.val();
        $summary.val(summary.replace(/(\/\*.+\*\/ ?)?(.+)/, `$1${summaryDetail} $2`))
          .trigger('focus');
      });
      acc.push($button); // 逐一插入按钮
      if (index < arr.length - 1) {
        acc.push($('<span> | </span>')); // 除最后一个外，插入分割线
      }
      return acc;
    }, []);

    $WSList.append(
      $('<span>摘要：</span>'),
      ...$WSButtons,
      '<br/>',
    );
    $('#Wikiplus-Quickedit-Summary-Input+br').replaceWith($WSList);
    $('.Wikiplus-InterBox').css('top', +$('.Wikiplus-InterBox').css('top').replace('px', '') - 50); // 将w+窗口上移以免挡住快速摘要和提交编辑按钮
  }, 500);
});
