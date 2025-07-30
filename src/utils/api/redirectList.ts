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
    const body: Record<string, any> = {
      action: 'query',
      prop: 'redirects',
      titles: pagename,
      rdlimit: 'max',
    };
    if (rdcontinue) {
      body.rdcontinue = rdcontinue;
    }
    const res = await api.post(body) as ApiQueryResponse;
    pageList.push(...(Object.values(res.query.pages)[0].redirects || []).map(({ title }) => title));
    rdcontinue = res.continue?.rdcontinue;
  }
  return pageList;
};

export default redirectList;
