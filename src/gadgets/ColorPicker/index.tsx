import React, { useState, type FC } from 'react';
import { createPortal } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { SketchPicker, type ColorResult } from 'react-color';
import { Button } from 'oojs-ui-react';
import { copyText } from '@/utils/clipboard';
import './index.less';

interface ColorPickerProps {
  open: boolean;
}

const PickerModal: FC<ColorPickerProps> = (props) => {
  const [displayPicker, setDisplayPicker] = useState(props.open);
  const [color, setColor] = useState('#222');

  const handleChange = (colorResult: ColorResult) => {
    setColor(colorResult.hex);
  };

  const handleClose = () => {
    setDisplayPicker(false);
  };

  const handleCopy = () => {
    copyText(color);
  };

  return createPortal(
    displayPicker ? (
      <div id='color-picker'>
        <SketchPicker color={color} onChange={handleChange} />
        <div className='button-zone'>
          <Button onClick={handleCopy}>复制</Button>
          <Button flags='destructive' onClick={handleClose}>
            关闭
          </Button>
        </div>
      </div>
    ) : null,
    document.body,
  );
};

mw.loader.using('mediawiki.util').then(() => {
  mw.util.addPortletLink('p-tb', 'javascript:void(0)', '颜色选择器', 't-colorpicker')!
    .addEventListener('click', () => {
      if (!document.getElementById('color-picker')) {
        createRoot(document.createDocumentFragment()).render(<PickerModal open />);
      }
    });
});
