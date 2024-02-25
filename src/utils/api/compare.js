/**
 * 比较差异
 * @param {string} fromtext 旧版本
 * @param {string} totext 新版本
 * @param {boolean} showTitle 是否显示标题（旧版本、新版本）
 * @returns {string}
 */
const compare = async (fromtext, totext, showTitle = false) => {
  const api = new mw.Api();
  const res = await api.post({
    action: 'compare',
    fromtext,
    totext,
    topst: true,
    fromtitle: 'PAGENAME',
  });
  const result = res.compare['*'];
  const diffTitle = `<tr class="diff-title"><td colspan="${result ? 2 : 1}" class="diff-otitle">旧版本</td><td colspan="${result ? 2 : 1}" class="diff-ntitle">新版本</td></tr>`;
  const diffMarker = '<colgroup><col class="diff-marker"><col class="diff-content"><col class="diff-marker"><col class="diff-content"></colgroup>';
  return `<table class="diff diff-contentalign-left" data-mw="interface">${result && diffMarker}<tbody>${showTitle ? diffTitle : ''}${result || '<tr><td colspan="2" class="diff-notice"><div class="mw-diff-empty">（没有差异）</div></td></tr>'}</tbody></table>`;
};

export default compare;
