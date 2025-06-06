import React, { type FC } from 'react';

const Home: FC = () => {
  return (
    <>
      <h1>
        oojs-ui-react UI组件库测试用工程
      </h1>
      <p>
        本组件库基于
        <a href='https://reactjs.org/' target='_blank'>
          React
        </a>
        对
        <a href='https://www.npmjs.com/package/oojs-ui' target='_blank'>oojs-ui</a>
        进行重新实现，旨在使用react编写萌百小工具（gadgets）时有组件库可用。
      </p>
      <p>
        由于目前完成度较低<del>且有许多不符合最佳实践的操作</del>，暂不推送npm，后续闲下来水瓶高点再搞。
      </p>
      <h2>特性</h2>
      <ul>
        <li>
          在MediaWiki站点中使用时无需额外引入样式表，使用
          <a href='https://preactjs.com/guide/v10/switching-to-preact'>Preact兼容层</a>
          替代React、利用构建工具合理优化后输出文件大小为22KB+。
        </li>
        <li>
          可按需引入，在webpack等构建工具中构建时支持Tree Shaking。
        </li>
        <li>
          使用<a href='https://www.typescriptlang.org/' target='_blank'>TypeScript</a>编写，支持类型检查及提示
        </li>
      </ul>
      <h2>相关链接</h2>
      <ul>
        <li>
          <a
            href='https://doc.wikimedia.org/oojs-ui/master/js/'
            target='_blank'
          >
            oojs-ui 官方文档
          </a>
        </li>
        <li>
          <a
            href='https://doc.wikimedia.org/oojs-ui/master/demos/'
            target='_blank'
          >
            oojs-ui 官方Demo
          </a>
        </li>
        <li>
          <a
            href='https://www.npmjs.com/package/oojs-ui'
            target='_blank'
          >
            oojs-ui - npm
          </a>
        </li>
      </ul>
    </>
  );
};

Home.displayName = 'Home';

export default Home;
