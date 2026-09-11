declare module "*.css" {
  const value: string;
  export default value;
}

// 原版oojs-ui/jquery的dist脚本经rspack asset/resource规则以URL形式引入（对照测试用）
declare module "jquery/dist/jquery.js" {
  const url: string;
  export default url;
}

declare module "oojs/dist/oojs.js" {
  const url: string;
  export default url;
}

declare module "oojs-ui/dist/oojs-ui.js" {
  const url: string;
  export default url;
}

declare module "oojs-ui/dist/oojs-ui-wikimediaui.js" {
  const url: string;
  export default url;
}

declare module "oojs-ui/dist/oojs-ui-apex.js" {
  const url: string;
  export default url;
}


// rspack/webpack的require.context（主题图标资源批量注册用）。
// 全局require的类型为NodeJS.Require（@types/node），经接口扩展补充context，
// 避免对require做命名空间合并（其合并行为不在TS官方保证范围）
declare namespace NodeJS {
  interface Require {
    context(
      path: string,
      deep?: boolean,
      filter?: RegExp,
    ): {
      keys(): string[];
      (id: string): string;
    };
  }
}
