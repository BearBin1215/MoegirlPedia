/**
 * 获取页面源代码
 * @param {string} title 页面标题
 * @returns {Promise<string>} 页面源代码
 */
const pageSource = async (title) => {
  const api = new mw.Api();
  const res = await api.post({
    action: 'query',
    prop: 'revisions',
    titles: title,
    rvprop: 'content',
  });
  return Object.values(res.query.pages)[0].revisions[0]['*'];
};

export default pageSource;
