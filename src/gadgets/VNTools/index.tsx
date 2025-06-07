import addHeaderButton from '@/utils/addHeaderButton';
import { updateCVLastUpdateDate, updateNavbox } from './methods';

$(() => {
  mw.loader.using(['mediawiki.notification', 'mediawiki.api']);
  if (mw.config.get('wgPageName') === 'User:BearBin/VNData/里界声优条目更新时间') {
    mw.loader.using(['moment']);
    const $uploadButton = addHeaderButton({ text: '更新' });
    $uploadButton.on('click', async () => {
      try {
        if ($uploadButton.text() === '正在更新……') {
          return;
        }
        $uploadButton.text('正在更新……');
        await updateCVLastUpdateDate();
      } catch (e) {
        mw.notify(`更新失败：${e}`, { type: 'error' });
        $uploadButton.text('更新');
      }
    });
  }
  if (mw.config.get('wgPageName') === 'Template:萌百视觉小说研究会') {
    const $uploadButton = addHeaderButton({ text: '更新' });
    $uploadButton.on('click', async () => {
      try {
        if ($uploadButton.text() === '正在更新……') {
          return;
        }
        $uploadButton.text('正在更新……');
        await updateNavbox();
      } catch (e) {
        mw.notify(`更新失败：${e}`, { type: 'error' });
        $uploadButton.text('更新');
      }
    });
  }
});
