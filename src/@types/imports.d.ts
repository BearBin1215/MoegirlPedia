declare module "*.css" {
  const value: string;
  export default value;
}

/** 以CSS Module导入 */
declare module "*.module.less" {
  const value: Record<string, string>;
  export default value;
}

declare module "*.less" {
  const value: string;
  export default value;
}

declare module "*.svg" {
  const value: string;
  export default value;
}

declare module "*.html" {
  const value: string;
  export default value;
}
