/**
 * 获取嵌入了指定页面的页面列表
 * @param {string} pagename 页面名
 * @returns {Promise<string[]>} 页面列表
 */
const includeList = async (pagename) => {
  const api = new mw.Api();
  let ticontinue = 1;
  const pageList = [];
  while (ticontinue) {
    const res = await api.post({
      action: 'query',
      prop: 'transcludedin',
      titles: pagename,
      tilimit: 'max',
      ticontinue,
    });
    if (Object.values(res.query.pages)[0].transcludedin) {
      for (const { title } of Object.values(res.query.pages)[0].transcludedin) {
        pageList.push(title);
      }
    }
    ticontinue = res.continue?.ticontinue;
  }
  return pageList;
};

export default includeList;
