$(".autocomment").each((_, ele) => {
    $(ele).appendTo($(ele).parent().prev("a"));
});