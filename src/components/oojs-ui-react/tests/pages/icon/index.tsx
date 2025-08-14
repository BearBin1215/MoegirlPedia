import React, { Fragment, type FC } from 'react';
import { Icon, Indicator } from 'oojs-ui-react';
import intl from '../../components/intl';
import { iconList, indicatorList } from './icon-list';
import './index.less';

const IconPage: FC = () => {
  /** 复制React代码 */
  const copyIconCode = (code: string) => {
    navigator.clipboard.writeText(`<Icon icon="${code}" />`);
  };

  const copyIndicatorCode = (indicator: string) => {
    navigator.clipboard.writeText(`<Indicator indicator="${indicator}" />`);
  };

  return (
    <>
      <h1>
        {intl({
          'zh-cn': 'Icon/Indicator - 图标',
          en: 'Icon/Indicator',
        })}
      </h1>
      <ul>
        <li>
          {intl({
            'zh-cn': '加载对应的CSS后可以使用，需要自定义可以自己添加CSS。',
            en: 'Import the corresponding CSS to use. And you can add CSS yourself if you need to customize.',
          })}
        </li>
        <li>
          {intl({
            'zh-cn': '点击本页图标可复制React代码。',
            en: 'Click on the icon to copy the React code.',
          })}
        </li>
      </ul>
      {iconList.map(({ title, icons }) => (
        <Fragment key={title}>
          <h3>{title}</h3>
          <section className='icon-section'>
            {icons.map((icon) => (
              <div
                key={icon}
                className='icon-item'
                onClick={() => copyIconCode(icon)}
              >
                <Icon className='icon-icon' icon={icon} title={icon} />
                <span className='icon-code'>{icon}</span>
              </div>
            ))}
          </section>
        </Fragment>
      ))}
      <h3>Indicators</h3>
      <section className='icon-section'>
        {indicatorList.map((indicator) => (
          <div
            key={indicator}
            className='icon-item'
            onClick={() => copyIndicatorCode(indicator)}
          >
            <Indicator indicator={indicator} title={indicator} />
            <span className='icon-code'>{indicator}</span>
          </div>
        ))}
      </section>
    </>
  );
};

IconPage.displayName = 'IconPage';

export default IconPage;
