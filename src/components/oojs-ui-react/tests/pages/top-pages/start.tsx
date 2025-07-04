import React, { type FC } from 'react';

const Start: FC = () => {
  return (
    <>
      <h1>使用</h1>
      <del>等什么时候这个组件库写好了然后有其他人用了再来写这页吧</del>
      <h2>在MediaWiki站点中使用</h2>

      <h2>在其他场景使用<del style={{ fontSize: '60%', fontWeight: 'normal' }}>笑死根本没人用</del></h2>

      <h2>注意事项</h2>
      <ul>
        <li>为了减少打包体积，组件基本没有针对参数输入进行错误处理。因此在使用过程中建议使用typescript进行类型校验，或注意编辑器的类型提示。</li>
      </ul>
    </>
  );
};

Start.displayName = 'Start';

export default Start;
