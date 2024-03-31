import type { ApiCompareResponse } from '@/@types/api';

/** 将比较结果转化为JQuery对象 */
export function formatDiff(
  diffResult: string,
  showTitle = false,
  $otitleContent?: JQuery<HTMLElement> | Element | string,
  $ntitleContent?: JQuery<HTMLElement> | Element | string,
) {
  const $otitle = $(`<td colspan="${diffResult ? 2 : 1}" class="diff-otitle" />`);
  const $ntitle = $(`<td colspan="${diffResult ? 2 : 1}" class="diff-ntitle" />`);
  $otitle.append($otitleContent || '旧版本');
  $ntitle.append($ntitleContent || '新版本');
  const diffTitle = $('<tr class="diff-title" />').append($otitle, $ntitle);
  const diffMarker = '<colgroup><col class="diff-marker"><col class="diff-content"><col class="diff-marker"><col class="diff-content"></colgroup>';
  return $(`<table class="diff diff-contentalign-left" data-mw="interface" />`).append(
    diffResult && diffMarker,
    $('<tbody />').append(
      showTitle ? diffTitle : '',
      diffResult || '<tr><td colspan="2" class="diff-notice"><div class="mw-diff-empty">（没有差异）</div></td></tr>',
    ),
  );
}

/**
 * 比较差异
 * @param fromtext 旧版本
 * @param totext 新版本
 * @param showTitle 是否显示标题（旧版本、新版本）
 * @returns 新旧版本差异
 */
const compare = async (fromtext: string, totext: string, showTitle = false) => {
  const api = new mw.Api();
  const res = await api.post({
    action: 'compare',
    fromtext,
    totext,
    topst: true,
    fromtitle: 'PAGENAME',
  }) as ApiCompareResponse;
  return formatDiff(res.compare['*'], showTitle);
};

export default compare;
