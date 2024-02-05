if (mw.config.get('wgAction') === 'edit') {
  // 编辑页Ctrl+S保存，Ctrl+Shift+S小编辑保存
  window.addEventListener('keydown', function (event) {
    if (event.ctrlKey && event.key.toLowerCase() === 's') {
      event.preventDefault();
      if (event.shiftKey) {
        document.getElementById('wpMinoredit').click();
      }
      document.getElementById('wpSave').click();
    }
  });

  // 在编辑框中时按tab跳转到摘要输入框而非快捷插入
  var itv = setInterval(function () {
    if (document.getElementsByClassName('cm-lineWrapping')[0]) {
      document.getElementsByClassName('cm-lineWrapping')[0].tabIndex = 1;
      clearInterval(itv);
    }
  }, 1000);
}
