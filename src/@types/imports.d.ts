declare module "*.module.css" {
  const value: Record<string, string>;
  export default value;
}

declare module "*.css" {
  const value: string;
  export default value;
}

/** 以CSS Module导入 */
declare module "*.module.less" {
  const value: Record<string, string>;
  export default value;
}

/** 以string导入 */
declare module "*.inline.less" {
  const value: string;
  export default value;
}

/** 以string导入 */
declare module "*.inline.svg" {
  const value: string;
  export default value;
}

/** 通过svgr导入 */
declare module '*.svg' {
  import React from "react";
  const SVG: React.VFC<React.SVGProps<SVGSVGElement>>;
  export default SVG;
}

declare module "*.html" {
  const value: string;
  export default value;
}
