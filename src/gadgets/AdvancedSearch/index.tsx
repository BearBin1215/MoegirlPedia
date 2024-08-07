$(() => {
  $('#searchform').append(
    $('<button id="advanced-search">高级</button>').css({
      border: 0,
      background: 'none',
    }).on('click', (ev) => {
      ev.preventDefault();
    }),
  ).css({
    display: 'flex',
    alignItems: 'baseline',
    marginTop: '0',
  });
});
