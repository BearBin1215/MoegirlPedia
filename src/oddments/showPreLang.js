/**
 * 代码块显示语言
 */

$(() => {
  $('pre').each(function () {
    $(document.head).append('<style>pre::before{content:attr(lang);display:block;text-align:right;font-weight:700;margin-right:.5em;}</style>');
    let preLang = $(this).attr('lang');
    if (!preLang) {
      const className = $(this).attr('class');
      const match = className ? className.match(/lang-[a-zA-Z]*/i) : null;
      preLang = match ? match[0].replace('lang-', '') : '';
      $(this).attr('lang', preLang);
    }
  });
});
