import React, {
  forwardRef,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import clsx from 'clsx';
import { useCleanId } from '../hooks';
import { toFlagArray } from '../utils';
import Button, { type ButtonFlag } from '../widgets/Button';
import Label from '../widgets/Label';
import Message from '../widgets/Message';
import Dialog, { type DialogProps } from './Dialog';

export interface ProcessDialogActionProps {

  /** 动作符号名（如'continue'/'cancel'），作为onAction的入参 */
  action: string;

  /** 按钮文本（flags含close/back时被图标替代） */
  label: ReactNode;

  /** 按钮标志；safe/primary标志同时决定动作在头部左/右的"特殊"位置 */
  flags?: ButtonFlag | ButtonFlag[];

  /** 可见模式集；声明了modes的动作仅在modes含当前mode时可见 */
  modes?: string[];

  /** 是否禁用 */
  disabled?: boolean;

  /** 按钮tooltip */
  title?: string;
}

export interface ProcessDialogErrorProps {

  /** 错误信息 */
  message: ReactNode;

  /** 是否可恢复（默认true，显示重试按钮）；不可恢复时禁用触发动作 */
  recoverable?: boolean;

  /** 是否为警告（重试按钮显示为Continue） */
  warning?: boolean;
}

/** 错误面板条目：在ProcessDialogErrorProps基础上附加稳定key，避免用下标作key */
interface ProcessDialogErrorItem extends ProcessDialogErrorProps {
  id: number;
}

export interface ProcessDialogProps extends Omit<DialogProps, 'title' | 'head' | 'foot'> {

  /** 弹窗标题 */
  title?: ReactNode;

  /** 动作集（声明式传入） */
  actions?: ProcessDialogActionProps[];

  /** 当前模式；置位后仅声明了含该模式modes的动作可见（无modes的动作同样隐藏），不置位则全部可见 */
  mode?: string;

  /**
   * 动作执行回调（原版getActionProcess的React等价物，多步流程在异步函数内串联）：
   * 返回Promise期间头部显示pending条纹。
   * Promise以ProcessDialogError对象或其数组reject时展示错误面板；
   * 其他reject值规整为仅含message的错误（默认可恢复）
   */
  onAction?: (action: string) => Promise<void> | void;

  /** 按ESC时的回调，由调用方负责关闭。对齐原版onDialogKeyDown：ESC执行空动作流程（等效关闭，与safe动作无关） */
  onEscape?: () => void;
}

// 错误面板缺省英文文案
const ERROR_TITLE = 'Something went wrong';
const DISMISS_LABEL = 'Dismiss';
const RETRY_LABEL = 'Try again';
const CONTINUE_LABEL = 'Continue';

/**
 * 流程弹窗，对齐原版OO.ui.ProcessDialog：头部为safe动作（左）、标题（中）、primary动作（右），
 * 尾部为其他动作；动作执行期间显示pending态，失败时错误面板提供Dismiss/重试。
 * 原版通过子类覆写getActionProcess编排流程，本工程改为onAction异步回调声明式编排
 */
const ProcessDialog = forwardRef<HTMLDivElement, ProcessDialogProps>(({
  title,
  actions = [],
  mode,
  onAction,
  onEscape,
  open,
  className,
  children,
  escapable = true,
  'aria-labelledby': ariaLabelledBy,
  ...rest
}, ref) => {
  const [pendingCount, setPendingCount] = useState(0);
  // pending计数的同步镜像：isPending防护需在状态重渲染前即生效（对齐原版同步读写的
  // this.pendingCount，防止同一任务内的连续点击绕过防护）
  const pendingCountRef = useRef(0);
  const [errors, setErrors] = useState<ProcessDialogErrorItem[] | null>(null);
  // 不可恢复错误时禁用的动作符号名
  const [disabledAction, setDisabledAction] = useState<string | null>(null);
  // 重试目标（最近一次执行的动作）；用state而非ref：retryAction在渲染期派生，
  // 且重试按钮点击需读到最新值
  const [currentAction, setCurrentAction] = useState<string | null>(null);
  // 错误条目自增id源（同文案错误可重复出现，下标作key在增删时会错位）
  const errorIdRef = useRef(0);
  const navigationRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const safeRef = useRef<HTMLDivElement>(null);
  const primaryRef = useRef<HTMLDivElement>(null);
  // 标题元素id：使弹窗根（role='dialog'）的aria-labelledby关联标题
  const titleId = useCleanId();

  // 未声明modes的动作在置位mode后同样隐藏
  const visibleActions = mode === undefined
    ? actions
    : actions.filter((action) => action.modes?.includes(mode) ?? false);
  // 特殊动作 = 第一个可见的safe/primary动作
  const safeAction = visibleActions.find((action) => toFlagArray(action.flags).includes('safe'));
  // 对齐原版organize：每个动作只归入第一个命中的special flag
  const primaryAction = visibleActions.find((action) =>
    action !== safeAction && toFlagArray(action.flags).includes('primary'));
  const otherActions = visibleActions.filter((action) => action !== safeAction && action !== primaryAction);

  const hideErrors = () => {
    setErrors(null);
    setDisabledAction(null);
  };

  const executeAction = useCallback((action: string) => {
    // 执行前清除错误面板并恢复被禁用的动作，流程每次运行都从干净态开始
    hideErrors();
    setCurrentAction(action);
    pendingCountRef.current += 1;
    setPendingCount(pendingCountRef.current);
    Promise.resolve()
      .then(() => onAction?.(action))
      .then(() => {
        // 流程成功：确保错误面板保持关闭
        setErrors(null);
      })
      .catch((error: unknown) => {
        // 对齐原版executeAction().fail(showErrors)：拒绝值规整为错误列表
        const rawList = Array.isArray(error) ? error : [error];
        const list = rawList.map((item): ProcessDialogErrorItem => ({
          ...(item instanceof Object && 'message' in item
            ? item as ProcessDialogErrorProps
            : { message: String(item) }),
          id: (errorIdRef.current += 1),
        }));
        setErrors(list);
        // 含不可恢复错误时禁用触发动作，错误面板仅能经Dismiss退出
        if (list.some((item) => item.recoverable === false)) {
          setDisabledAction(action);
        }
      })
      .finally(() => {
        // 流程结束退出pending（Math.max防御计数下溢）
        pendingCountRef.current = Math.max(0, pendingCountRef.current - 1);
        setPendingCount(pendingCountRef.current);
      });
  }, [onAction]);

  // 对齐原版onDialogKeyDown：ESC执行空动作流程（无条件关闭，由调用方实现），与safe动作无关
  const handleEscape = useCallback(() => {
    onEscape?.();
  }, [onEscape]);

  // Ctrl/Cmd+Enter执行primary动作
  const handlePrimaryShortcut = useCallback(() => {
    if (primaryAction && primaryAction.disabled !== true && disabledAction !== primaryAction.action) {
      executeAction(primaryAction.action);
    }
  }, [primaryAction, disabledAction, executeAction]);

  // 标题在两侧动作之间避让（对齐原版fitLabel：空间足够时对称留白，否则按safe左/primary右）。
  // 测量经ResizeObserver驱动：隐藏期（open已置位但弹窗尚在动画前置态）测量全为0，
  // 元素变为可见时RO会首次回调并测得真实尺寸（等效原版isOpening时挂opened.done延迟测量）；
  // safe/primary容器可观察到按钮增减/宽度变化（mode切换、actions内容变化），标题文字变化
  // 不改变容器尺寸，由title依赖的重渲染触发
  useLayoutEffect(() => {
    const navigation = navigationRef.current;
    if (!navigation || !open) {
      return;
    }
    const fitLabel = () => {
      const location = locationRef.current;
      if (!location) {
        return;
      }
      const safeWidth = safeRef.current?.offsetWidth ?? 0;
      const primaryWidth = primaryRef.current?.offsetWidth ?? 0;
      const biggerWidth = Math.max(safeWidth, primaryWidth);
      const navigationWidth = navigation.clientWidth;
      // 对齐原版fitLabel：测量标题元素自身宽度（location容器为撑满导航的块盒，不可作为标题宽度）
      const labelWidth = titleRef.current?.offsetWidth ?? 0;
      let leftWidth: number;
      let rightWidth: number;
      if (2 * biggerWidth + labelWidth < navigationWidth - 20) {
        leftWidth = rightWidth = biggerWidth;
      } else {
        leftWidth = safeWidth;
        rightWidth = primaryWidth;
      }
      location.style.paddingLeft = `${leftWidth}px`;
      location.style.paddingRight = `${rightWidth}px`;
    };
    fitLabel();
    const observer = new ResizeObserver(fitLabel);
    observer.observe(navigation);
    if (safeRef.current) {
      observer.observe(safeRef.current);
    }
    if (primaryRef.current) {
      observer.observe(primaryRef.current);
    }
    return () => {
      observer.disconnect();
    };
  }, [title, open]);

  const pending = pendingCount > 0;
  const recoverable = errors === null || errors.every((item) => item.recoverable !== false);
  const warning = errors !== null && errors.some((item) => item.warning);
  const retryAction = visibleActions.find((action) => action.action === currentAction);

  const renderAction = (action: ProcessDialogActionProps) => {
    const flags = toFlagArray(action.flags);
    // 对齐原版getActionWidgetConfig：close/back标志的动作渲染为纯图标按钮
    const iconOnlyIcon = flags.includes('close') ? 'close' : flags.includes('back') ? 'previous' : undefined;
    return (
      <Button
        key={action.action}
        className='oo-ui-actionWidget'
        framed
        flags={flags}
        icon={iconOnlyIcon}
        invisibleLabel={iconOnlyIcon !== undefined}
        title={action.title}
        disabled={action.disabled === true || disabledAction === action.action}
        // 对齐原版Dialog.onActionClick：pending期间动作点击不触发执行（isPending防护，
        // 读同步计数ref，重渲染前的连续点击同样被拦截）
        onClick={() => {
          if (pendingCountRef.current === 0) {
            executeAction(action.action);
          }
        }}
      >
        {action.label}
      </Button>
    );
  };

  return (
    <Dialog
      {...rest}
      open={open}
      escapable={escapable}
      aria-labelledby={ariaLabelledBy ?? titleId}
      onEscape={handleEscape}
      onPrimaryAction={handlePrimaryShortcut}
      className={clsx(className, 'oo-ui-processDialog')}
      contentClassName='oo-ui-processDialog-content'
      head={
        <div ref={navigationRef} className='oo-ui-processDialog-navigation'>
          <div ref={primaryRef} className='oo-ui-processDialog-actions-primary'>
            {primaryAction && renderAction(primaryAction)}
          </div>
          <div ref={locationRef} className='oo-ui-processDialog-location'>
            <Label id={titleId} ref={titleRef} className='oo-ui-processDialog-title'>{title}</Label>
          </div>
          <div ref={safeRef} className='oo-ui-processDialog-actions-safe'>
            {safeAction && renderAction(safeAction)}
          </div>
          {pending && (
            <div
              className='oo-ui-pendingElement-pending'
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />
          )}
        </div>
      }
      foot={
        <div className='oo-ui-processDialog-actions-other'>
          {otherActions.map(renderAction)}
        </div>
      }
      ref={ref}
    >
      {errors && (
        <div className='oo-ui-processDialog-errors'>
          <div className='oo-ui-processDialog-errors-title'>{ERROR_TITLE}</div>
          {errors.map((item) => (
            <Message key={item.id} type='error'>{item.message}</Message>
          ))}
          <div className='oo-ui-processDialog-errors-actions'>
            <Button onClick={hideErrors}>{DISMISS_LABEL}</Button>
            {recoverable && (
              <Button
                flags={retryAction?.flags}
                onClick={() => {
                  // 重试目标恒为最近一次执行的动作（错误面板仅在执行后出现）
                  if (currentAction !== null) {
                    executeAction(currentAction);
                  }
                }}
              >
                {warning ? CONTINUE_LABEL : RETRY_LABEL}
              </Button>
            )}
          </div>
        </div>
      )}
      {children}
    </Dialog>
  );
});

ProcessDialog.displayName = 'ProcessDialog';

export default ProcessDialog;
