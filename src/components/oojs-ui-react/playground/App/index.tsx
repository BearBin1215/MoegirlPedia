import React, { useEffect, useState } from 'react';
import { BookletLayout, Dropdown, type ChangeHandler } from 'oojs-ui-react';
import router from '../config/router';
import { LanguageContext, languages, type Languages } from '../components/intl';
import { applyThemeCss, setOOTheme, type OOUITheme } from '../components/ooui';
import LazyComponent from './LazyComponent';
import './index.css';

const topPages = ['Overview', 'Start'];

/** 默认主题：选项列表、state初值与首帧applyThemeCss共用同一来源 */
const DEFAULT_THEME: OOUITheme = 'wikimediaui';

const themeOptions = [
  { value: DEFAULT_THEME, children: 'wikimediaui 主题' },
  { value: 'apex', children: 'apex 主题' },
];

function App() {
  const [activeKey, setActiveKey] = useState('Overview');
  const [language, setLanguage] = useState<Languages>('zh-cn');
  const [theme, setTheme] = useState<OOUITheme>(DEFAULT_THEME);

  const handlePageChange: ChangeHandler<string | number> = (value) => {
    setActiveKey(value as string);
  };

  useEffect(() => {
    applyThemeCss(DEFAULT_THEME);
  }, []);

  // 先切原版主题JS与样式表，再借key remount内容区，使已挂载的原版控件以新主题重建
  const handleThemeChange: ChangeHandler<string | number> = (value) => {
    const next = value as OOUITheme;
    setOOTheme(next)
      .then(() => {
        applyThemeCss(next);
        setTheme(next);
      })
      .catch((error) => {
        console.error('主题切换失败', error);
      });
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
              options={themeOptions}
              value={theme}
              onChange={handleThemeChange}
            />
          </div>
          <div className='oojs-ui-react-title'>
            <Dropdown
              options={Object.entries(languages).map(([lang, langText]) => ({
                value: lang,
                children: langText,
              }))}
              value={language}
              onChange={(value) => setLanguage(value as Languages)}
            />
          </div>
        </div>
      </div>
      {/* key随主题变化：切换主题后整块remount，对照页两侧控件均以新主题重建 */}
      <div className='oojs-ui-react-content' key={theme}>
        <LanguageContext.Provider value={{ language }}>
          <BookletLayout
            outlined
            value={activeKey}
            onChange={handlePageChange}
            options={router.map((route) => 'section' in route ? {
              value: route.key,
              label: route.title[language] || route.key,
              disabled: true,
            } : {
              value: route.key,
              label: (
                <span style={{ paddingLeft: topPages.includes(route.key) ? void 0 : '1em' }}>
                  {route.title[language] || route.key}
                </span>
              ),
              // 仅渲染当前激活页，配合LazyComponent懒加载
              children: activeKey === route.key && <LazyComponent route={route} />,
            })}
          />
        </LanguageContext.Provider>
      </div>
    </div>
  );
}

App.displayName = 'App';

export default App;
