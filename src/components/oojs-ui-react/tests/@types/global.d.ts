declare module "*.less" {
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

