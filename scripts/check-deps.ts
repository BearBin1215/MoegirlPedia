/**
 * 依赖声明检查器：校验每个工具源码闭包内用到的 ResourceLoader 模块
 * 是否都已通过 mw.loader.using([...]) 声明，避免"其他工具恰好加载过依赖
 * 导致缺陷被静默忽略"的问题。
 *
 * 依赖的来源（全部通过 AST 提取，不受注释/字符串干扰）：
 * - 全局对象使用：OO.ui.* / mw.Api / wgULS 等，按映射表（MW_PREFIXES / BARE_GLOBALS）
 *   反查 RL 模块，与站内 ext.gadget.* 的对照依据 MoegirlPediaInterfaceCodes 仓库；
 * - import external 包：vue / moment 等在 rspack 中映射为全局，打包后同样要求
 *   模块先就绪；
 * - 模块闭包：从入口递归解析 import（含 @/ 别名、Vue SFC、node_modules 中被打包
 *   的库如 ooui-react——它运行时引用全局 OO）。
 *
 * 已知局限（presence 检查）：
 * - 只校验"模块名出现在闭包内某个 using 数组里"，无法验证运行时该 using 一定
 *   先于使用执行（如 using 写在条件分支内而使用在分支外），需配合约定与 review；
 * - 条件依赖（如 HistoryViewer 通过 moduleRegistry 探测 code-prettify 后才调用
 *   window.prettyPrint）不属于 using 声明范畴，不在检查范围内；
 * - 映射表之外的独立全局名不做推断；mw.* / OO.* 出现未映射前缀会直接报错，
 *   防止"表不全"重新引入静默失效。
 *
 * 如确有无法声明或有意豁免的模块，可在源码任意位置添加注释：
 *   // check-deps-disable: <模块名列表，空格或逗号分隔>
 * 模块名列表缺省时表示豁免本文件全部检查。
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import ts from 'typescript';
import chalk from 'chalk';
import { sync as globSync } from 'glob';
import * as vueSFC from 'vue/compiler-sfc';

/** 仓库根目录（本脚本位于 scripts/ 下） */
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src');

/* ═══════════════ 依赖映射表（核心配置） ═══════════════ */

/** mw.* 下始终可用的子对象（mediawiki.base 随 ResourceLoader 启动加载，无需声明） */
const MW_ALWAYS = new Set(['config', 'loader', 'log', 'hook', 'msg', 'message', 'track', 'now', 'notify']);

/** mw.<前缀> → RL 模块。匹配时优先取更长前缀（user.options 优先于 user）。 */
const MW_PREFIXES: Record<string, string> = {
  Api: 'mediawiki.api',
  ForeignApi: 'mediawiki.ForeignApi',
  util: 'mediawiki.util',
  notification: 'mediawiki.notification',
  Title: 'mediawiki.Title',
  Uri: 'mediawiki.Uri',
  cookie: 'mediawiki.cookie',
  storage: 'mediawiki.storage',
  user: 'mediawiki.user',
  'user.options': 'user.options',
};

/** 独立全局标识符 → RL 模块。ext.gadget.* 的对照依据 MoegirlPediaInterfaceCodes 仓库。 */
const BARE_GLOBALS: Record<string, string> = {
  moment: 'moment',
  Vue: 'vue',
  Pinia: 'pinia',
  Codex: '@wikimedia/codex',
  wgULS: 'ext.gadget.site-lib',
  wgUVS: 'ext.gadget.site-lib',
  wgUXS: 'ext.gadget.site-lib',
  insertToBottomRightCorner: 'ext.gadget.libBottomRightCorner',
  LocalObjectStorage: 'ext.gadget.LocalObjectStorage',
  libCachedCode: 'ext.gadget.libCachedCode',
};

/** import 指定符 → RL 模块（rspack externals：打包后引用全局，同样要求模块先就绪） */
const EXTERNAL_IMPORTS: Record<string, string> = {
  moment: 'moment',
  vue: 'vue',
  pinia: 'pinia',
  '@wikimedia/codex': '@wikimedia/codex',
};

/**
 * 覆盖关系：声明 key 模块即视为同时满足 value 列表（含传递闭包）。
 * 依据 RL 模块自身的 dependencies 与站内 definition.yaml，避免过度误报。
 */
