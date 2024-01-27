/**
 * 获取链接到指定页面的列表
 * @param {string} pagename 页面名
 * @returns {Promise<string[]>} 列表
 */
const linkList = async (pagename) => {
  const api = new mw.Api();
  let lhcontinue = 1;
  const pageList = [];
  while (lhcontinue) {
    const res = await api.get({
      action: 'query',
      prop: 'linkshere',
      titles: pagename,
      lhlimit: 'max',
      lhcontinue,
    });
    if (Object.values(res.query.pages)[0].linkshere) {
      for (const { title } of Object.values(res.query.pages)[0].linkshere) {
        pageList.push(title);
      }
    }
    lhcontinue = res.continue?.lhcontinue;
  }
  return pageList;
};

export default linkList;
