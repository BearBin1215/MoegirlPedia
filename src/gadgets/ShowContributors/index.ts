import type { ApiParams, ApiQueryResponse } from '@/@types/api';
import './index.less';

type Size = 'small' | 'medium' | 'large' | 'larger' | 'full';

interface UserContribution {
  user: string;
  count: number;
  add: number;
  remove: number;
}

$(() => (async () => {
  if (
    ![0, 2, 4, 10, 12, 14, 828, 274].includes(mw.config.get('wgNamespaceNumber')) ||
    mw.config.get('wgArticleId') === 0 ||
    !['view', 'history'].includes(mw.config.get('wgAction'))
  ) { return; }
  await mw.loader.using([
    'mediawiki.api',
    'mediawiki.notification',
    'oojs-ui',
    'oojs-ui.styles.icons-interactions', // 提供关闭窗口按钮
    'jquery.tablesorter', // 提供表格排序功能
  ]);
  class ContributorDialog extends OO.ui.Dialog {
    $table!: JQuery<HTMLTableElement>;
    $tbody!: JQuery<HTMLTableSectionElement>;
    $body!: JQuery<HTMLDivElement>;
    got = false;

    static static = {
      ...super.static,
      name: 'ShowContributor',
      size: 'large' as Size,
    };
    initialize() {
      super.initialize();

      this.$tbody = $('<tbody/>') as JQuery<HTMLTableSectionElement>;

      this.$table = $('<table id="show-contributor-table" class="wikitable"/>') as JQuery<HTMLTableElement>;

      this.$body.append(
        $('<div id="show-contributor-header"/>').append(
          $('<div id="show-contributor-headline">本页贡献统计</div>'),
          new OO.ui.IconWidget({
            icon: 'close',
            id: 'show-contributor-close',
          }).$element.on('click', () => this.close()),
        ),
        this.$table.append(
          $('<thead><th>用户</th><th>编辑数</th><th>增加字节数</th><th>删减字节数</th></thead>'),
          this.$tbody,
        ),
      );
      return this;
    }

    /**
     * 获取贡献者
     * @returns 贡献者及其编辑情况
     */
    getContributors = async () => {
      const api = new mw.Api();
      const contributors: Record<string, number[]> = {};
      let rvcontinue: string | undefined = '';
      let prevSize: number | undefined = 0; // 用于记录上次编辑的字节数
      const config: ApiParams = {
        action: 'query',
        format: 'json',
        prop: 'revisions',
        titles: mw.config.get('wgPageName'),
        rvprop: 'user|size',
        rvlimit: 'max',
        rvdir: 'newer',
      };
      do {
        if (rvcontinue) {
          config.rvcontinue = rvcontinue;
        }
        try {
          const res = await api.get(config) as ApiQueryResponse;
          rvcontinue = res.continue?.rvcontinue;
          for (const { user, size } of Object.values(res.query.pages!)[0].revisions) {
            contributors[user] ||= [];
            contributors[user].push(size - prevSize);
            prevSize = size;
          }
        } catch (error) {
          mw.notify(`获取编辑记录失败：${error}`, { type: 'error' });
        }
      } while (rvcontinue);
      return contributors;
    };

    // 向表格添加一行
    addRow = ($tbody: JQuery<HTMLTableSectionElement>, { user, count, add, remove }: UserContribution) => {
      $tbody.append($('<tr/>').append(
        $('<td/>').append(
          $(`<a href="${mw.config.get('wgArticlePath').replace('$1', `User:${user}`)}"/>`).append(
            `<img class="user-avatar" src="https://commons.moegirl.org.cn/extensions/Avatar/avatar.php?user=${user}"/>`,
            user,
          ),
        ),
        `<td>${count}</td>`,
        `<td>${add}</td>`,
        `<td>${remove}</td>`,
      ));
    };

    // 分析数据，展示结果
    showContributors = (contributors: Record<string, number[]>) => {
      this.$tbody.empty();
      for (const key in contributors) {
        this.addRow(this.$tbody, {
          user: key,
          count: contributors[key].length,
          add: contributors[key].reduce((acc, cur) => cur > 0 ? acc + cur : acc, 0),
          remove: contributors[key].reduce((acc, cur) => cur < 0 ? acc + cur : acc, 0),
        });
      }
      this.got = true;
    };
  }

  const windowManager = new OO.ui.WindowManager({
    id: 'show-contributor',
  });
  $(document.body).append(windowManager.$element);
  const SCDialog = new ContributorDialog();
  windowManager.addWindows([SCDialog]);

  const contributorButton = new OO.ui.ButtonWidget({
    label: '本页贡献者',
    icon: 'search',
    flags: 'progressive',
    id: 'show-contributor-button',
  });
  switch (mw.config.get('skin')) {
    case 'moeskin':
      $('#tagline').prepend(contributorButton.$element);
      break;
    case 'vector':
    default:
      $('#bodyContent').prepend(contributorButton.$element);
      break;
  }

  contributorButton.on('click', async () => {
    if (!SCDialog.got) {
      contributorButton.setLabel('正在查询');
      const contributors = await SCDialog.getContributors();
      console.log(contributors);
      SCDialog.showContributors(contributors);
      SCDialog.$table.tablesorter();
      contributorButton.setLabel('本页贡献者');
    }
    windowManager.openWindow(SCDialog);
  });
})());