const COVERS: Record<string, string[]> = {
  'oojs-ui': ['oojs', 'oojs-ui-core', 'oojs-ui-widgets', 'oojs-ui-windows'],
  'ext.gadget.site-lib': ['mediawiki.util', 'ext.gadget.libCachedCode'],
  'ext.gadget.libCachedCode': ['ext.gadget.LocalObjectStorage'],
  'ext.gadget.LocalObjectStorage': ['moment'],
};

/** 单个工具闭包内最多扫描的文件数（防御异常循环引用） */
const MAX_FILES = 400;

/* ═══════════════ 类型定义 ═══════════════ */

/** 一次依赖使用的证据 */
interface Usage {
  /** 形如 "src/gadgets/Foo/index.ts:17" 的位置 */
  loc: string;
  /** 使用的代码片段，如 "OO.ui.confirm" */
  snippet: string;
}

/** 单文件的扫描结果 */
interface Extract {
  /** 依赖到的 RL 模块 → 使用证据 */
  required: Map<string, Usage[]>;
  /** using 中声明的模块 → 声明位置 */
  declared: Map<string, string>;
  /** 无法静态解析的 using 调用位置 */
  dynamicUsing: string[];
  /** 未映射的 mw.* / OO.* 前缀 → 位置列表 */
  unknown: Map<string, string[]>;
  /** 无法解析的 import 指定符（不参与依赖推断） */
  unresolvedImports: string[];
  /** 未能解析入口、未扫描的 node_modules 包 */
  pkgWarn: Set<string>;
}

/** 一个可扫描的语法单元（普通文件，或 .vue 的单个 script 块） */
interface Unit {
  /** 磁盘绝对路径（.vue 的多个块共享同一路径） */
  abs: string;
  /** 展示用相对路径，.vue 块带 [script]/[script setup] 标注 */
  display: string;
  sf: ts.SourceFile;
  /** 本文件豁免检查的模块集合；含 '*' 表示全部豁免 */
  disables: Set<string>;
}

interface GadgetReport {
  name: string;
  declared: string[];
  missing: { mod: string; usage: Usage }[];
  unknown: { key: string; loc: string }[];
  dynamicUsing: string[];
  unresolvedImports: string[];
  pkgWarn: string[];
  /** 被豁免注释覆盖、且闭包内确实用到的模块 */
  exempted: string[];
  hasError: boolean;
}

/* ═══════════════ 基础工具函数 ═══════════════ */

/** 无运行时含义的导入后缀，直接跳过解析 */
const SKIP_FILE_RE = /\.(css|scss|sass|less|svg|png|jpe?g|gif|webp|html?|md|txt|json)$/i;
const JS_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'];

function isFile(p: string): boolean {
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
}

/**
 * 解析本地模块指定符为真实文件路径（跟随 realpath 以穿透 pnpm 符号链接）。
 * @param base 不含扩展名的候选路径（可自带扩展名）
 */
function resolveFile(base: string): string | null {
  const candidates = [
    base,
    ...JS_EXTENSIONS.map((ext) => base + ext),
    ...JS_EXTENSIONS.map((ext) => path.join(base, `index${ext}`)),
    `${base}.vue`,
  ];
  for (const candidate of candidates) {
    if (isFile(candidate) && !candidate.endsWith('.d.ts')) {
      try {
        return fs.realpathSync(candidate);
      } catch {
        return candidate;
      }
    }
  }
  return null;
}

/** 拆分包指定符为 [包名, 包内子路径] */
function splitPackageSpec(spec: string): [string, string] {
  const parts = spec.split('/');
  if (spec.startsWith('@')) {return [parts.slice(0, 2).join('/'), parts.slice(2).join('/')];}
  return [parts[0], parts.slice(1).join('/')];
}

/** 从 exports 字段中选取 ESM 入口 */
function pickExport(value: unknown): string | null {
  if (typeof value === 'string') {return value;}
  if (Array.isArray(value)) {return value.length ? pickExport(value[0]) : null;}
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    for (const key of ['import', 'module', 'default', 'require']) {
      if (key in record) {
        const resolved = pickExport(record[key]);
        if (resolved) {return resolved;}
      }
    }
  }
  return null;
}

