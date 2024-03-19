import type { ApiParams, ApiQueryResponse } from "@/@types/api";
/**
 * 获取链接到指定页面的列表
 * @param pagename 页面名
 * @param lhnamespace 命名空间，格式同api.php中以|分隔
 * @returns 页面列表
 */
const linkList = async (pagename: string, lhnamespace?: number[]): Promise<string[]> => {
  const api = new mw.Api();
  let lhcontinue: string | undefined = undefined;
  const pageList: string[] = [];
  const postBody: ApiParams = {
    action: 'query',
    prop: 'linkshere',
    titles: pagename,
    lhlimit: 'max',
  }
  if (lhnamespace) {
    postBody.lhnamespace = lhnamespace;
  }
  do {
    const res = await api.post(postBody) as ApiQueryResponse;
    pageList.push(...(Object.values(res.query.pages)[0].linkshere || []).map(({ title }) => title));
    lhcontinue = res.continue?.lhcontinue;
    if (lhcontinue) {
      postBody.lhcontinue = lhcontinue;
    }
  } while (lhcontinue);
  return pageList;
};

export default linkList;
