document.querySelectorAll(".diff-contentalign-left tr:not(.diff-title) div").forEach((ele) => {
    ele.innerHTML = ele.innerHTML.replace(/\[\[( *)([^{}[\]<>]+)( *)(\|[^{}[\]]+)?\]\]/g, '[[<a href="/$2" style="color:#042F76">$1$2</a>$3$4]]');
});