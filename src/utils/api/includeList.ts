import type { ApiParams, ApiQueryResponse } from "@/@types/api";

/**
 * 获取嵌入了指定页面的页面列表
 * @param pagename 页面名
 * @param tinamespace 命名空间，格式同api.php中以|分隔
 * @returns 页面列表
 */
const includeList = async (pagename: string, tinamespace?: number[]): Promise<string[]> => {
  const api = new mw.Api();
  let ticontinue: string | undefined = '1';
  const pageList: string[] = [];
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
    const res = await api.post(postBody) as ApiQueryResponse;
    pageList.push(...(Object.values(res.query.pages)[0].transcludedin || []).map(({ title }) => title));
    ticontinue = res.continue?.ticontinue;
  }
  return pageList;
};

export default includeList;
