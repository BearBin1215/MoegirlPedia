const compare = async (fromtext, totext) => {
  const api = new mw.Api();
  const res = await api.post({
    action: 'compare',
    fromtext,
    totext,
    topst: true,
    fromtitle: 'PAGENAME',
  });
  return `<table class="diff diff-contentalign-left"><colgroup><col class="diff-marker"><col class="diff-content"><col class="diff-marker"><col class="diff-content"></colgroup><tbody>${res.compare['*']}</tbody></table>`;
};

export default compare;
