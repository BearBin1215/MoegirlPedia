import React, {
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { createRoot } from 'react-dom/client';
import FieldLayout from '../layouts/FieldLayout';
import TextInput, { type TextInputProps } from '../widgets/TextInput';
import MessageDialog from './MessageDialog';
import { DIALOG_ANIMATION, type DialogProps } from './Dialog';

export interface ConfirmAlertOptions {
  /** 弹窗标题 */
  title?: ReactNode;

  /** 确认按钮文本 */
  okLabel?: ReactNode;

  /** 取消按钮文本（仅confirm） */
  cancelLabel?: ReactNode;

  /** 弹窗大小 */
  size?: DialogProps['size'];
}

export type AlertOptions = Omit<ConfirmAlertOptions, 'cancelLabel'>;

export interface PromptOptions extends ConfirmAlertOptions {
  /** 文本输入框属性。value仅作为初始值，输入值由prompt内部维护 */
  textInput?: TextInputProps;
}

// 命令式弹窗的卸载延时：Dialog关闭动画时长 + 裕量，确保动画播完再卸载
const CLOSE_DURATION = DIALOG_ANIMATION.closeDuration + 50;

/**
 * 命令式弹窗渲染期错误边界：捕获Host子树的渲染错误并交给错误出口（清理挂载点+reject），
 * 否则resolve永不调用（调用方await永久卡死）、portal与root残留在document.body。
 * 捕获后渲染null止血；原始错误由React默认日志输出，不在此吞掉堆栈
 */
class DialogErrorBoundary extends React.Component<{
  onError: (error: unknown) => void;
  children: ReactNode;
}, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    this.props.onError(error);
  }

  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

/** 挂载骨架交给render的控制句柄：open驱动Dialog打开动画，close兑现结果并等动画后卸载 */
interface ImperativeDialogHandle<T> {
  /** 是否进入打开态（首帧为false，挂载后置true以触发打开动画） */
  open: boolean;

  /** 关闭并以result兑现（先播关闭动画，结束后卸载挂载点） */
  close: (result: T) => void;
}

/**
 * 命令式弹窗挂载骨架（confirm/alert/prompt共用）：自建Portal挂载React root，
 * 先以关闭态渲染首帧、挂载后再置open进入Dialog打开动画时序；关闭时播完关闭动画再卸载并兑现。
 * settled守卫使「正常关闭」与「渲染期崩溃」先到先得，防重复resolve/unmount。
 * 渲染期崩溃时卸载挂载点并向调用方reject（异常不伪装成「取消」）
 */
function mountDialog<T>(
  render: (handle: ImperativeDialogHandle<T>) => ReactNode,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const portal = document.createElement('div');
    document.body.appendChild(portal);
    const root = createRoot(portal);
    let settled = false;

    // 渲染期崩溃出口：卸载不能在React错误处理阶段同步执行，经宏任务延后一拍
    const crash = (error: unknown) => {
      if (settled) {
        return;
      }
      settled = true;
      setTimeout(() => {
        root.unmount();
        portal.remove();
      }, 0);
      reject(error);
    };

    const Host = () => {
      const [open, setOpen] = useState(false);

      useEffect(() => {
        setOpen(true);
      }, []);

      // 关闭并兑现结果：先播关闭动画，结束后卸载挂载点（settled守卫保证仅首次生效）
      const close = (result: T) => {
        if (settled) {
          return;
        }
        settled = true;
        setOpen(false);
        setTimeout(() => {
          root.unmount();
          portal.remove();
          resolve(result);
        }, CLOSE_DURATION);
      };

      return (
        <DialogErrorBoundary onError={crash}>
          {render({ open, close })}
        </DialogErrorBoundary>
      );
    };

    root.render(<Host />);
  });
}

/**
 * 对齐原版`OO.ui.confirm`：弹出确认框，确定时兑现`true`，取消/ESC时兑现`false`。
 * 命令式API，与MessageDialog组件单向依赖（原版即为OO.ui命名空间下的独立函数）。
 */
