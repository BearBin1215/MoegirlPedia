/**
 * SheetJS 的 ESM 构建类型声明
 * 该库通过运行时动态 import 加载（见同目录`index.ts`），不参与打包，
 * 因此卸载依赖后不会自带类型，需在此手动声明。
 * 仅声明当前用到的 API，新增用法时同步补充；升级版本时需同步修改模块名中的版本号。
 */
declare module 'https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs' {
  /** 工作表 */
  interface WorkSheet {
    [cell: string]: unknown;
  }

  /** 工作簿 */
  interface WorkBook {
    /** 工作表名列表 */
    SheetNames: string[];

    /** 工作表名到工作表的映射 */
    Sheets: Record<string, WorkSheet>;
  }

  const utils: {
    /** 将HTML`<table>`元素转换为工作簿 */
    table_to_book: (table: HTMLTableElement) => WorkBook;
  };

  /** 将工作簿写出为文件并触发下载 */
  function writeFile(workbook: WorkBook, filename: string): void;
}
