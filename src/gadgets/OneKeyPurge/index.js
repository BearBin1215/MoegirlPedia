import Snake from '@/components/Snake';
import { linkList, includeList } from '@/utils/api';
import './index.less';

$(() => (async () => {
  if (
    mw.config.get('wgNamespaceNumber') < 0 &&
    mw.config.get('wgRelevantPageName') === mw.config.get('wgPageName')
  ) {
    return;
  }
  await mw.loader.using([
    'mediawiki.api',
    'mediawiki.user',
    'mediawiki.notification',
    'oojs-ui',
  ]);
  const api = new mw.Api();
  const PAGENAME = mw.config.get('wgNamespaceNumber') === -1
    ? mw.config.get('wgRelevantPageName')
    : mw.config.get('wgPageName');
  const UserRights = await mw.user.getRights();
  const Noratelimit = UserRights.includes('noratelimit');

  class OKPWindow extends OO.ui.Dialog {
    failList = []; // 记录操作失败的页面

    changeList = []; // 记录代码产生意外变化的页面

    complete = 0; // 已完成操作的页面数，成功或发生变化，不含失败

    progressBar = new Snake(); // 进度条

    running = false;

    static static = {
      ...super.static,
      tagName: 'div',
      name: 'one-key-purge',
    };

    initialize() {
      super.initialize();

      // 顶部按钮和标题
      this.$header = $('<header class="okp-header"></header>');
      // 主体选择区
      this.panelLayout = new OO.ui.PanelLayout({
        scrollable: false,
        expanded: false,
        padded: true,
      });
      // 底部帮助
      this.$footer = $('<footer class="okp-footer"></footer>');

      this.closeButton = new OO.ui.ButtonWidget({
        label: '取消',
        flags: [
          'destructive',
        ],
      });

      this.stopButton = new OO.ui.ButtonWidget({
        label: '终止',
        flags: [
          'primary',
          'destructive',
        ],
      });
      this.stopButton.$element.hide();

      this.actionButton = new OO.ui.ButtonWidget({
        label: '执行',
        flags: [
          'primary',
          'progressive',
        ],
      });

      // 选择要获取的页面类型，可都选
      this.typeSelectInput = new OO.ui.CheckboxMultiselectInputWidget({
        options: [
          { data: 'link', label: '链接' },
          { data: 'include', label: '嵌入' },
        ],
      });
      const typeFiled = new OO.ui.FieldLayout(this.typeSelectInput, {
        label: '页面类型',
      });

      // 帮助
      const helpButton = new OO.ui.ButtonWidget({
        label: '帮助',
        icon: 'help',
      });

      // 选择要进行的操作，单选
      const purgeOption = new OO.ui.RadioOptionWidget({ data: 'purge', label: '清除缓存（Purge）' });
      const nullEditOption = new OO.ui.RadioOptionWidget({ data: 'nulledit', label: '零编辑（Null Edit）' });
      this.optionRadioSelect = new OO.ui.RadioSelectWidget({
        items: [
          purgeOption,
          nullEditOption,
        ],
      });
      this.optionRadioSelect.selectItem(purgeOption);
      const optionFiled = new OO.ui.FieldLayout(this.optionRadioSelect, {
        label: '操作类型',
      });

      // 根据用户权限提示
      const noteText = Noratelimit ?
        '<b>提醒</b>：在被大量嵌入/链入的页面此工具将会向服务器发送<b>大量请求</b>，请慎重使用！'
        :
        '<b>提醒</b>：您未持有<code>noratelimit</code>权限，清除缓存和零编辑的速率将被分别限制为<u>30次/min</u>和<u>10次/min</u>，请耐心等待。';

      /**
       * 添加事件
       */
      this.closeButton.on('click', () => this.close());

      this.stopButton.on('click', () => {
        this.stopButton.setDisabled(true);
        this.running = false;
      });

      helpButton.on('click', () => {
        OO.ui.alert($('<ul id="one-key-purge-help"></ul>').append(
          '<li><b>清除缓存</b>：通常在需要刷新页面内容时使用，例如模板编辑后刷新嵌入了此模板的页面。</li>',
          `<li><b>零编辑</b>：通常在需要刷新<a href="/Special:链入页面/${PAGENAME}">链入/嵌入页面列表</a>时使用，例如页面移动后清理链入。</li>`,
        ), {
          title: '帮助',
          size: 'medium',
        });
      });

      this.actionButton.on('click', () => this.action());

      /**
       * 将元素添加到窗口
       */
      this.$body.append(
        this.$header.append(
          $('<div class="okp-button okp-cancel-button"></div>').append(
            this.closeButton.$element,
            this.stopButton.$element,
          ),
          $('<div class="okp-header-text">批量清除页面缓存</div>'),
          $('<div class="okp-button okp-action-button"></div>').append(
            this.actionButton.$element,
          ),
        ),
        this.panelLayout.$element.append(
          `<div class="okp-note">${noteText}</div>`,
          typeFiled.$element,
          optionFiled.$element,
          $(this.progressBar.element),
        ),
        this.$footer.append(
          $('<div class="okp-button okp-help-button"></div>').append(helpButton.$element),
        ),
      );
    }

    /**
     * 等待一段时间，用于模拟sleep
     * @param {number} time 等待间隔，单位ms
     * @returns
     */
    waitInterval = (time) => new Promise((resolve) => setTimeout(resolve, time));

    // 根据用户选项获取页面列表
    async getList() {
      const pageList = [];
      try {
        if (this.typeSelectInput.getValue().includes('link')) {
          const result = await linkList(PAGENAME);
          if (result.length > 0) {
            mw.notify(`获取链接到【${PAGENAME}】的页面列表成功。`);
          } else {
            mw.notify(`没有页面链接到【${PAGENAME}】。`);
          }
          pageList.push(...result);
        }
        if (this.typeSelectInput.getValue().includes('include')) {
          const result = await includeList(PAGENAME);
          if (result.length > 0) {
            mw.notify(`获取链接到【${PAGENAME}】的页面列表成功。`);
          } else {
            mw.notify(`没有页面链接到【${PAGENAME}】。`);
          }
          pageList.push(...result);
        }
      } catch (error) {

      }
      return [...new Set(pageList)];
    }

    // 返回用户所选择的操作
    get optionType() {
      return this.optionRadioSelect.findSelectedItem()?.getData();
    }

    /**
     * 根据输入的标题和操作情况，更改进度条样式来显示进度
     * @param title 页面标题
     * @param result 操作结果（success/warn/fail，大小写不敏感）
     * @param err （可选）错误/警告消息
     */
    progressChange(title, result, err = '') {
      const optionText = this.optionType === 'nulledit' ? '零编辑' : '清除缓存';
      this.progressBar.crawl(title, result);
      switch (result.toLowerCase()) {
        case 'success': // 成功且无意外
          this.complete++;
          break;
        case 'warn': // 成功但出现意外，目前仅用于编辑产生意外的源代码变动
          this.complete++;
          this.changeList.push(title);
          break;
        case 'fail': // 失败
          this.failList.push(title);
          mw.notify(`页面【${title}】${optionText}失败${err ? `：${err}` : ''}。`, { type: 'warn' });
          break;
      }
    }

    // 零编辑
    async nullEdit(titles) {
      for (let index = 0; index < titles.length; index++) {
        if (!this.running) {
          break;
        }
        const title = titles[index];
        this.progressBar.crawl(title, 'ongoing');
        api.postWithToken('csrf', {
          format: 'json',
          action: 'edit',
          appendtext: '',
          watchlist: 'nochange',
          nocreate: true,
          title,
        }).done((data) => {
          this.progressBar.crawl(title, 'ongoing');
          if (data.edit.result === 'Success') {
            if (data.edit.nochange !== undefined) {
              this.progressChange(title, 'success');
            } else {
              this.progressChange(title, 'warn');
            }
          } else {
            this.progressChange(title, 'fail');
          }
        }).catch((error) => {
          this.progressChange(title, 'fail', error);
        });
        if (index + 1 < titles.length) {
          if (!Noratelimit) {
            await this.waitInterval(6000);
          } else {
            await this.waitInterval(1000);
          }
        }
      }
    }

    /**
     * 清除缓存（action=purge）
     * @param {string[]} pageList 页面列表
     */
    async purge(pageList) {
      // 分割为5个一批，执行purge
      for (let i = 0; i < pageList.length; i += 5) {
        if (!this.running) {
          break;
        }
        const pages = pageList.slice(i, i + 5);
        // 将准备发送请求的页面标记为进行
        for (const title of pages) {
          this.progressBar.crawl(title, 'ongoing');
        }
        api.post({
          format: 'json',
          action: 'purge',
          titles: pages.join('|'),
          forcelinkupdate: true,
        }).done(({ purge }) => {
          // 将成功purge的页面标记为完成。其余标记为失败？
          for (const { title } of purge) {
            this.progressChange(title, 'success');
          }
        }).catch((error) => {
          for (const title of pages) {
            this.progressChange(title, 'fail', error);
          }
        });
        // 如果不是最后一批，根据是否拥有noratelimit权限等待间隔
        if (i + 5 < pageList.length) {
          if (!Noratelimit) {
            await this.waitInterval(2000);
          } else {
            await this.waitInterval(1000);
          }
        }
      }
    }

    /**
     * 执行
     */
    async action() {
      this.progressBar.clear();
      if (this.typeSelectInput.getValue().length === 0) {
        mw.notify('请选择页面类型。');
      }

      // 数据初始化
      this.failList = [];
      this.changeList = [];
      this.complete = 0;
      this.running = true;

      // 元素控制
      this.$header.addClass('oo-ui-pendingElement-pending');
      this.actionButton.setDisabled(true);
      this.stopButton.setDisabled(false);
      this.closeButton.$element.hide();
      this.stopButton.$element.show();

      // 获取页面列表
      const pageList = await this.getList();

      if (pageList.length > 0) {
        mw.notify(`共${pageList.length}个页面，开始执行${this.optionType === 'nulledit' ? '零编辑' : '清除缓存'}……`);
      }
      // 添加进度条格子
      for (const item of pageList) {
        this.progressBar.addScale(item);
      }
      this.updateSize();

      // 执行操作
      if (this.optionType === 'nulledit') {
        await this.nullEdit(pageList);
      } else {
        await this.purge(pageList);
      }

      if (this.failList.length > 0) {
        OO.ui.alert($(`<div>${this.failList.join('、')}<br>可能页面受到保护，或编辑被过滤器拦截，请手动检查。</div>`), {
          title: '提示',
          size: 'medium',
        });
      }
      if (this.changeList.length > 0) {
        OO.ui.alert($(`<div>${this.changeList.join('、')}。<br>被意外更改，请手动撤回或回退`), {
          title: '警告',
          size: 'medium',
        });
      }

      // 元素控制
      this.$header.removeClass('oo-ui-pendingElement-pending');
      this.actionButton.setDisabled(false);
      this.closeButton.$element.show();
      this.stopButton.$element.hide();
    }
  }

  // 将窗口添加至body
  const $body = $(document.body);
  const windowManager = new OO.ui.WindowManager({
    id: 'one-key-purge',
  });
  $body.append(windowManager.$element);
  const OKPDialog = new OKPWindow({
    size: 'large',
  });
  windowManager.addWindows([OKPDialog]);

  // 添加入口
  $(mw.util.addPortletLink('p-cactions', 'javascript:void(0)', '批量清除缓存', 'ca-okp')).on('click', () => {
    $('#mw-notification-area').appendTo('body'); // 使提醒在窗口上层
    windowManager.openWindow(OKPDialog);
    $body.css('overflow', 'auto');
  });
})());
