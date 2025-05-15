import styles from './index.less' assert { type: 'string '};

/** 在页面标题尾部增加按钮 */
const addHeaderButton = ({
  text = '',
}) => {
  // 添加样式
  if (!document.getElementById('bearbintool-headerbutton-style')) {
    $(document.head).append(`<style id="bearbintool-headerbutton-style">${styles}</style>`);
  }

  /** 标题按钮区域 */
  let $buttonZone = $('.bearbintool-headerbutton-wrapper');
  // 目前没有区域则新建区域
  if ($('.bearbintool-headerbutton-wrapper').length < 1) {
    $buttonZone = $('<div class="bearbintool-headerbutton-wrapper"></div>');
    $('#firstHeading').append($buttonZone);
  }

  const $button = $(`<button class="bearbintool-headerbutton">${text}</button>`) as JQuery<HTMLButtonElement>;
  $buttonZone.append($button);

  return $button;
};

export default addHeaderButton;
