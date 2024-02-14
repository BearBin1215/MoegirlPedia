/**
 * 获取嵌入了指定页面的页面列表
 * @param {string} pagename 页面名
 * @param {string} tinamespace 命名空间，格式同api.php中以|分隔
 * @returns {Promise<string[]>} 页面列表
 */
const includeList = async (pagename, tinamespace = '') => {
  const api = new mw.Api();
  let ticontinue = 1;
  const pageList = [];
  while (ticontinue) {
    const postBody = {
      action: 'query',
      prop: 'transcludedin',
      titles: pagename,
      tilimit: 'max',
      ticontinue,
    };
    if (tinamespace) {
      postBody.tinamespace = tinamespace;
    }
    const res = await api.post(postBody);
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
