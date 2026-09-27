import React, { useEffect, useMemo, useState } from 'react';
import { ConfigProvider, Layout, Menu, Select, Spin, Switch } from 'antd';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router';
import { OOUIProvider, zhHans } from 'oojs-ui-react';
import {
  applyThemeCss,
  DEFAULT_DIR,
  DEFAULT_THEME,
  setOOTheme,
  type OOUIDirection,
  type OOUITheme,
} from './components/ooui';
import { compareRoutes, firstRoutePath, routeGroups } from './routes';
import './App.css';

type PlaygroundLocale = 'en' | 'zh-hans';

const localeOptions: Array<{ value: PlaygroundLocale; label: string }> = [
  { value: 'en', label: 'English' },
  { value: 'zh-hans', label: '简体中文' },
];

const themeOptions = [
  { value: DEFAULT_THEME, label: 'wikimediaui 主题' },
  { value: 'apex', label: 'apex 主题' },
];

const dirOptions: Array<{ value: OOUIDirection; label: string }> = [
  { value: 'ltr', label: 'LTR 方向' },
  { value: 'rtl', label: 'RTL 方向' },
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
  const [locale, setLocale] = useState<PlaygroundLocale>('en');
  // 文本方向开关：切换根元素dir与对应方向的样式表，令两侧控件（含portal浮层）按RTL重排
  const [dir, setDir] = useState<OOUIDirection>(DEFAULT_DIR);
  // 移动端形态开关（OOUIProvider.isMobile）：驱动React侧的移动端分支（DropdownInput原生select、
  // TabSelect居中滚动等）。原版dist的OO.ui.isMobile为恒false的桩，对照页原版侧不受影响
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    document.documentElement.dir = DEFAULT_DIR;
    applyThemeCss(DEFAULT_THEME, DEFAULT_DIR);
  }, []);

  // 先切原版主题JS与样式表，再借key remount内容区，使已挂载的原版控件以新主题重建
  const switchTheme = (next: OOUITheme) => {
    setOOTheme(next)
      .then(() => {
        applyThemeCss(next, dir);
        setTheme(next);
      })
      .catch((error) => {
        console.error('主题切换失败', error);
      });
  };

  // 方向切换：先改根元素dir（普通组件经DOM继承direction，portal浮层经getElementDir按锚点解析），
  // 再换对应方向的样式表；内容区key含dir，令两侧控件整体重建以脱离旧方向上下文
  const switchDir = (next: OOUIDirection) => {
    document.documentElement.dir = next;
    applyThemeCss(theme, next);
    setDir(next);
  };

  return (
    <BrowserRouter>
      {/* antd壳层方向：ConfigProvider.direction令头部/侧栏等antd组件自身也正确镜像 */}
      <ConfigProvider direction={dir}>
        {/* 文案语言经OOUIProvider下发：切换后声明式组件默认文案响应式更新（无需remount），
            对照原版控件恒为英文（dist仅烘焙en），供对比i18n效果。
            方向不传Provider.dir：根元素dir已令浮层经锚点继承方向自动解析，顺带验证该路径 */}
        <OOUIProvider messages={locale === 'zh-hans' ? zhHans : undefined} isMobile={isMobile}>
          <Layout className='playground'>
            <Layout.Header className='playground-header'>
              <div className='playground-title'>oojs-ui-react</div>
              <div className='playground-header-switches'>
                <Select
                  options={localeOptions}
                  value={locale}
                  onChange={setLocale}
                  style={{ width: 130 }}
                />
                <Select
                  options={themeOptions}
                  value={theme}
                  onChange={switchTheme}
                  style={{ width: 180 }}
                />
                <Select
                  options={dirOptions}
                  value={dir}
                  onChange={switchDir}
                  style={{ width: 130 }}
                />
                <span className='playground-header-switch'>
                  <Switch size='small' checked={isMobile} onChange={setIsMobile} />
                  移动端形态
                </span>
              </div>
            </Layout.Header>
            <Layout>
              <SiderMenu />
              {/* key随主题与方向变化：切换后整块remount，对照页两侧控件均以新主题/方向重建 */}
              <Layout.Content key={`${theme}-${dir}`} className='playground-content'>
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
        </OOUIProvider>
      </ConfigProvider>
    </BrowserRouter>
  );
}

App.displayName = 'App';

export default App;
