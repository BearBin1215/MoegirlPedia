import React, {
  forwardRef,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import clsx from 'clsx';
import { Label } from '../widgets/Label';
import { Button } from '../widgets/Button';
import { PanelLayout } from '../layouts/PanelLayout';
import { useCleanId } from '../hooks';
import { useMessage } from '../config';
import { withTemporaryClasses } from '../utils';
import { Dialog, type DialogProps } from './Dialog';

/** 动作区布局类（对齐原版MessageDialog.toggleVerticalActionLayout的两个互斥类） */
const ACTIONS_HORIZONTAL_CLASS = 'oo-ui-messageDialog-actions-horizontal';
const ACTIONS_VERTICAL_CLASS = 'oo-ui-messageDialog-actions-vertical';

// bodyFitFoot由本组件恒开（竖向动作布局的foot让位），故从可传prop中剔除
export interface MessageDialogProps extends Omit<DialogProps, 'title' | 'bodyFitFoot'> {
  title?: ReactNode;

  /** 确认按钮文本 */
  okLabel?: ReactNode;

  /** 取消按钮文本，传`null`隐藏取消按钮（如alert场景） */
  cancelLabel?: ReactNode;

  /** 点击确定或按Ctrl/Cmd+Enter时触发，不携带事件参数 */
  onOk?: () => void;
  /** 点击取消时触发，不携带事件参数 */
  onCancel?: () => void;
}

export const MessageDialog = forwardRef<HTMLDivElement, MessageDialogProps>(({
  children,
  className,
  open,
  title,
  size = 'small',
  okLabel,
  cancelLabel,
  foot,
  onOk,
  onCancel,
  onReady,
  'aria-labelledby': ariaLabelledBy,
  ...rest
}, ref) => {
  // 缺省按钮文案经useMessage读取（Provider/模块级覆盖>英文默认），对齐原版OO.ui.msg。
  // cancelLabel传null表示隐藏取消按钮（??会把null当缺省，须显式判null）
  const defaultOkLabel = useMessage('ooui-dialog-message-accept');
  const defaultCancelLabel = useMessage('ooui-dialog-message-reject');
  const resolvedOkLabel = okLabel ?? defaultOkLabel;
  const resolvedCancelLabel = cancelLabel === null ? null : cancelLabel ?? defaultCancelLabel;
  const classes = clsx(className, 'oo-ui-messageDialog');
  // 标题元素id：使弹窗根（role='dialog'）的aria-labelledby关联标题
  const titleId = useCleanId();
  // 对齐原版MessageDialog.getReadyProcess：ready后优先聚焦primary action按钮
  // （经Button的anchorRef直接持有可聚焦链接，不依赖其内部DOM结构）
  const okButtonRef = useRef<HTMLAnchorElement>(null);
  // 动作区竖向布局（对齐原版MessageDialog.fitActions：横向装不下时切竖向）
  const [verticalActions, setVerticalActions] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);
  // RO回调经rAF排队的句柄（见下方观察effect）
  const measureRafRef = useRef(0);

  const focusPrimary = useCallback(() => {
    okButtonRef.current?.focus();
  }, []);

  /**
   * 按动作区宽度判定是否切换竖向布局（对齐原版fitActions：**先强制为横向**再量
   * `scrollWidth > clientWidth`）。测量期须同时撤下竖向类并补上横向类：横向类是
   * `display:flex`（子项不换行、装不下即溢出），而两个类都不在时子项是inline-block、
   * 会换行而不溢出，量得「装得下」将导致竖向态判定后立刻切回横向、下一帧再切回竖向
   */
  const decideActionLayout = useCallback(() => {
    const el = actionsRef.current;
    // 弹窗未展开（oo-ui-element-hidden）时无布局盒，等可见后由ResizeObserver再次回调
    if (!el || !el.clientWidth) {
      return;
    }
    let overflows = false;
    withTemporaryClasses(el, { remove: [ACTIONS_VERTICAL_CLASS], add: [ACTIONS_HORIZONTAL_CLASS] }, () => {
      overflows = el.scrollWidth > el.clientWidth;
    });
    setVerticalActions(overflows);
  }, []);

  // 打开期间经RO跟踪动作区尺寸（窗口缩放、size切换、动作增减）：同值setState即bail out，
  // 不形成测量-渲染循环。RO回调内经rAF排队测量——判定会切换布局类引发布局变化，同步执行
  // 在RO交付期内会触发"ResizeObserver loop"错误通知（同Toolbar的做法）；关闭时取消排队
  useLayoutEffect(() => {
    if (!open) {
      return;
    }
    decideActionLayout();
    const el = actionsRef.current;
    if (!el) {
      return;
    }
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(measureRafRef.current);
      measureRafRef.current = requestAnimationFrame(decideActionLayout);
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(measureRafRef.current);
    };
  }, [open, decideActionLayout]);

  // handleReady的稳定性不承载正确性：Dialog经onReadyRef取最新回调，effect仅依赖[active, ready]
  const handleReady = useCallback(() => {
    // ready时弹窗已可见且布局稳定：兜底重判一次（RO对display:none→visible的首次回调时序无保证）
    decideActionLayout();
    if (!foot) {
      focusPrimary();
    }
    onReady?.();
  }, [foot, focusPrimary, onReady, decideActionLayout]);

  return (
    <Dialog
      {...rest}
      open={open}
      size={size}
      className={classes}
      contentClassName='oo-ui-messageDialog-content'
      aria-labelledby={ariaLabelledBy ?? titleId}
      onPrimaryAction={onOk}
      onReady={handleReady}
      // body底部让位给foot：竖向动作布局下foot变高时body的滚动区不被遮挡
      bodyFitFoot
      foot={
        <div
          ref={actionsRef}
          className={clsx(
            'oo-ui-messageDialog-actions',
            verticalActions ? ACTIONS_VERTICAL_CLASS : ACTIONS_HORIZONTAL_CLASS,
          )}
        >
          {foot ?? (
            // framed对齐原版attachActions的动作toggleFramed(true)（构造配置unframed、挂载时统一转framed）
            <>
              {resolvedCancelLabel !== null && <Button className='oo-ui-actionWidget' framed flags='safe' onClick={() => onCancel?.()}>{resolvedCancelLabel}</Button>}
              <Button anchorRef={okButtonRef} className='oo-ui-actionWidget' framed flags='primary' onClick={() => onOk?.()}>{resolvedOkLabel}</Button>
            </>
          )}
        </div>
      }
      ref={ref}
    >
      <PanelLayout className='oo-ui-messageDialog-container' scrollable expanded={false}>
        <PanelLayout className='oo-ui-messageDialog-text' padded expanded={false}>
          <Label id={titleId} className='oo-ui-messageDialog-title'>{title}</Label>
          {/* message须带oo-ui-messageDialog-message类：主题CSS将其display:block，
              缺失时保持inline，内部FieldLayout等块级内容宽度会被收缩 */}
          <Label className='oo-ui-messageDialog-message'>{children}</Label>
        </PanelLayout>
      </PanelLayout>
    </Dialog>
  );
});

MessageDialog.displayName = 'MessageDialog';

