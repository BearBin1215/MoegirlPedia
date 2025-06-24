/**
 * @description 使用React开发小工具示例
 *
 * 经过实测，zustand库打包后体积相对较小，可以使用。不建议使用其他太大的库，比如mobx
 */
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('bodyContent')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
