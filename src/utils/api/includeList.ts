import { ApiParams } from "@/@types/api";

/**
 * 获取嵌入了指定页面的页面列表
 * @param {string} pagename 页面名
 * @param {number[]} tinamespace 命名空间，格式同api.php中以|分隔
 * @returns {Promise<string[]>} 页面列表
 */
const includeList = async (pagename: string, tinamespace: number[]): Promise<string[]> => {
  const api = new mw.Api();
  let ticontinue = '1';
  const pageList = [];
  while (ticontinue) {
    const postBody: ApiParams = {
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
    // @ts-ignore
    pageList.push(...(Object.values(res.query.pages)[0].transcludedin || []).map(({ title }) => title));
    ticontinue = res.continue?.ticontinue;
  }
  return pageList;
};

export default includeList;
