import stretchStyle from './stretchStyle.less' assert { type: 'string' };
import markupIcon from './markup.svg' assert { type: 'xml' };

if (mw.config.get('skin') === 'moeskin') {
  $('main.moe-flexible-container').css('transition', 'width .24s ease');
  console.log(stretchStyle);
  const $stretchStyle = $(`<style>${stretchStyle}</style>`);
  const $stretchButton = ($('#moe-sidenav-toggle-btn') as JQuery<HTMLAnchorElement>)
    .clone()
    .attr('id', 'bearbin-moe-stretch')
    .removeAttr('href');
  if (localStorage.getItem('moeStretch') === null) {
    localStorage.setItem('moeStretch', '0');
  }
  if (localStorage.getItem('moeStretch') === '1') {
    $(document.head).append($stretchStyle);
  }
  $stretchButton.on('click', () => {
    if (localStorage.getItem('moeStretch') === '0') {
      $(document.head).append($stretchStyle);
      localStorage.setItem('moeStretch', '1');
    } else {
      $stretchStyle.remove();
      localStorage.setItem('moeStretch', '0');
    }
  });
  $stretchButton.children('.xicon').html(markupIcon);
  $stretchButton.children('.tooltip').text('清空边距');
  $('.btn-group.tools-extra').prepend($stretchButton);
}
