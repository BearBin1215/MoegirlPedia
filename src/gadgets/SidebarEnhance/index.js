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

  /**
   * vector将侧栏高度设为body高度
   */
  const setPanelHeight = () => {
    document.getElementById('mw-panel').style.height = `${document.body.scrollHeight}px`;
  };

  /**
   * moeskin将自定义工具栏移到sticky块
   */
  const moveToSticky = () => {
    if (document.getElementById('#moe-custom-sidenav-block')) {
      $('.moe-siderail-sticky').prepend($('#moe-custom-sidenav-block'));
      window.removeEventListener('scroll', moveToSticky); // 添加后移除事件
    }
  };

  let folderIcon;

  switch (mw.config.get('skin')) {
    case 'moeskin':
      folderIcon = $('#moe-sitenotice-container .n-collapse-item-arrow'); // moeskin使用现成的图标
      addFold($('#moe-custom-sidenav-block h2'), $('#moe-custom-sidenav-block-list'), folderIcon.clone()); // 自定义工具栏
      addFold($('#side-toc-container h3'), $('#side-toc-container>.moe-table-of-contents'), folderIcon.clone()); // 目录
      addFold($('#p-sl h3'), $('#p-sl>div>div'), folderIcon.clone()); // 短连接
      addFold($('.artwork-main .n-page-header'), $('.artwork-main .n-card__content>div'), folderIcon.clone()); // 短连接

      // 将工具放到sticky容器
      moveToSticky();
      window.addEventListener('scroll', moveToSticky);
      break;
    case 'vector':
    default:
      folderIcon = '<svg class="folder-icon" fill="#666" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 16L6 10H18L12 16Z"></path></svg>'; // vector另外搓一个
      $('#mw-panel .portal').each((_, portal) => {
        addFold($(portal).children('h3'), $(portal).children('.body'), folderIcon);
      });

      // 将工具放到sticky容器
      $('#mw-panel').append(
        $('<div class="sidebar-enhance-stickywrapper"/>').append(
          $('#p-tb, #p-sl'),
        ),
      );
      setPanelHeight();
      window.addEventListener('resize', setPanelHeight);
  }
});
