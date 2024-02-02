if (mw.config.get('wgCanonicalSpecialPageName') === 'Movepage') {
    var reasons = [
        ['无需消歧义', '[[萌娘百科:消歧义方针|一般而言不需要为不在收录范围的内容和百科目前尚未存在的内容进行消歧义行为]]'],
        ['暂无歧义'],
        ['准备消歧义'],
        ['简体中文优先', '[[萌娘百科:条目命名指引#简体中文优先原则|简体中文优先]]'],
    ];
    $('#wpReason').after($('<div id="move-reason" style="margin-top: .3em"></div>')
        .append(reasons.map(function (reason) {
            return $('<a title="' + (reason[1] || reason[0]) + '">' + reason[0] + '</a>').on('click', function () {
                $('#wpReason input').val(reason[1] || reason[0]);
            });
        }).reduce(function (acc, cur, index) {
            if (index !== 0) {
                acc.push('丨');
            }
            return acc.concat(cur);
        }, [])));
}
