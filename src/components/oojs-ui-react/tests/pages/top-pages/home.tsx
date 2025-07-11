import React, { type FC } from 'react';
import Link from '../../components/Link';

const Home: FC = () => {
  return (
    <>
      <h1>oojs-ui-react UI组件库测试用工程</h1>

      <p>
        本组件库基于
        <Link href='https://reactjs.org/'>React</Link>
        对
        <Link href='https://www.npmjs.com/package/oojs-ui'>oojs-ui</Link>
        进行重新实现，旨在使用react编写萌百小工具（gadgets）时有组件库可用。
      </p>
      <p>由于目前完成度较低<del>且有许多不符合最佳实践的操作</del>，暂不推送npm，后续闲下来水瓶高点再搞。</p>

      <h2>特性</h2>
      <ul>
        <li>
          在MediaWiki站点中使用时无需额外引入样式表。使用
          <Link href='https://preactjs.com/guide/v10/switching-to-preact'>Preact兼容层</Link>
          替代React、利用构建工具合理优化后输出文件大小为22KB+。
        </li>
        <li>可按需引入，在webpack/vite等构建工具中构建时支持Tree Shaking，用多少打包多少。</li>
        <li>使用<Link href='https://www.typescriptlang.org/'>TypeScript</Link>编写，支持类型检查及提示。</li>
        <li>除了组件自己的参数，支持完整HTMLAttributes（id、style、title等）。</li>
      </ul>

      <h2>相关链接</h2>
      <ul>
        <li>
          <Link href='https://doc.wikimedia.org/oojs-ui/master/js/'>oojs-ui 官方文档</Link>
        </li>
        <li>
          <Link href='https://doc.wikimedia.org/oojs-ui/master/demos/'>oojs-ui 官方Demo</Link>
        </li>
        <li>
          <Link href='https://www.npmjs.com/package/oojs-ui'>oojs-ui - npm</Link>
        </li>
      </ul>
    </>
  );
};

Home.displayName = 'Home';

export default Home;
