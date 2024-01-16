import React, { Component } from 'react';
import { createPortal } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { SketchPicker } from 'react-color';
import { Button } from '@/components';
import { copyText } from '@/utils/clipboard';
import './index.less';

class PickerModal extends Component {
  state = {
    displayPicker: true,
    color: '#222',
  };

  constructor(props) {
    super(props);
    this.setState({ displayPicker: props.open });
  }

  handleChange = (color) => {
    this.setState({ color: color.hex });
  };

  handleClose = () => {
    this.setState({ displayPicker: false });
  };

  handleCopy = () => {
    copyText(this.state.color);
  };

  render() {
    return (
      <>
        {createPortal(
          this.state.displayPicker ? <div id='color-picker'>
            <SketchPicker
              color={this.state.color}
              onChange={this.handleChange}
            />
            <div className='button-zone'>
              <Button onClick={this.handleCopy}>复制</Button>
              <Button type='danger' onClick={this.handleClose}>关闭</Button>
            </div>
          </div> : null,
          document.body,
        )}
      </>
    );
  }
}

mw.loader.using('mediawiki.util').then(() => {
  mw.util.addPortletLink('p-tb', 'javascript:void(0)', '颜色选择器', 't-colorpicker')
    .addEventListener('click', () => {
      if (!document.getElementById('color-picker')) {
        createRoot(document.createElement('div')).render(<PickerModal open />);
      }
    });
});