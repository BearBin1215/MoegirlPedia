if (mw.config.get('wgAction') === 'edit') {
  window.addEventListener('keydown', function (event) {
    if (event.ctrlKey && event.key === 's') {
      event.preventDefault();
      document.getElementById('wpSave').click();
    }
  });
}
