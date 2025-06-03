import type { ApiQueryResponse } from '@/@types/api';

/**
 * 获取页面源代码
 * @param title 页面标题
 * @returns 页面源代码
 */
const pageSource = async (title: string, params?: Record<string, any>): Promise<string | undefined> => {
  const api = new mw.Api();
  const res = await api.post({
    action: 'query',
    prop: 'revisions',
    titles: title,
    rvprop: 'content',
    ...params,
  }) as ApiQueryResponse;
  const [pageData] = Object.values(res.query.pages);
  if ('revisions' in pageData) {
    return pageData.revisions?.[0]['*'];
  }
  if ('missing' in pageData) {
    throw ('missingtitle');
  }
};

export default pageSource;
