/**
 * @description 使用React开发小工具实例
 */

import React from 'react';
import { createRoot } from 'react-dom/client';

const App = () => {
  return (
    <div>Hello, React!</div>
  );
};

createRoot(document.getElementById('bodyContent')!).render(<App />);
