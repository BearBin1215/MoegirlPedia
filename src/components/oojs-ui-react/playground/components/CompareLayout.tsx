import React, { type ReactNode } from 'react';
import './CompareLayout.css';

type CompareLayoutProps = {
  /** 页面主标题 */
  title: string;
  /** 对照点说明 */
  description?: ReactNode;
  /** 页面内容（一个或多个CompareColumns区块） */
  children: ReactNode;
};

type CompareColumnsProps = {
  /** 原版oojs-ui侧内容 */
  original: ReactNode;
  /** oojs-ui-react侧内容 */
  children: ReactNode;
};

/** 对照页骨架：主标题与对照点说明，内容为一个或多个对照区块 */
function CompareLayout({ title, description, children }: CompareLayoutProps) {
  return (
    <div>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
      {children}
    </div>
  );
}

/**
 * 左右并排对照区块：左侧原版oojs-ui、右侧本组件库实现。
 * 全部对照页共用，保证两侧标题与列宽一致。
 */
function CompareColumns({ original, children }: CompareColumnsProps) {
  return (
    <div className='compare-columns'>
      <section className='compare-pane'>
        <h2>原版oojs-ui</h2>
        {original}
      </section>
      <section className='compare-pane'>
        <h2>oojs-ui-react</h2>
        {children}
      </section>
    </div>
  );
}

CompareLayout.displayName = 'CompareLayout';
CompareColumns.displayName = 'CompareColumns';

export { CompareColumns, CompareLayout };
