import React, { useEffect, useRef, useState, type RefObject } from 'react';

/** 读数刷新间隔（ms）：动态ARIA由各方写入DOM，轮询足以跟上人工比对节奏 */
const POLL_INTERVAL = 200;

/** 目标尚未就绪（原版脚本未注入、或浮层尚未创建）时的占位 */
const NOT_READY = '（目标未就绪）';

/** 目标就绪但属性未输出时的占位 */
const NO_VALUE = '—';

export interface AriaProbeProps {
  /** 读数行标签（标明被观测元素） */
  label: string;

  /**
   * 观测目标。React侧传ref；原版侧节点经jQuery创建、就绪时机不定，
   * 传按次取值的函数（返回null表示尚未就绪）
   */
  target: RefObject<HTMLElement | null> | (() => HTMLElement | null);

  /** 待读取的属性名 */
  attrs: string[];
}

/**
 * ARIA属性实时读数：把目标元素的指定属性取值摊到页面上，供两侧对照。
 * 菜单展开态与键盘高亮产生的`aria-expanded`/`aria-activedescendant`/`aria-owns`
 * 均为动态属性，且可能由非React侧（原版oojs-ui）写入，逐项查DOM不便，故集中读数
 */
export function AriaProbe({ label, target, attrs }: AriaProbeProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  // 目标与属性经ref读取：轮询只随挂载建立一次，不因每次渲染的新函数/新数组重挂
  const targetRef = useRef(target);
  targetRef.current = target;
  const attrsRef = useRef(attrs);
  attrsRef.current = attrs;

  useEffect(() => {
    const read = () => {
      const owner = targetRef.current;
      const el = typeof owner === 'function' ? owner() : owner.current;
      const next: Record<string, string> = {};
      for (const attr of attrsRef.current) {
        // 区分"目标还没建出来"与"目标上确实没有该属性"：后者才是要核对的结论
        next[attr] = el ? el.getAttribute(attr) ?? NO_VALUE : NOT_READY;
      }
      setValues((prev) => {
        // 取值全同则复用旧对象：轮询每轮都在跑，不比较会固定每200ms触发一次渲染
        const unchanged = attrsRef.current.every((attr) => prev[attr] === next[attr]);
        return unchanged ? prev : next;
      });
    };
    read();
    const timer = window.setInterval(read, POLL_INTERVAL);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className='aria-probe'>
      <div>{label}</div>
      {attrs.map((attr) => (
        <div key={attr}>
          {attr}
          =
          {values[attr] ?? NOT_READY}
        </div>
      ))}
    </div>
  );
}

AriaProbe.displayName = 'AriaProbe';

/**
 * 取触发控件所声明拥有的菜单面板：从owner的`aria-owns`取id再按id定位。
 * 比按"浮层在哪一侧"筛选精确到实例——同一对照页可能有多个同类控件，
 * 而`aria-owns`是触发控件与它自己菜单之间的关联
 * @param owner 持有焦点的触发控件（Dropdown的handle、ComboBox的input）
 */
export function findOwnedMenu(owner: HTMLElement | null | undefined): HTMLElement | null {
  const id = owner?.getAttribute('aria-owns');
  return id ? document.getElementById(id) : null;
}
