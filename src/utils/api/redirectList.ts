import type { ApiQueryResponse } from '@/@types/api';

/**
 * 获取重定向列表
 * @param pagename 页面名
 * @returns 页面列表
 */
const redirectList = async (pagename: string): Promise<string[]> => {
  const api = new mw.Api();
  let rdcontinue: string | undefined = '';
  const pageList: string[] = [];
  while (rdcontinue !== void 0) {
    const res = await api.post({
      action: 'query',
      prop: 'redirects',
      titles: pagename,
      rdlimit: 'max',
      rdcontinue,
    }) as ApiQueryResponse;
    pageList.push(...(Object.values(res.query.pages)[0].redirects || []).map(({ title }) => title));
    rdcontinue = res.continue?.rdcontinue;
  }
  return pageList;
};

export default redirectList;
