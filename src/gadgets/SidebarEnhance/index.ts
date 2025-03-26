import { throttle } from 'lodash-es';
import styles from './index.less' assert { type: 'string' };
import folderSvg from './folderIcon.svg' assert { type: 'xml' };

$(() => {
  mw.loader.addStyleTag(styles);

  /**
   * 使$title点击时控制$body的缩放
   * @param {JQuery<HTMLElement>} $title 侧栏块标题
   * @param {JQuery<HTMLElement>} $body 侧栏块内容
   */
  const addFold = ($title: JQuery<HTMLElement>, $body: JQuery<HTMLElement>) => {
    $title
      .addClass('sidebar-enchance-title')
      .append(folderSvg);

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

  /** vector将侧栏高度设为body高度 */
  const setPanelHeight = () => {
    document.getElementById('mw-panel')!.style.height = `${document.body.scrollHeight}px`;
  };

  /** moeskin将自定义工具栏移到sticky块 */
  const moveToSticky = () => {
    if (document.getElementById('#moe-custom-sidenav-block')) {
      $('.moe-siderail-sticky').prepend($('#moe-custom-sidenav-block'));
      window.removeEventListener('scroll', moveToSticky); // 添加后移除事件
    }
  };

  switch (mw.config.get('skin')) {
    case 'moeskin':
      addFold($('#moe-custom-sidenav-block h2'), $('#moe-custom-sidenav-block-list')); // 自定义工具栏
      addFold($('#side-toc-container h3'), $('#side-toc-container>.moe-table-of-contents')); // 目录
      addFold($('#p-sl h3'), $('#p-sl>div>div')); // 短连接
      addFold($('.artwork-main .n-page-header'), $('.artwork-main .n-card__content>div')); // 短连接

      // 将工具放到sticky容器
      moveToSticky();
      window.addEventListener('scroll', moveToSticky);
      break;
    case 'vector-2022':
      $('.vector-pinnable-element .vector-menu').each((_, ele) => {
        addFold($(ele).children('.vector-menu-heading'), $(ele).children('.vector-menu-content'));
      });
      break;
    case 'vector':
    default:
      $('#mw-panel .portal').each((_, portal) => {
        addFold($(portal).children('h3'), $(portal).children('.body'));
      });

      // 将工具放到sticky容器
      $('#mw-panel').append(
        $('<div class="sidebar-enhance-stickywrapper"/>').append(
          $('#p-tb, #p-sl'),
        ),
      );
      setPanelHeight();
      window.addEventListener('resize', setPanelHeight);
      window.addEventListener('scroll', throttle(setPanelHeight, 400));
  }
});
