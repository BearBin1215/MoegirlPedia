import React, { useEffect, useMemo, useState } from 'react';
import { Layout, Menu, Select, Spin } from 'antd';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router';
import {
  applyThemeCss,
  DEFAULT_THEME,
  setOOTheme,
  type OOUITheme,
} from './components/ooui';
import { compareRoutes, firstRoutePath, routeGroups } from './routes';
import './App.css';

const themeOptions = [
  { value: DEFAULT_THEME, label: 'wikimediaui 主题' },
  { value: 'apex', label: 'apex 主题' },
];

/** 侧栏菜单：按组件族分组展示全部对照页 */
function SiderMenu() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const items = useMemo(() => routeGroups.map((group) => ({
    key: group,
    type: 'group' as const,
    label: group,
    children: compareRoutes
      .filter((route) => route.group === group)
      .map((route) => ({
        key: `/${route.path}`,
        label: route.title,
      })),
  })), []);

  return (
    <Layout.Sider width={220} theme='light' className='playground-sider'>
      <Menu
        mode='inline'
        items={items}
        selectedKeys={[pathname]}
        onClick={({ key }) => navigate(key)}
      />
    </Layout.Sider>
  );
}

function App() {
  const [theme, setTheme] = useState<OOUITheme>(DEFAULT_THEME);

  useEffect(() => {
    applyThemeCss(DEFAULT_THEME);
  }, []);

  // 先切原版主题JS与样式表，再借key remount内容区，使已挂载的原版控件以新主题重建
  const switchTheme = (next: OOUITheme) => {
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
    <BrowserRouter>
      <Layout className='playground'>
        <Layout.Header className='playground-header'>
          <div className='playground-title'>oojs-ui-react</div>
          <Select
            options={themeOptions}
            value={theme}
            onChange={switchTheme}
            style={{ width: 180 }}
          />
        </Layout.Header>
        <Layout>
          <SiderMenu />
          {/* key随主题变化：切换主题后整块remount，对照页两侧控件均以新主题重建 */}
          <Layout.Content key={theme} className='playground-content'>
            <React.Suspense fallback={<div className='playground-loading'><Spin /></div>}>
              <Routes>
                {compareRoutes.map(({ path, Component }) => (
                  <Route key={path} path={path} element={<Component />} />
                ))}
                <Route path='*' element={<Navigate to={firstRoutePath} replace />} />
              </Routes>
            </React.Suspense>
          </Layout.Content>
        </Layout>
      </Layout>
    </BrowserRouter>
  );
}

App.displayName = 'App';

export default App;
