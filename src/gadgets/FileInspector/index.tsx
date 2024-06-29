/**
 * @description 查询指定用户名的图站贡献，并且自动挂删无任何主站使用的图片或者是只在用户页中使用的图片
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import FileInspectorForm from './FileInspectorForm';

$(() => {
  const USERNAME = mw.config.get('wgRelevantUserName');
  if (
    !USERNAME ||
    !['Listfiles', 'Contributions'].includes(mw.config.get('wgCanonicalSpecialPageName') as string)
  ) {
    return;
  }
  const rootNode = document.createDocumentFragment();
  createRoot(rootNode).render(<FileInspectorForm username={USERNAME} />);
  document.querySelector('#mw-content-text>.mw-contributions-form, #mw-listfiles-form')!.after(rootNode);
});
