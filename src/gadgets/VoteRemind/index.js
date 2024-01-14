/**
 * @todo 获取开票时维护组成员
 */

$(() => (async () => {
  if (!document.getElementsByClassName('votebox')[0] || !(mw.config.get('wgTitle').startsWith('提案/讨论中提案/') || mw.config.get('wgTitle') === '讨论版/权限变更')) {
    return;
  }
  await mw.loader.using(['mediawiki.api', 'mediawiki.util', 'mediawiki.notification', 'oojs-ui', 'ext.gadget.site-lib']);
  const api = new mw.Api;
  const $body = $(document.body);
  const PAGENAME = mw.config.get('wgPageName');
  const isProposal = mw.config.get('wgTitle').startsWith('提案/讨论中提案/'); // 提案还是人事案
  const isBot = mw.config.get('wgUserGroups').includes('flood'); // 是否拥有机器用户权限
  const GadgetTitle = wgULS('一键发送投票提醒', '一鍵發送投票提醒');

  class ReminderWindow extends OO.ui.ProcessDialog {
    failList = [];
    static static = {
      ...super.static,
      tagName: 'div',
      name: 'lr-reminder',
      title: GadgetTitle,
      actions: [
        {
          action: 'cancel',
          label: '取消',
          flags: ['safe', 'close', 'destructive'],
        },
        {
          action: 'submit',
          label: wgULS('发送', '發送'),
          flags: ['primary', 'progressive'],
        },
      ],
    };
    constructor(config) {
      super(config);
    }
    initialize() {
      super.initialize();
      this.panelLayout = new OO.ui.PanelLayout({
        scrollable: false,
        expanded: false,
        padded: true,
      });

      // 提案，输入标题
      this.proposalTitleBox = new OO.ui.TextInputWidget({
        value: PAGENAME.substring(PAGENAME.lastIndexOf('/') + 1, PAGENAME.length),
        validate: 'non-empty',
      });
      const proposalTitleField = new OO.ui.FieldLayout(this.proposalTitleBox, {
        label: wgULS('提案标题', '提案標題'),
        align: 'top',
      });

      // 人事案，选择章节标题
      this.headlines = [];
      for (const item of $('.votebox').parent('.discussionContainer').children('h2').children('.mw-headline')) {
        this.headlines.push(item.id);
      }
      this.sectionTitleDropdown = new OO.ui.DropdownInputWidget({
        options: [
          ...this.headlines.map((v) => ({
            data: v,
            label: v.replaceAll('_', ' '),
          })),
        ],
      });
      const sectionTitleFiled = new OO.ui.FieldLayout(this.sectionTitleDropdown, {
        label: wgULS('人事案标题', '人事案標題'),
        align: top,
      });

      // 人事案选择要提醒的用户组
      this.Papp = new OO.ui.RadioOptionWidget({ data: 'p', label: '管理员、巡查姬', selected: true }); // 管、监、查、行
      this.Sapp = new OO.ui.RadioOptionWidget({ data: 's', label: '管理员' });
      this.groupsRadioSelect = new OO.ui.RadioSelectWidget({
        items: [
          this.Papp,
          this.Sapp,
        ],
      });
      const groupsFiled = new OO.ui.FieldLayout(this.groupsRadioSelect, {
        label: wgULS('要提醒的用户组', '要提醒的用戶組'),
        align: top,
      });

      // 提案需标题，人事案需选择标题和要通知的用户组。
      if (isProposal) {
        this.panelLayout.$element.append(
          proposalTitleField.$element,
        );
      } else {
        this.panelLayout.$element.append(
          sectionTitleFiled.$element,
          groupsFiled.$element,
        );
      }
      this.$body.append(this.panelLayout.$element);
    }

    get proposalTitle() {
      return this.proposalTitleBox.getValue();
    }
    get sectionTitle() {
      return this.sectionTitleDropdown.getValue();
    }
    get groupSelected() {
      return this.groupsRadioSelect.findSelectedItem()?.getData?.();
    }

    // 获取选择的用户组列表（提案则不选择）
    async getUserGroup() {

      const userGroup = await api.post({
        action: 'query',
        titles: 'Module:UserGroup/data',
        prop: 'revisions',
        rvprop: 'content',
        rvlimit: 1,
      });
      const userList = JSON.parse(Object.values(userGroup.query.pages)[0].revisions[0]['*']);

      let groupsToVote;
      if (isProposal) {
        groupsToVote = [...userList.sysop, ...userList.patroller];
      } else {
        switch (this.groupSelected) {
          case 'p':
            groupsToVote = [...userList.sysop, ...userList.patroller];
            break;
          case 's':
            groupsToVote = userList.sysop;
            break;
        }
      }
      return groupsToVote;
    }

    // 获取已投票用户列表
    get userVoted() {
      const userVotedList = [];
      const hrefList = [];
      if (isProposal) {
        // 提案检测.votebox后面的<ol>内的用户链接
        $('.votebox ~ ol a[href^=\'/User\'], .votebox ~ ol a[href^=\'/index.php?title=User\']').each(function () {
          hrefList.push(this.href);
        });
      } else {
        // 人事案检测当前选择标题所在.discussionContainer内.votebox后面的ol
        $(`#${this.sectionTitle.replaceAll(':', '\\:')}`).parents('.discussionContainer').find('.votebox ~ ol a[href^=\'/User\'], .votebox ~ ol a[href^=\'/index.php?title=User\']').each(function () {
          hrefList.push(this.href);
        });
      }
      for (const item of hrefList) {
        userVotedList.push(decodeURI(item.replace(/.*User(_talk)?:([^&]*).*/g, '$2')));
      }
      return userVotedList; // 这个用于后面求差集
    }

    // 根据选择的用户组，去掉已投票用户和不愿收到提醒用户，得到要提醒的用户列表
    async getUserToRemind() {
      let userToRemind;
      await this.getUserGroup().then((result) => {
        userToRemind = result;
      });

      const Noremind = await api.post({
        action: 'query',
        titles: 'User:BearBin/js/voteRemind.js/Noremind',
        prop: 'revisions',
        rvprop: 'content',
        rvlimit: 1,
      });
      const userNoremind = Object.values(Noremind.query.pages)[0].revisions[0]['*'].split(/\n\* */);
      let applicant;
      if (!isProposal) {
        applicant = this.sectionTitle.replace(/.*User:(.*)/g, '$1').replaceAll('_', ' ');
      }
      const userExcluded = new Set([...this.userVoted, ...userNoremind, ...[applicant]]);
      return userToRemind.filter((x) => !userExcluded.has(x));
    }

    // 生成链接
    get link() {
      if (isProposal) {
        return `[[萌娘百科_talk:提案/讨论中提案/${this.proposalTitle}|${this.proposalTitle.replaceAll('_', ' ')}]]`;
      }
      return `[[萌娘百科_talk:讨论版/权限变更#${this.sectionTitle}|${this.sectionTitle.replaceAll('_', ' ')}]]`;
    }

    // 发送提醒
    async remind(username) {
      const send = await api.postWithToken('csrf', {
        format: 'json',
        action: 'edit',
        section: 'new',
        watchlist: 'nochange',
        tags: 'Automation tool',
        bot: isBot,
        title: `User_talk:${username}`,
        sectiontitle: '投票提醒',
        text: `<i style="font-size:small">本通知使用一键提醒小工具发出，如出现错误，请联系[[User_talk:BearBin|BearBin]]。若不希望接到此提醒，请在[[User:BearBin/js/voteRemind.js/Noremind|这个页面]]记录您的用户名。</i><br/>您好，${isProposal ? '提案' : '人事案'}【${this.link}】已经开始投票。您尚未投票，请及时参与喵～——~~~~`,
      }).done(() => {
        mw.notify(wgULS(`向${username}发送投票提醒成功。`, `向${username}發送投票提醒成功。`));
      });
      if (send.error) {
        this.failList.push(username);
        mw.notify(wgULS(`向${username}发送投票提醒失败：${send.error.code}。`, `向${username}發送投票提醒失敗：${send.error.code}。`), { type: 'error' });
      }
    }

    getActionProcess(action) {
      if (action === 'cancel') {
        return new OO.ui.Process(() => {
          this.close({ action });
        }, this);
      } else if (action === 'submit') {
        return new OO.ui.Process($.when((async () => {
          this.failList = []; // 清空失败列表（真的有必要吗（））
          await this.getUserToRemind().then(async (result) => {
            for (const user of result) {
              await this.remind(user);
            }
          });
          if (this.failList.length > 0) {
            oouiDialog.alert(this.failList.join('、'), {
              title: wgULS('向以下用户发送提醒失败', '向以下使用者發送提醒失敗'),
              size: 'small',
            });
          }
          this.close({ action });
        })()).promise(), this);
      }
      return super.getActionProcess(action);
    }
  }

  // 添加按钮和窗口
  const windowManager = new OO.ui.WindowManager();
  $body.append(windowManager.$element);
  const reminderDialog = new ReminderWindow({
    size: 'medium',
    id: 'bearbin-vote-remind',
  });
  windowManager.addWindows([reminderDialog]);

  $(mw.util.addPortletLink('p-cactions', 'javascript:void(0)', '投票提醒', 'ca-vote-remind', GadgetTitle, 'r')).on('click', (e) => {
    e.preventDefault();
    windowManager.openWindow(reminderDialog);
    $body.css('overflow', 'auto');
  });
})());