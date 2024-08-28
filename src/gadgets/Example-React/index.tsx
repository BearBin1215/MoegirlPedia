/**
 * @description 使用React开发小工具示例
 */
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('bodyContent')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
