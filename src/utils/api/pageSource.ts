import type { ApiQueryResponse, QueryPage } from 'types-mediawiki-response';

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
    formatversion: '2',
    titles: title,
    rvprop: 'content',
    rvslots: 'main',
    ...params,
  }) as ApiQueryResponse;
  const [pageData] = (res.query.pages ?? []) as QueryPage<'revisions'>[];
  if (!pageData) {
    return;
  }
  if (pageData.missing) {
    throw ('missingtitle');
  }
  return pageData.revisions?.[0]?.slots?.main?.content;
};

export default pageSource;
