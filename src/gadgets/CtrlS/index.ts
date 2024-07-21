if (['edit', 'submit'].includes(mw.config.get('wgAction'))) {
  // 编辑页Ctrl+S保存，Ctrl+Shift+S小编辑保存
  window.addEventListener('keydown', (event) => {
    if (event.ctrlKey) {
      event.preventDefault();
      switch (event.key) {
        case 's':
        case 'S':
          // Ctrl+S保存
          if (event.shiftKey) {
            // Ctrl+Shift+S切换小编辑后保存
            document.getElementById('wpMinoredit')!.click();
          }
          document.getElementById('wpSave')!.click();
          break;
        case 'V': // Ctrl+Shift+V预览
          event.preventDefault();
          // 模块页“预览使用本模板的页面”
          if (mw.config.get('wgCodeEditorCurrentLanguage') === 'lua') {
            (document.querySelector('#wpTemplateSandboxPreview input') as HTMLInputElement)!.click();
          }
          document.getElementById('wpPreview')!.click();
          break;
        case 'D': // Ctrl+Shift+D查看差异
          event.preventDefault();
          document.getElementById('wpDiff')!.click();
      }
    }
  });

  // 在编辑框中时按tab跳转到摘要输入框而非快捷插入
  const itv = setInterval(() => {
    const lineWrapping = document.querySelector<HTMLDivElement>('.cm-lineWrapping');
    if (lineWrapping) {
      lineWrapping.tabIndex = 1;
      clearInterval(itv);
    }
  }, 1000);
} else if (document.getElementById('ca-edit')) {
  // ctrl+e打开w+快速编辑
  window.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key === 'e') {
      event.preventDefault();
      document.getElementById('Wikiplus-Edit-TopBtn')!.click();
    }
  });
}
