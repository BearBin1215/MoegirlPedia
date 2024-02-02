document.getElementById('mw-panel').style.height = document.body.scrollHeight + 'px';
window.onresize = function () {
    document.getElementById('mw-panel').style.height = document.body.scrollHeight + 'px';
    $('#p-tb').css({
        position: 'sticky',
        top: '0',
    });
    setTimeout(function() {
        $('#p-sl').css({
            position: 'sticky',
            top: document.getElementById('p-tb') ? document.getElementById('p-tb').offsetHeight : '0',
        });
    }, 200);
};
