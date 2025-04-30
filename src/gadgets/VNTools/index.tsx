import { chunk } from 'lodash-es';
import { categoryMembers } from '@/utils/api';
import addHeaderButton from '@/utils/addHeaderButton';
import { ApiQueryResponse } from '@/@types/api';

$(() => {
  const api = new mw.Api();
  if (mw.config.get('wgPageName') === 'User:BearBin/VNData/Galgame声优更新时间') {
    mw.loader.using(['moment', 'mediawiki.notification']);
    const $uploadButton = addHeaderButton({ text: '更新' });
    $uploadButton.on('click', async () => {
      try {
        if ($uploadButton.text() === '正在更新……') {
          return;
        }
        $uploadButton.text('正在更新……');
        const cvList = await categoryMembers('Category:R-18作品声优');
        const titleChunks = chunk(cvList, 50);
        const lastUpdateData: { title: string, timestamp: string }[] = [];
        for (const titleChunk of titleChunks) {
          const revisions = await api.post({
            action: 'query',
            format: 'json',
            prop: 'revisions',
            titles: titleChunk.join('|'),
            rvprop: 'timestamp',
          }) as ApiQueryResponse;
          lastUpdateData.push(...Object.values(revisions.query.pages).map(({ title, revisions: [{ timestamp }]}) => ({
            title,
            timestamp,
          })));
        }
        const listText = lastUpdateData.sort((a, b) => {
          return (new Date(a.timestamp)) < (new Date(b.timestamp)) ? -1 : 1;
        }).map(({ title, timestamp }) => `* [[${title}]]：${moment(timestamp).format('YYYY-MM-DD HH:mm:ss')}`).join('\n');
        await api.postWithToken('csrf', {
          action: 'edit',
          title: 'User:BearBin/VNData/Galgame声优更新时间',
          text: [
            '本页面统计[[:Category:R-18作品声优]]内页面的最后更新时间，提示可能需要更新的页面。\n',
            '您可以使用[[User:BearBin/VNData#VNTools|VNTools]]更新本页面。\n',
            listText,
          ].join('\n'),
          summary: '使用[[User:BearBin/VNData#VNTools|VNTools]]自动更新列表',
          bot: true,
          tags: 'Bot',
        });
        $uploadButton.text('更新成功！');
        mw.notify('更新成功！即将刷新页面……');
        window.location.reload();
      } catch (e) {
        mw.notify(`更新失败！${e}`, { type: 'error' });
        $uploadButton.text('更新');
      }
    });
  }
  // if (mw.config.get('wgPageName') === 'User:BearBin/VNData/视研会30日编辑数统计') {

  // }
});