export function confirm(message: ReactNode, options: ConfirmAlertOptions = {}): Promise<boolean> {
  return mountDialog<boolean>(({ open, close }) => (
    <MessageDialog
      open={open}
      title={options.title}
      size={options.size}
      okLabel={options.okLabel}
      cancelLabel={options.cancelLabel}
      escapable
      onEscape={() => close(false)}
      onOk={() => close(true)}
      onCancel={() => close(false)}
    >
      {message}
    </MessageDialog>
  ));
}

/**
 * 对齐原版`OO.ui.alert`：弹出仅含确定按钮的提示框，关闭时兑现。
 * 命令式API，与MessageDialog组件单向依赖（原版即为OO.ui命名空间下的独立函数）。
 */
export function alert(message: ReactNode, options: AlertOptions = {}): Promise<void> {
  // alert仅含确定按钮，对齐原版alert只注册accept action的行为
  return mountDialog<void>(({ open, close }) => (
    <MessageDialog
      open={open}
      title={options.title}
      size={options.size}
      okLabel={options.okLabel}
      cancelLabel={null}
      escapable
      onEscape={() => close()}
      onOk={() => close()}
    >
      {message}
    </MessageDialog>
  ));
}

/**
 * 对齐原版`OO.ui.prompt`：弹出带文本输入框的确认框，确定（或输入框内按Enter）时兑现输入值，
 * 取消/ESC时兑现`null`。
 */
export function prompt(message: ReactNode, options: PromptOptions = {}): Promise<string | null> {
  const {
    value: initialValue,
    defaultValue,
    onChange: callerOnChange,
    onKeyDown: callerOnKeyDown,
    // inputRef由prompt内部占用（自动聚焦），解构排除避免透传时被覆盖
    inputRef: _callerInputRef,
    ...textInputRest
  } = options.textInput ?? {};

  // 输入期间累积的值与自动聚焦目标：每次prompt调用各持一份（闭包隔离）。
  // 以裸ref对象承载而非Host内hooks，便于复用统一的挂载骨架；
  // initialValue即textInput.value，为更明确的初值，优先于defaultValue
  const valueRef = { current: String(initialValue ?? defaultValue ?? '') };
  const inputRef = { current: null as HTMLInputElement | null };

  return mountDialog<string | null>(({ open, close }) => (
    <MessageDialog
      open={open}
      title={options.title}
      size={options.size}
      okLabel={options.okLabel}
      cancelLabel={options.cancelLabel}
      escapable
      onEscape={() => close(null)}
      onOk={() => close(valueRef.current)}
      onCancel={() => close(null)}
      // 对齐原版instance.opened.then内的textInput.focus()：经MessageDialog.onReady在ready时
      // 确定性执行，时序上晚于其内部聚焦OK按钮（原版即为先弹窗聚焦、再输入框聚焦覆盖）
      onReady={() => inputRef.current?.focus()}
    >
      <FieldLayout align='top' label={message}>
        <TextInput
          {...textInputRest}
          defaultValue={initialValue ?? defaultValue}
          inputRef={inputRef}
          onChange={(next, event) => {
            valueRef.current = next;
            callerOnChange?.(next, event);
          }}
          onKeyDown={(event) => {
            // callerOnKeyDown先行，允许调用方preventDefault否决提交
            callerOnKeyDown?.(event);
            // 对齐原版textInput.on('enter')：输入框内按Enter等同点击确定。
            // 排除输入法合成态——Safari等在组合期给出key='Enter'且isComposing=true，
            // 中文/日文用户回车上屏会误提交并关闭弹窗
            if (
              event.key === 'Enter'
              && !event.nativeEvent.isComposing
              && !event.defaultPrevented
            ) {
              event.preventDefault();
              close(valueRef.current);
            }
          }}
        />
      </FieldLayout>
    </MessageDialog>
  ));
}
