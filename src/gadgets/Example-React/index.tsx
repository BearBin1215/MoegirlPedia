/**
 * @description 使用React开发小工具示例
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('bodyContent')!).render(<App />);
