import { defineQuery } from 'types-mediawiki-params/define';
import type { ApiQueryResponse } from 'types-mediawiki-response';

/**
 * 获取链接到指定页面的列表
 * @param pagename 页面名
 * @param lhnamespace 命名空间
 * @returns 页面列表
 */
const linkList = async (pagename: string, lhnamespace?: number[]): Promise<string[]> => {
  const api = new mw.Api();
  let lhcontinue: string | undefined = undefined;
  const pageList: string[] = [];
  do {
    const res = await api.post(defineQuery({
      action: 'query',
      prop: 'linkshere',
      titles: pagename,
      lhlimit: 'max',
      ...(lhnamespace ? { lhnamespace } : {}),
      ...(lhcontinue ? { lhcontinue } : {}),
    })) as ApiQueryResponse;
    pageList.push(...(Object.values(res.query.pages ?? [])[0]?.linkshere ?? []).map(({ title }) => title!));
    lhcontinue = res.continue?.lhcontinue;
  } while (lhcontinue);
  return pageList;
};

export default linkList;
