// Edit from [[User:AnnAngela/js/userStatus.js]]

$(() => (async () => {
  await mw.loader.using(['ext.gadget.LocalObjectStorage']);
  const localObjectStorage = new LocalObjectStorage('UserStatus');
  try {
    const builtinStatus = {
      online: '<img class="pt-userstatus-img" src="https://img.moegirl.org.cn/common/9/94/Symbol_support_vote.svg"> <b style="color:green;">在线</b>',
      busy: '<img class="pt-userstatus-img" src="https://img.moegirl.org.cn/common/c/c5/Symbol_support2_vote.svg"> <b style="color:blue;">忙碌</b>',
      offline: '<img class="pt-userstatus-img" src="https://img.moegirl.org.cn/common/7/7f/Symbol_oppose_vote.svg"> <b style="color:red;">离线</b>',
      away: '<img class="pt-userstatus-img" src="https://img.moegirl.org.cn/common/6/6c/Time2wait.svg"> <b style="color:grey;">已离开</b>',
      sleeping: '<img class="pt-userstatus-img" src="https://img.moegirl.org.cn/common/5/54/Symbol_wait.svg"> <b style="color:purple;">在睡觉</b>',
      wikibreak: '<img class="pt-userstatus-img" src="https://img.moegirl.org.cn/common/6/61/Symbol_abstain_vote.svg"> <b style="color:brown;">正在放萌百假期</b>',
      holiday: '<img class="pt-userstatus-img" src="https://img.moegirl.org.cn/common/3/30/Symbol_deferred.svg"> <b style="color:#7B68EE;">处于假期中</b>',
      _unknown: '<img class="pt-userstatus-img" src="https://img.moegirl.org.cn/common/8/89/Symbol_neutral_vote.svg"> <i style="color:gray;">状态不详</i>',
    };
    const originalBuiltinStatusIndex = Object.keys(builtinStatus);
    mw.loader.addStyleTag('.skin-vector #pt-userstatus { margin-top: 0.75em !important; margin-bottom: 0px !important; } .pt-userstatus-img { width: 25px; } .skin-vector .pt-userstatus-img {  margin-top: -0.25em; } .skin-moeskin #pt-userpage-link { display: flex; align-items: center; gap: .1em; @media (max-width: 768px) { #pt-userstatus { display: none; } }');
    builtinStatus.on = builtinStatus.online;
    builtinStatus.off = builtinStatus.offline;
    builtinStatus.break = builtinStatus.wikibreak;
    builtinStatus.sleep = builtinStatus.sleeping;
    const userName = mw.config.get('wgUserName');
    if (userName === null) {
      return;
    }
    const statusPage = `User:${userName}/Status`;
    const now = new Date().getTime();
    let rawStatus;
    try {
      const localStatus = await localObjectStorage.getItem('localStatus');
      if (mw.config.get('wgPageName') !== statusPage
        && typeof localStatus.timestamp === 'number' && localStatus.timestamp > now - 10 * 60 * 1000
        && localStatus.status in builtinStatus) {
        rawStatus = localStatus.status;
      } else {
        throw new Error();
      }
    } catch {
      try {
        rawStatus = (await $.ajax({
          url: `${mw.config.get('wgServer')}${mw.config.get('wgScriptPath')}/index.php`,
          type: 'GET',
          data: {
            title: statusPage,
            action: 'raw',
          },
          cache: false,
        })).trim();
        if (rawStatus in builtinStatus) {
          await localObjectStorage.setItem('localStatus', {
            timestamp: now,
            status: rawStatus,
          });
        }
      } catch {
        rawStatus = '_unknown';
        await localObjectStorage.removeItem('localStatus');
      }
    }
    const currentStatus = rawStatus in builtinStatus ? builtinStatus[rawStatus] : (() => {
      const div = $('<div/>').html(rawStatus);
      div.find('script, style, link, iframe, frame, object, param, audio, video, base, head, meta, title, body, h1, h2, h3, h4, h5, h6, blockquote, dd, dl, dir, dt, hr, li, ul, ol, pre, a, abbr, br, cite, code, data, em, rb, rp, rt, rtc, ruby, samp, time, tt, var, wbr, area, map, track, applet, embed, noembed, picture, source, canvas, noscript, caption, col, colgroup, table, tbody, thead, tfoot, td, th, tr, button, datalist, fieldset, form, input, label, legend, meter, optgroup, option, output, progress, select, textarea, details, dialog, menu, menuitem, summary, shadow, element, content, slot, template, bgsound, blink, center, command, frameset').remove();
      div.find('img').attr('class', 'pt-userstatus-img');
      return div.html();
    })();
    let pt;
    switch (mw.config.get('skin')) {
      case 'moeskin':
        pt = $('<div id="pt-userstatus" class="search-button-area"><a id="pt-userpage-link" href="javascript:void(0);" dir="auto" title="您的状态"></a></div>');
        $('#moe-global-header-inner .user-links').append(pt);
        break;
      case 'vector':
      default:
        pt = $('<li id="pt-userstatus"><a id="pt-userpage-link" href="javascript:void(0);" dir="auto" title="您的状态"></a></li>');
        $('#pt-userpage').after(pt);
    }
    pt.find('#pt-userpage-link').html(currentStatus).on('click', async () => {
      await mw.loader.using(['oojs-ui', 'mediawiki.api']);
      const messageDialog = new OO.ui.MessageDialog();
      const windowManager = new OO.ui.WindowManager();
      $(document.body).append(windowManager.$element);
      windowManager.addWindows([messageDialog]);
      messageDialog.title.$label.html('修改自己的状态');
      const container = $('<div/>');
      container.append(`<p>修改<a href="${mw.config.get('wgServer')}${mw.config.get('wgScriptPath')}/${statusPage}">自己的状态</a>为：</p>`);
      const builtinStatusList = originalBuiltinStatusIndex.map((data, i) => data === '_unknown' ? undefined : { data, label: `${i}`, html: builtinStatus[data] }).filter((n) => !!n);
      const builtinStatusSelector = new OO.ui.RadioSelectInputWidget({
        value: rawStatus,
        options: builtinStatusList.map(({ data, label }) => ({ data, label })),
      });
      builtinStatusSelector.$element.find('.oo-ui-radioSelectWidget > .oo-ui-radioOptionWidget > .oo-ui-labelElement-label').each((_, labelEle) => {
        $(labelEle).css('overflow', 'visible').html((builtinStatusList.filter(({ label }) => $(labelEle).text() === label)[0] || { html: $(labelEle).html() }).html);
      });
      container.append(builtinStatusSelector.$element);
      container.append(`<p>本工具在获取状态信息后有10分钟的缓存，您可以通过直接打开<a href="${mw.config.get('wgServer')}${mw.config.get('wgScriptPath')}/${statusPage}">自己的状态页</a>来强制获取最新状态信息。`);
      messageDialog.message.$label.append(container);
      const action = new OO.ui.ActionWidget({
        action: 'confirm',
        label: '提交',
        flags: 'primary',
      });
      const cAction = new OO.ui.ActionWidget({
        action: 'cancel',
        label: '取消',
        flags: 'primary',
      });
      cAction.$element[0].addEventListener('click', () => {
        windowManager.closeWindow(messageDialog);
      }, {
        capture: true,
      });
      action.$element[0].addEventListener('click', async () => {
        windowManager.closeWindow(messageDialog);
        const fMessageDialog = new OO.ui.MessageDialog();
        windowManager.addWindows([fMessageDialog]);
        const cAction = new OO.ui.ActionWidget({
          action: 'accept',
          label: '我知道了',
          flags: 'primary',
        });
        cAction.$element[0].addEventListener('click', () => {
          windowManager.closeWindow(fMessageDialog);
        }, {
          capture: true,
        });
        try {
          const status = builtinStatusSelector.getValue();
          await new mw.Api().postWithToken('csrf', {
            action: 'edit',
            title: statusPage,
            text: status,
            summary: `修改状态为 - ${status}`,
            tags: 'Automation tool',
            minor: true,
          });
          await localObjectStorage.setItem('localStatus', {
            timestamp: new Date().getTime(),
            status,
          });
          pt.find('#pt-userpage-link').html(builtinStatus[status]);
          rawStatus = status;
          fMessageDialog.title.$label.html('状态修改完成！');
          fMessageDialog.message.$label.html(`<p>你的状态已修改为：${builtinStatus[status]}</p>`);
          const action = new OO.ui.ActionWidget({
            action: 'confirm',
            label: '确定',
            flags: 'primary',
          });
          action.$element[0].addEventListener('click', () => {
            windowManager.closeWindow(fMessageDialog);
          }, {
            capture: true,
          });
          windowManager.openWindow(fMessageDialog, {
            actions: [action],
          });
        } catch (e) {
          fMessageDialog.title.$label.html('状态修改发生错误……');
          fMessageDialog.message.$label.html(`错误信息为：${e}`);
          windowManager.openWindow(fMessageDialog, {
            actions: [cAction],
          });
        }
      }, {
        capture: true,
      });
      windowManager.openWindow(messageDialog, {
        actions: [action, cAction],
      });
      return false;
    });
    mw.loader.using(['oojs-ui', 'mediawiki.api']);
  } catch (reason) {
    console.error(reason);
    const lastError = sessionStorage.getItem('AnnTools-userstatus-img-Error');
    if (lastError !== reason.toString()) {
      alert(`显示用户状态工具发生错误：\n${reason}`);
      sessionStorage.setItem('AnnTools-userstatus-img-Error', reason);
    }
  }
})());
