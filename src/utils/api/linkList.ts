import { ApiParams } from "@/@types/api";
/**
 * 获取链接到指定页面的列表
 * @param {string} pagename 页面名
 * @param {string} lhnamespace 命名空间，格式同api.php中以|分隔
 * @returns {Promise<string[]>} 列表
 */
const linkList = async (pagename: string, lhnamespace: string = ''): Promise<string[]> => {
  const api = new mw.Api();
  let lhcontinue = 1;
  const pageList = [];
  while (lhcontinue) {
    const postBody: ApiParams = {
      action: 'query',
      prop: 'linkshere',
      titles: pagename,
      lhlimit: 'max',
      lhcontinue,
    };
    if (lhnamespace) {
      postBody.lhnamespace = lhnamespace;
    }
    const res = await api.post(postBody);
    // @ts-ignore
    pageList.push(...(Object.values(res.query.pages)[0].linkshere || []).map(({ title }) => title));
    lhcontinue = res.continue?.lhcontinue;
  }
  return pageList;
};

export default linkList;
