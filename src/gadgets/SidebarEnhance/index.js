import './index.less';

$(() => {
  /**
   * 使$title点击时控制$body的缩放
   * @param {JQuery<HTMLElement>} $title 侧栏块标题
   * @param {JQuery<HTMLElement>} $body 侧栏块内容
   * @param {JQuery<HTMLElement> | string} $icon 折叠图标
   */
  const addFold = ($title, $body, $icon) => {
    $title
      .addClass('sidebar-enchance-title')
      .append($icon);

    let foldState = false;
    $title.on('click', () => {
      if (foldState) {
        $body.slideDown(200);
        $title.removeClass('body-folded');
        foldState = false;
      } else {
        $body.slideUp(200);
        $title.addClass('body-folded');
        foldState = true;
      }
    });
  };

  let folderIcon;

  switch (mw.config.get('skin')) {
    case 'moeskin':
      folderIcon = $('#moe-sitenotice-container .n-collapse-item-arrow'); // moeskin使用现成的图标
      addFold($('#moe-custom-sidenav-block h2'), $('#moe-custom-sidenav-block-list'), folderIcon.clone());
      addFold($('#side-toc-container h3'), $('#side-toc-container > .moe-table-of-contents'), folderIcon.clone());
      addFold($('#p-sl h3'), $('#p-sl > div > div'), folderIcon.clone());
      break;
    case 'vector':
    default:
      folderIcon = '<svg class="folder-icon" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 16L6 10H18L12 16Z"></path></svg>'; // vector另外搓一个
      $('#mw-panel .portal').each((_, portal) => {
        addFold($(portal).children('h3'), $(portal).children('.body'), folderIcon);
      });
  }
});