if (mw.config.get('wgAction') === 'edit') {
  window.addEventListener('keydown', function (event) {
    if (event.ctrlKey && event.key.toLowerCase() === 's') {
      event.preventDefault();
      if (event.shiftKey) {
        document.getElementById('wpMinoredit').click();
      }
      document.getElementById('wpSave').click();
    }
  });
}