/**
 * 解析 node_modules 包的入口文件。
 * @param spec 裸包指定符，可含子路径（如 types-mediawiki-params/define）
 */
function resolvePackageEntry(spec: string): string | null {
  const [pkgName, subpath] = splitPackageSpec(spec);
  const root = path.join(ROOT, 'node_modules', pkgName);
  if (!isFile(path.join(root, 'package.json'))) {return null;}
  let real: string;
  try {
    real = fs.realpathSync(root);
  } catch {
    return null;
  }
  if (subpath) {
    const pkgJson = JSON.parse(fs.readFileSync(path.join(real, 'package.json'), 'utf8'));
    const exports = pkgJson.exports as Record<string, unknown> | string | undefined;
    const mapped = exports && typeof exports === 'object' ? exports[`./${subpath}`] : undefined;
    const fromExports = mapped ? pickExport(mapped) : null;
    return (fromExports && resolveFile(path.join(real, fromExports.replace(/^\.\//, ''))))
      ?? resolveFile(path.join(real, subpath));
  }
  const pkgJson = JSON.parse(fs.readFileSync(path.join(real, 'package.json'), 'utf8'));
  const exports = pkgJson.exports;
  let entry: string | null;
  if (exports && typeof exports === 'object' && !Array.isArray(exports) && '.' in exports) {
    entry = pickExport(exports['.']);
  } else if (typeof exports === 'string') {
    entry = exports;
  } else {
    entry = pickExport(exports) ?? pkgJson.module ?? pkgJson.main ?? 'index.js';
  }
  return entry ? resolveFile(path.join(real, String(entry).replace(/^\.\//, ''))) : null;
}

/* ═══════════════ 语法单元构建 ═══════════════ */

/** 解析 check-deps-disable 豁免注释 */
function collectDisables(text: string): Set<string> {
  const disables = new Set<string>();
  const re = /check-deps-disable\b[ \t]*:?([^\n]*?)(?=[\n*]|$)/g;
  for (const match of text.matchAll(re)) {
    const tokens = match[1].trim().split(/[\s,]+/).filter(Boolean);
    if (!tokens.length) {
      disables.add('*');
    } else {
      tokens.forEach((token) => disables.add(token));
    }
  }
  return disables;
}

const unitCache = new Map<string, Unit[]>();

/** 构建一个文件对应的语法单元（缓存；.vue 文件产出 script / script setup 两个单元） */
function getUnits(abs: string): Unit[] {
  const key = abs.toLowerCase();
  const cached = unitCache.get(key);
  if (cached) {return cached;}

  const rel = path.relative(ROOT, abs).replace(/\\/g, '/');
  const source = fs.readFileSync(abs, 'utf8');
  const units: Unit[] = [];

  if (abs.endsWith('.vue')) {
    const { descriptor, errors } = vueSFC.parse(source, { filename: abs });
    const blocks = [
      ['script', descriptor.script],
      ['script setup', descriptor.scriptSetup],
    ] as const;
    for (const [label, block] of blocks) {
      if (!block) {continue;}
      // 用空行把块内容补齐到原文件行号，使 AST 位置与 .vue 文件对齐
      const pad = '\n'.repeat(Math.max(block.loc.start.line - 1, 0));
      const lang = block.lang ?? 'js';
      const kind = lang.includes('tsx') ? ts.ScriptKind.TSX
        : lang.includes('ts') ? ts.ScriptKind.TS
          : ts.ScriptKind.JS;
      units.push({
        abs,
        display: `${rel}[${label}]`,
        sf: ts.createSourceFile(abs, pad + block.content, ts.ScriptTarget.ESNext, true, kind),
        disables: collectDisables(block.content),
      });
    }
    if (errors.length && !units.length) {
      throw new Error(`解析 ${rel} 失败：${errors.map(String).join('；')}`);
    }
  } else {
    const ext = path.extname(abs).toLowerCase();
    const kind = ext === '.ts' ? ts.ScriptKind.TS
      : ext === '.tsx' ? ts.ScriptKind.TSX
        : ext === '.jsx' ? ts.ScriptKind.JSX
          : ts.ScriptKind.JS;
    units.push({
      abs,
      display: rel,
      sf: ts.createSourceFile(abs, source, ts.ScriptTarget.ESNext, true, kind),
      disables: collectDisables(source),
    });
  }

  unitCache.set(key, units);
  return units;
}

/* ═══════════════ AST 扫描 ═══════════════ */

function freshExtract(): Extract {
  return {
    required: new Map(),
    declared: new Map(),
    dynamicUsing: [],
    unknown: new Map(),
    unresolvedImports: [],
    pkgWarn: new Set(),
  };
}

/** 记录一次依赖使用 */
function recordRequired(acc: Extract, mod: string, usage: Usage): void {
  const list = acc.required.get(mod);
  if (list) {list.push(usage);}
  else {acc.required.set(mod, [usage]);}
}

/** 收集文件内局部声明过的名字（遮蔽同名的全局推断） */
function collectShadowed(sf: ts.SourceFile): Set<string> {
  const names = new Set<string>();
  const walk = (node: ts.Node): void => {
    const declaredName = (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) ? node.name : undefined)
      ?? ((ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node)) && node.name)
      ?? (ts.isParameter(node) && ts.isIdentifier(node.name) ? node.name : undefined)
      ?? (ts.isCatchClause(node) && node.variableDeclaration && ts.isIdentifier(node.variableDeclaration.name)
        ? node.variableDeclaration.name
        : undefined);
    if (declaredName) {names.add(declaredName.text);}
    ts.forEachChild(node, walk);
  };
  walk(sf);
  return names;
}

/** 判断标识符是否处于"名字"位置（属性名、声明名等，不构成对全局的引用） */
function isNamePosition(node: ts.Identifier): boolean {
  const parent = node.parent;
  if (!parent) {return false;}
  if (ts.isPropertyAccessExpression(parent)) {return parent.name === node;}
  if (ts.isQualifiedName(parent)) {return parent.right === node || parent.left === node;}
  if (
    ts.isPropertyAssignment(parent) || ts.isPropertySignature(parent) || ts.isMethodSignature(parent)
    || ts.isMethodDeclaration(parent) || ts.isPropertyDeclaration(parent) || ts.isVariableDeclaration(parent)
    || ts.isParameter(parent) || ts.isEnumMember(parent) || ts.isJsxAttribute(parent)
    || ts.isImportSpecifier(parent) || ts.isExportSpecifier(parent) || ts.isFunctionDeclaration(parent)
    || ts.isClassDeclaration(parent) || ts.isInterfaceDeclaration(parent) || ts.isTypeAliasDeclaration(parent)
    || ts.isModuleDeclaration(parent) || ts.isTypeParameterDeclaration(parent)
  ) {
    return (parent as { name?: ts.Identifier }).name === node;
  }
  return false;
}

/** 展开属性访问链，返回根标识符与属性名序列（含字符串字面量的元素访问） */
function flattenChain(node: ts.PropertyAccessExpression): { root: ts.Identifier | null; props: string[] } {
  const props: string[] = [];
  let expr: ts.Expression = node;
  for (;;) {
    if (ts.isPropertyAccessExpression(expr)) {
      props.unshift(expr.name.text);
      expr = expr.expression;
    } else if (ts.isElementAccessExpression(expr) && ts.isStringLiteral(expr.argumentExpression)) {
      props.unshift(expr.argumentExpression.text);
      expr = expr.expression;
    } else {
      break;
    }
  }
  return { root: ts.isIdentifier(expr) ? expr : null, props };
}

interface ScanContext {
  acc: Extract;
  unit: Unit;
  shadowed: Set<string>;
  queue: string[];
}

function getLoc(unit: Unit, node: ts.Node): string {
  const line = unit.sf.getLineAndCharacterOfPosition(node.getStart(unit.sf)).line + 1;
  return `${unit.display}:${line}`;
}

/**
 * 求值一条属性访问链对应的 RL 依赖：
 * window/globalThis 前缀会被剥掉；mw.* 按前缀表匹配（含始终可用白名单）；
 * OO.* 按首属性二分（ui → oojs-ui，其余 → oojs）；其余查独立全局表。
 */
function evalChain(ctx: ScanContext, rootName: string | null, props: string[], node: ts.Node): void {
  const { acc, unit } = ctx;
  let name = rootName;
  let rest = props;
  while ((name === 'window' || name === 'globalThis') && rest.length) {
    name = rest[0];
    rest = rest.slice(1);
  }
  if (!name) {return;}

  const loc = getLoc(unit, node);
  const snippet = [name, ...rest].join('.');

  if (name === 'mw') {
    if (!rest.length) {return;}
    const longKey = `${rest[0]}${rest[1] ? `.${rest[1]}` : ''}`;
    const mod = MW_PREFIXES[longKey] ?? MW_PREFIXES[rest[0]];
    if (mod) {
      recordRequired(acc, mod, { loc, snippet });
    } else if (!MW_ALWAYS.has(rest[0])) {
      const list = acc.unknown.get(`mw.${rest[0]}`) ?? [];
      list.push(loc);
      acc.unknown.set(`mw.${rest[0]}`, list);
    }
  } else if (name === 'OO') {
    if (!rest.length) {return;}
    recordRequired(acc, rest[0] === 'ui' ? 'oojs-ui' : 'oojs', { loc, snippet });
  } else if (BARE_GLOBALS[name]) {
    recordRequired(acc, BARE_GLOBALS[name], { loc, snippet });
  }
}

/** 处理 import / export-from / require / 动态 import 的模块指定符 */
function handleSpecifier(ctx: ScanContext, spec: string, loc: string): void {
  const { acc, unit, queue } = ctx;
  const external = EXTERNAL_IMPORTS[spec];
  if (external) {
    recordRequired(acc, external, { loc, snippet: spec });
    return;
  }
  if (SKIP_FILE_RE.test(spec)) {return;}

  let resolved: string | null = null;
  if (spec.startsWith('@/')) {
    resolved = resolveFile(path.join(SRC, spec.slice(2)));
  } else if (spec.startsWith('.')) {
    resolved = resolveFile(path.resolve(path.dirname(unit.abs), spec));
  } else {
    resolved = resolvePackageEntry(spec);
    if (!resolved) {acc.pkgWarn.add(spec);}
  }
  if (resolved) {queue.push(resolved);}
  else if (!spec.startsWith('@') || spec.startsWith('@/')) {acc.unresolvedImports.push(`${spec}（${loc}）`);}
}

/** 提取 mw.loader.using(...) 的字面量依赖列表 */
function extractUsing(ctx: ScanContext, call: ts.CallExpression): void {
  const { acc, unit } = ctx;
  const loc = getLoc(unit, call);
  const arg = call.arguments[0];
  if (!arg) {
    acc.dynamicUsing.push(loc);
  } else if (ts.isStringLiteral(arg)) {
    acc.declared.set(arg.text, loc);
  } else if (ts.isArrayLiteralExpression(arg)) {
    let dynamic = false;
    for (const element of arg.elements) {
      if (element && ts.isStringLiteral(element)) {acc.declared.set(element.text, loc);}
      else {dynamic = true;}
    }
    if (dynamic) {acc.dynamicUsing.push(loc);}
  } else {
    acc.dynamicUsing.push(loc);
  }
}

/** 单个语法单元的完整扫描 */
function scanUnit(ctx: ScanContext, unit: Unit): void {
  ctx.unit = unit;
  ctx.shadowed = collectShadowed(unit.sf);
  const walk = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node) || (ts.isExportDeclaration(node) && node.moduleSpecifier)) {
      const specifier = node.moduleSpecifier;
      if (specifier && ts.isStringLiteral(specifier)) {
        // 纯类型导入（import type / 全部 specifier 带 type）在编译期被擦除，不计入依赖
        let hasValue = true;
        if (ts.isImportDeclaration(node) && node.importClause) {
          const clause = node.importClause;
          const bindings = clause.namedBindings;
          const hasValueBindings = bindings !== undefined
            && (ts.isNamespaceImport(bindings)
              || (ts.isNamedImports(bindings) && bindings.elements.some((el) => !el.isTypeOnly)));
          hasValue = !clause.isTypeOnly && (clause.name !== undefined || hasValueBindings);
        }
        if (hasValue) {handleSpecifier(ctx, specifier.text, getLoc(unit, node));}
      }
    } else if (ts.isCallExpression(node)) {
      if (node.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(node.expression) && node.expression.text === 'require')) {
        const arg = node.arguments[0];
        if (arg && ts.isStringLiteral(arg)) {handleSpecifier(ctx, arg.text, getLoc(unit, node));}
      } else if (ts.isPropertyAccessExpression(node.expression)) {
        const { root, props } = flattenChain(node.expression);
        if (root && root.text === 'mw' && props.join('.') === 'loader.using') {extractUsing(ctx, node);}
      }
    } else if (ts.isPropertyAccessExpression(node)) {
      if (!(ts.isPropertyAccessExpression(node.parent) && node.parent.expression === node)) {
        const { root, props } = flattenChain(node);
        evalChain(ctx, root?.text ?? null, props, node);
      }
    } else if (ts.isIdentifier(node)) {
      const parent = node.parent;
      const isChainRoot = (ts.isPropertyAccessExpression(parent) || ts.isElementAccessExpression(parent))
        && parent.expression === node;
      if (!isChainRoot && !isNamePosition(node) && !ctx.shadowed.has(node.text) && BARE_GLOBALS[node.text]) {
        recordRequired(ctx.acc, BARE_GLOBALS[node.text], { loc: getLoc(unit, node), snippet: node.text });
      }
    }
    ts.forEachChild(node, walk);
  };
  walk(unit.sf);
}

/* ═══════════════ 闭包收集与分析 ═══════════════ */

/** COVERS 的传递闭包：声明 key 可满足的模块全集 */
function coversOf(mod: string, memo = new Map<string, Set<string>>()): Set<string> {
  const cached = memo.get(mod);
  if (cached) {return cached;}
  const result = new Set<string>();
  memo.set(mod, result);
  for (const covered of COVERS[mod] ?? []) {
    result.add(covered);
    coversOf(covered, memo).forEach((item) => result.add(item));
  }
  return result;
}

/** 从入口出发收集模块闭包并扫描 */
function analyzeEntry(entryAbs: string): { units: Unit[]; acc: Extract } {
  const ctx: ScanContext = { acc: freshExtract(), unit: undefined as never, shadowed: new Set(), queue: [entryAbs] };
  const units: Unit[] = [];
  const visited = new Set<string>();
  while (ctx.queue.length) {
    const abs = ctx.queue.shift()!;
    const key = abs.toLowerCase();
    if (visited.has(key) || visited.size >= MAX_FILES) {continue;}
    visited.add(key);
    const fileUnits = getUnits(abs);
    units.push(...fileUnits);
    fileUnits.forEach((unit) => scanUnit(ctx, unit));
  }
  return { units, acc: ctx.acc };
}

/** 汇总单个工具的检查报告 */
function buildReport(name: string, entryAbs: string): GadgetReport {
  const { units, acc } = analyzeEntry(entryAbs);
  const disables = new Set<string>();
  units.forEach((unit) => unit.disables.forEach((item) => disables.add(item)));
  const disabledAll = disables.has('*');

  const missing: GadgetReport['missing'] = [];
  const exempted: string[] = [];
  for (const [mod, usages] of acc.required) {
    if (disabledAll || disables.has(mod)) {
      exempted.push(mod);
      continue;
    }
    if (acc.declared.has(mod)) {continue;}
    if ([...acc.declared.keys()].some((d) => coversOf(d).has(mod))) {continue;}
    missing.push({ mod, usage: usages[0] });
  }

  const unknown = [...acc.unknown]
    .filter(() => !disabledAll)
    .map(([key, locs]) => ({ key, loc: locs[0] }));

  const declared = [...acc.declared.keys()].sort();
  return {
    name,
    declared,
    missing: missing.sort((a, b) => a.mod.localeCompare(b.mod)),
    unknown,
    dynamicUsing: [...new Set(acc.dynamicUsing)],
    unresolvedImports: [...new Set(acc.unresolvedImports)],
    pkgWarn: [...acc.pkgWarn].sort(),
    exempted: [...new Set(exempted)].sort(),
    hasError: missing.length > 0 || unknown.length > 0,
  };
}

/* ═══════════════ 入口发现与输出 ═══════════════ */

interface Entry {
  name: string;
  abs: string;
}

function discoverEntries(): Entry[] {
  const normalize = (file: string) => file.replace(/\\/g, '/').replace(/^(?:\.\/)?/, './');
  const gadgets = globSync('./src/gadgets/**/index.{js,jsx,ts,tsx}', { nocase: true })
    .map((file) => ({
      name: normalize(file).replace(/^\.\/src\/gadgets\//, '').replace(/\/index\.(js|jsx|ts|tsx)$/i, ''),
      abs: path.resolve(ROOT, file),
    }));
  const oddments = globSync('./src/oddments/*.{js,ts}', { nocase: true })
    .map((file) => ({
      name: path.basename(file).replace(/\.(js|ts)$/i, ''),
      abs: path.resolve(ROOT, file),
    }));
  return [...gadgets, ...oddments].sort((a, b) => a.name.localeCompare(b.name));
}

function printReport(report: GadgetReport): void {
  if (report.hasError) {
    console.log(chalk.redBright(`✗ ${report.name}`));
    for (const { mod, usage } of report.missing) {
      console.log(chalk.red(`    缺少 using 声明：${mod}（首次使用 ${usage.loc} → ${usage.snippet}）`));
    }
    for (const { key, loc } of report.unknown) {
      console.log(chalk.red(`    未映射的 ${key.split('.')[0]}.* 前缀：${key}（${loc}），请补充映射表或核对用法`));
    }
  } else {
    console.log(chalk.green(`✓ ${report.name}`) + chalk.gray(`（声明 ${report.declared.length} 项）`));
  }
  const warnings: string[] = [];
  if (report.dynamicUsing.length) {
    warnings.push(`using 参数含非字面量，无法静态解析（${report.dynamicUsing.join('、')}）`);
  }
  if (report.unresolvedImports.length) {
    warnings.push(`无法解析以下导入，不参与依赖推断：${report.unresolvedImports.join('、')}`);
  }
  if (report.pkgWarn.length) {
    warnings.push(`未能解析包入口，未扫描：${report.pkgWarn.join('、')}`);
  }
  if (report.exempted.length) {
    warnings.push(`经 check-deps-disable 豁免：${report.exempted.join('、')}`);
  }
  if (warnings.length) {
    console.log(chalk.yellow(`  ⚠ ${warnings.join('\n  ⚠ ')}`));
  }
}

/**
 * 执行依赖声明检查并输出报告。
 * @param filters 要检查的工具名列表，缺省时检查全部
 * @returns 是否全部通过
 */
export function runCheck(filters: string[] = []): boolean {
  const start = Date.now();
  let entries = discoverEntries();

  if (filters.length) {
    const matched = new Set(entries.filter((entry) => filters.includes(entry.name)).map((entry) => entry.name));
    const unmatched = filters.filter((filter) => !matched.has(filter));
    if (unmatched.length) {
      console.error(`未找到以下工具的源代码：${unmatched.join('、')}`);
      process.exitCode = 1;
      return false;
    }
    entries = entries.filter((entry) => matched.has(entry.name));
  }

  const reports = entries.map((entry) => buildReport(entry.name, entry.abs));
  reports.forEach(printReport);

  const failed = reports.filter((report) => report.hasError);
  const warned = reports.filter((report) => !report.hasError
    && (report.dynamicUsing.length + report.unresolvedImports.length + report.pkgWarn.length > 0));
  console.log(
    `\n检查完成：${chalk.green(`${reports.length - failed.length} 通过`)}${
      failed.length ? chalk.red(`，${failed.length} 存在问题`) : ''
    }${warned.length ? chalk.yellow(`，${warned.length} 有警告`) : ''
    }${chalk.gray(`，共 ${reports.length} 个工具，用时 ${Date.now() - start}ms`)}`,
  );
  return failed.length === 0;
}

/** 判定本模块是否被直接执行（区别于被 build.ts 导入），是则作为CLI运行 */
const invokedDirectly = process.argv[1] !== undefined
  && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedDirectly) {
  process.exitCode = runCheck(process.argv.slice(2)) ? 0 : 1;
}
