/**
 * 弹窗滚动锁，对齐原版WindowManager.toggleGlobalEvents在body上维护的windowManagerGlobalEvents栈：
 * 弹窗处于打开周期时给body/html加oo-ui-windowManager-modal-active锁定背景滚动
 * （body{overflow:hidden}；html非满屏时scrollbar-gutter:stable防滚动条消失引起布局抖动），
 * 叠加打开时按登记计数，最后一个弹窗teardown后解锁。类规则由主题CSS承接，本模块不写样式
 */

/** 处于打开周期（open||active）的弹窗登记表：key为弹窗实例的登记句柄，value为实际满屏态 */
const openedDialogs = new Map<object, boolean>();

/** 依据登记表同步body/html的滚动锁类（原版同步作用于$body.add($body.parent())） */
function syncScrollLockClasses(): void {
  const locked = openedDialogs.size > 0;
  const fullscreen = [...openedDialogs.values()].some(Boolean);
  document.body.classList.toggle('oo-ui-windowManager-modal-active', locked);
  document.body.classList.toggle('oo-ui-windowManager-modal-active-fullscreen', locked && fullscreen);
  document.documentElement.classList.toggle('oo-ui-windowManager-modal-active', locked);
  document.documentElement.classList.toggle('oo-ui-windowManager-modal-active-fullscreen', locked && fullscreen);
}

/**
 * 登记弹窗进入打开周期并同步滚动锁；已登记时为幂等更新（如full翻转后的重新登记）
 * @param handle 弹窗实例的稳定句柄对象，作为登记表key
 * @param full 实际满屏态（含窄屏自动满屏，对齐原版getSize()的视口判定）
 */
export function acquireScrollLock(handle: object, full: boolean): void {
  openedDialogs.set(handle, full);
  syncScrollLockClasses();
}

/** 注销弹窗的滚动锁登记（teardown完成或组件卸载时调用），最后一个注销时解锁；未登记时为空操作 */
export function releaseScrollLock(handle: object): void {
  if (openedDialogs.delete(handle)) {
    syncScrollLockClasses();
  }
}
