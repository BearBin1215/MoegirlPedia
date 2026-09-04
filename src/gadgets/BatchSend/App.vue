<template>
  <div class='batch-send'>
    <h3>页面列表</h3>
    <cdx-text-area
      v-model='pageList'
      autosize
      :rows='5'
      placeholder='使用换行分隔，一行一个
User talk前缀加不加都可以，支持发送至子页面'
    />
    <h3>标题</h3>
    <cdx-text-input v-model='headline' />
    <h3>正文</h3>
    <cdx-text-area
      v-model='content'
      autosize
      :rows='10'
    />
    <div class='submit-panel'>
      <cdx-button
        action='progressive'
        weight='primary'
        :disabled='sending'
        @click='onSubmit'
      >
        提交
      </cdx-button>
      <cdx-button
        weight='primary'
        :disabled='sending || previewing'
        @click='doPreview'
      >
        预览
      </cdx-button>
      <cdx-text-input
        v-model='interval'
        input-type='number'
        placeholder='发送间隔'
        class='interval-input'
      />
      <cdx-text-input
        v-model='summary'
        placeholder='编辑摘要'
        class='summary-input'
      />
    </div>
    <ul class='notelist'>
      <li>发送间隔单位为秒（s），不包含本身编辑所用的服务器响应时间。</li>
      <li>
        非维护人员请注意<a
          target='_blank'
          href='/api.php?action=query&meta=userinfo&uiprop=ratelimits'
        >ratelimit限制</a>和<a href='/萌娘百科:机器用户#其他规范'>机器用户方针规定的速率</a>，自行设置间隔或申请机器用户以免撞墙或超速。
      </li>
      <li>摘要留空则会由系统自动生成。</li>
    </ul>
    <template v-if='previewShown'>
      <h3>预览</h3>
      <div class='preview-zone'>
        <cdx-progress-bar v-if='previewing' />
        <div
          v-else
          v-html='previewHtml'
        />
      </div>
      <div class='preview-summary'>
        编辑摘要：<span
          class='comment'
          v-html='previewSummary'
        />
      </div>
    </template>
    <!-- Loger组件元素，在onMounted中挂入，v-once防止Vue重渲染时清除其内部DOM -->
    <div
      v-once
      ref='logRef'
    />
  </div>
</template>

<script setup lang='ts'>
// Codex组件运行时由window.Codex提供（rspack externals），IDE类型提示来自npm包
import { CdxButton, CdxProgressBar, CdxTextArea, CdxTextInput } from '@wikimedia/codex';
import { onMounted, ref, watch } from 'vue';
import Loger from '@/components/Loger';
import type { ApiEditResponse, ApiParseResponse } from '@/types/api';
import { formatNS3 } from '@/utils/formatNS';
import waitInterval from '@/utils/wait';

const api = new mw.Api();

/** 发送日志组件（jQuery版Loger，通过ref挂载到Vue树内，保留清空与类型筛选能力） */
const loger = new Loger();
/** 日志容器 */
const logRef = ref<HTMLElement>();

onMounted(() => {
  logRef.value?.append(loger.element);
});

/** 目标页面列表输入（换行分隔） */
const pageList = ref('');
/** 新章节标题 */
const headline = ref('');
/** 正文内容 */
const content = ref('');
/** 发送间隔（秒） */
const interval = ref('');
/** 编辑摘要 */
const summary = ref('');

/** 是否正在批量发送 */
const sending = ref(false);
/** 表单是否已被修改（用于关闭页面守卫） */
const dirty = ref(false);

// 输入变更或发送中时，拦截关闭页面
watch([pageList, headline, content], () => { dirty.value = true; });
watch([dirty, sending], () => {
  window.onbeforeunload = dirty.value || sending.value ? () => true : null;
});

/** 预览区域是否显示 */
const previewShown = ref(false);
/** 是否正在生成预览 */
const previewing = ref(false);
/** 预览HTML */
const previewHtml = ref('');
/** 预览摘要 */
const previewSummary = ref('');

/**
 * 解析内容并展示预览
 */
