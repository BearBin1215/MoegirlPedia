import React, { useState, type FC, type Key } from 'react';
import { BookletLayout, Dropdown, type ChangeHandler } from 'oojs-ui-react';
import router from '../config/router';
import { LanguageContext, languages, type Languages } from '../components/intl';
import LazyComponent from './LazyComponent';
import './index.less';

const topPages = ['Overview', 'Start'];

const App: FC = () => {
  const [activeKey, setActiveKey] = useState<Key>('Overview');
  const [language, setLanguage] = useState<Languages>('zh-cn');

  const handlePageChange: ChangeHandler<Key> = ({ value }) => {
    setActiveKey(value);
  };

  return (
    <div className='oojs-ui-react'>
      <div className='oojs-ui-react-header'>
        <div className='oojs-ui-react-header-left'>
          <div className='oojs-ui-react-title'>
            oojs-ui-react
          </div>
        </div>
        <div className='oojs-ui-react-header-right'>
          <div className='oojs-ui-react-title'>
            <Dropdown
              options={Object.entries(languages).map(([lang, langText]) => ({
                key: lang,
                data: lang,
                children: langText,
              }))}
              value={language}
              onChange={({ value }) => setLanguage(value)}
            />
          </div>
        </div>
      </div>
      <div className='oojs-ui-react-content'>
        <LanguageContext.Provider value={{ language }}>
          <BookletLayout
            defaultKey='Overview'
            onChange={handlePageChange}
            activeKey={activeKey}
            options={router.map((route) => 'section' in route ? {
              key: route.key,
              label: route.title[language] || route.key,
              disabled: true,
            } : {
              key: route.key,
              label: (
                <span style={{ paddingLeft: topPages.includes(route.key) ? void 0 : '1em' }}>
                  {route.title[language] || route.key}
                </span>
              ),
              // 适配懒加载
              children: activeKey === route.key && <LazyComponent route={route} />,
            })}
          />
        </LanguageContext.Provider>
      </div>
    </div>
  );
};

App.displayName = 'App';

export default App;
