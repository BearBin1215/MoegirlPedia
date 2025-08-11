import React, { type FC } from 'react';
import intl from '../../components/intl';

const Start: FC = () => {
  return (
    <>
      <h1>
        {intl({
          'zh-cn': '使用',
          en: 'Start',
        })}
      </h1>
      <del>等什么时候这个组件库写好了然后有其他人用了再来写这页吧</del>
      <h2>
        {intl({
          'zh-cn': '在MediaWiki站点中使用',
          en: 'In MediaWiki sites',
        })}
      </h2>

      <h2>
        {intl({
          'zh-cn': (
            <>
              在其他场景使用
              <del style={{ fontSize: '60%', fontWeight: 'normal' }}>笑死根本没人用</del>
            </>
          ),
          en: 'Normal usage',
        })}
      </h2>

      <h2>
        {intl({
          'zh-cn': '注意事项',
          en: 'Attention',
        })}
      </h2>
      <ul>
        <li>
          {intl({
            'zh-cn': '为了减少打包体积，组件基本没有针对参数输入进行错误处理。因此在使用过程中建议使用typescript进行类型校验，或注意编辑器的类型提示。',
            en: 'To reduce the size of the bundle, most components do not perform error handling for parameter input. Therefore, it is recommended to use typescript for type verification when using the component, or pay attention to the type hints of your editor.',
          })}
        </li>
      </ul>
    </>
  );
};

Start.displayName = 'Start';

export default Start;
