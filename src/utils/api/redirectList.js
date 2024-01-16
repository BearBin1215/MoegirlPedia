/**
 * 获取重定向列表
 * @param {string} pagename 页面名
 * @returns {Promise<string[]>}
 */
const redirectList = async (pagename) => {
  const api = new mw.Api();
  let rdcontinue = '';
  const pageList = [];
  while (rdcontinue !== void 0) {
    const res = await api.get({
      action: 'query',
      prop: 'redirects',
      titles: pagename,
      rdlimit: 'max',
      rdcontinue,
    });
    if (Object.values(res.query.pages)[0].redirects) {
      for (const { title } of Object.values(res.query.pages)[0].redirects) {
        pageList.push(title);
      }
    }
    rdcontinue = res.continue?.rdcontinue;
  }
  return pageList;
};

export default redirectList;