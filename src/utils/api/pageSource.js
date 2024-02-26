/**
 * 获取页面源代码
 * @param {string} title 页面标题
 * @returns {Promise<string | undefined>} 页面源代码
 */
const pageSource = async (title) => {
  const api = new mw.Api();
  const res = await api.post({
    action: 'query',
    prop: 'revisions',
    titles: title,
    rvprop: 'content',
  });
  const [pageData] = Object.values(res.query.pages);
  if ('revisions' in pageData) {
    return pageData.revisions?.[0]['*'];
  }
  if ('missing' in pageData) {
    throw ('missingtitle');
  }
};

export default pageSource;
