import type { XmlElement } from 'jstoxml';

interface NSinfo {
  id: number;
  'case': string;
  subpages?: string;
  canonical?: string;
  "*": string;
}

/** 读取站点信息并保存为XML所需的数据对象 */
const generateBaseinfo = async () => {
  const api = new mw.Api();
  const {
    query: {
      general: {
        sitename,
        dbname,
        base,
        generator,
        'case': sitecase, // 保留字
        lang,
      },
      namespaces,
    },
  } = await api.post({
    action: 'query',
    meta: 'siteinfo',
    siprop: ['general', 'namespaces'],
  });

  return {
    _name: 'mediawiki',
    _attrs: {
      xmlns: 'http://www.mediawiki.org/xml/export-0.11/',
      'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
      'xsi:schemaLocation': 'http://www.mediawiki.org/xml/export-0.11/ http://www.mediawiki.org/xml/export-0.11.xsd',
      version: '0.11',
      'xml:lang': lang,
    },
    _content: [
      {
        siteinfo: {
          sitename,
          dbname: dbname || 'medaiwiki',
          base,
          generator,
          'case': sitecase,
          namespaces: Object.entries(namespaces as Record<string, NSinfo>).map(([nsid, {
            'case': nscase,
            "*": nsname,
          }]) => ({
            _name: 'namespace',
            _attrs: {
              key: nsid,
              'case': nscase,
            },
            _content: nsname,
          })),
        },
      },
    ] as XmlElement[],
  };
};

export default generateBaseinfo;
