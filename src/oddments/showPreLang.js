$(function () {
    $('pre').each(function () {
        $(document.head).append('<style>pre::before{content:attr(lang);display:block;text-align:right;font-weight:700;margin-right:.5em;}</style>');
        var preLang = $(this).attr('lang');
        if (!preLang) {
            var className = $(this).attr('class');
            var match = className ? className.match(/lang-[a-zA-Z]*/i) : null;
            preLang = match ? match[0].replace('lang-', '') : '';
            $(this).attr('lang', preLang);
        }
    });
});
