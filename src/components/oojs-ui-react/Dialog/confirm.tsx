import React from 'react';
import { createRoot } from 'react-dom/client';
import MessageDialog from './MessageDialog';
import type { ReactNode } from 'react';

interface ConfirmProps {
  title: ReactNode;
  content: ReactNode;
}

const ConfirmDialog = () => {

};

const confirm: (props: ConfirmProps) => Promise<boolean> = ({
  title,
  content,
}) => new Promise((resolve) => {
  const root = createRoot(document.createDocumentFragment());
});

export default confirm;