const doPreview = async () => {
  previewing.value = true;
  previewShown.value = true;
  try {
    const { parse } = await api.post({
      action: 'parse',
      uselang: mw.config.get('wgUserLanguage'),
      section: 'new',
      contentmodel: 'wikitext',
      pst: true,
      sectiontitle: headline.value,
      text: content.value,
      summary: summary.value,
    }) as ApiParseResponse;
    previewHtml.value = parse.text!['*'] ?? '';
    previewSummary.value = `（${parse.parsedsummary!['*']}）`;
  } finally {
    previewing.value = false;
  }
};

/**
 * 在目标用户讨论（子）页面新增章节
 *
 * 返回的sendResult对象中，sendResult.edit.result为Success/Failure
 *
 * 为Failure时，Object.keys(sendResult.edit)[0]为原因，sendResult.edit[Object.keys(sendResult.edit)[0]]为详情
 * @param title 目标用户
 * @param sectiontitle 新章节标题
 * @param text 源代码
 * @param editSummary 摘要
 * @returns 编辑结果
 */
const send = async (title: string, sectiontitle: string, text: string, editSummary = '') => {
  const sendResult = await api.postWithToken('csrf', {
    format: 'json',
    action: 'edit',
    section: 'new',
    watchlist: 'nochange',
    tags: 'Bot',
    bot: true,
    title,
    sectiontitle,
    text,
    summary: editSummary,
  }) as ApiEditResponse;
  return sendResult;
};

/** 确认后执行批量发送 */
const confirmSend = async () => {
  sending.value = true;

  const pageItems = [...new Set(pageList.value.split('\n').filter((s) => s && s.trim()))]; // 页面列表，分割、删空、去重
  const sectiontitle = headline.value.trim(); // 章节标题
  const text = content.value.trim(); // 文本内容
  const intervalMs = Number(interval.value) * 1000; // 发送间隔
  const editSummary = summary.value; // 编辑摘要

  for (const item of pageItems) {
    const title = formatNS3(item);
    const userLink = `<a href="/${title}" target="_blank">${title}</a>`;
    try {
      const sendResult = await send(title, sectiontitle, text, editSummary);
      if (sendResult.edit?.result === 'Success') {
        loger.record(`向【${userLink}】发送成功。`, 'success');
        await waitInterval(intervalMs);
      } else if (sendResult.edit?.result === 'Failure') {
        loger.record(`向【${userLink}】发送失败：${Object.keys(sendResult.edit)[0]}：${Object.values(sendResult.edit)[0]}。`, 'error');
      }
    } catch (err) {
      loger.record(`向【${userLink}】发送失败：${err}。`, 'error');
    }
  }

  loger.record('发送完毕。');
  sending.value = false;
  dirty.value = false;
};

/** 点击提交：先做非空校验，通过后弹出ooui确认框，确认后执行批量发送 */
const onSubmit = async () => {
  if (pageList.value.split('\n').filter((s) => s && s.trim()).length === 0) {
    loger.record('请输入要发送的目标页面。', 'warn');
    return;
  }
  if (headline.value.trim().length === 0) {
    loger.record('请输入章节标题。', 'warn');
    return;
  }
  if (content.value.trim().length === 0) {
    loger.record('请输入内容。', 'warn');
    return;
  }
  const confirmed = await OO.ui.confirm(
    $('<p>请确认您要发送的内容是否有误。若因输入不当而产生错误，请自行<ruby><rb>承担后果</rb><rp>(</rp><rt>料理后事</rt><rp>)</rp></ruby>。</p>'),
    { title: '提醒', size: 'small' },
  );
  if (confirmed) {
    await confirmSend();
  }
};
</script>

<style scoped>
.submit-panel {
  display: flex;
  gap: 0.4rem;
  align-items: center;
  margin-top: 0.8em;
}

.submit-panel .interval-input {
  flex: 0 0 5.5em;
}

.submit-panel .summary-input {
  flex: 1;
  max-width: unset;
}

.notelist {
  margin: 0.4em 0 0 1.6em;
}

.preview-zone {
  padding: 1em;
  border: 1px solid #ccc;
  background: rgb(255 255 255 / 70%);
}

.preview-zone :deep(.mw-editsection) {
  display: none;
}

.preview-summary {
  margin-top: 0.4em;
}
</style>
