import React, {
  forwardRef,
  useRef,
  type FocusEvent,
} from 'react';
import clsx from 'clsx';
import { FieldLayout } from '../FieldLayout';
import type { FieldLayoutProps } from '../FieldLayout';
import { Button, type ButtonProps } from '../../widgets/Button';
import { TextInput, type TextInputProps } from '../../widgets/TextInput';
import { MultilineTextInput, type MultilineTextInputProps } from '../../widgets/MultilineTextInput';
import { useMessage } from '../../config';

/**
 * 文本框配置（`CopyTextLayoutProps.textInputProps`）：单行与多行通用——输入元素类型参数化为
 * input与textarea的联合，并放行multiline专属的rows/maxRows/autosize。
 * `inputRef`由布局自身占用（复制与聚焦全选需要），故从类型上排除，传入即编译报错
 */
export type CopyTextLayoutTextInputProps =
  Omit<Partial<TextInputProps<HTMLInputElement | HTMLTextAreaElement>>, 'inputRef'> &
  Partial<Pick<MultilineTextInputProps, 'rows' | 'maxRows' | 'autosize'>>;

export interface CopyTextLayoutProps extends Omit<FieldLayoutProps, 'children'> {

  /** 待复制文本。作为文本框初始值（对齐原版config.copyText）；textInputProps.value给定时以后者为准 */
  copyText?: string;

  /** 是否多行：文本框换用MultilineTextInput，复制按钮改为右侧换行（对齐原版config.multiline） */
  multiline?: boolean;

  /** 文本框props覆盖：value为受控值、readOnly缺省true，其余透传 */
  textInputProps?: CopyTextLayoutTextInputProps;

  /** 复制按钮props覆盖：children为按钮文本（缺省取ooui-copytextlayout-copy消息），icon缺省'copy' */
  buttonProps?: Partial<ButtonProps>;

  /** 复制结束回调（对齐原版copy事件），入参为是否复制成功。命名避开DOM原生onCopy事件 */
  onCopyResult?: (copied: boolean) => void;
}

/**
 * 复制文本布局，对齐原版OO.ui.CopyTextLayout：只读文本框 + 复制按钮，聚焦或点击按钮时
 * 自动全选文本。原版该布局继承ActionFieldLayout，此处同样在其结构上排布（输入区+按钮），
 * 但多行时需改写两个包装元素的连接类（原版构造期的类改写），故直接组装FieldLayout而不复用
 * ActionFieldLayout的固定包装。
 *
 * 与原版的一处差异：复制优先走`navigator.clipboard`，不可用或被拒时回落到原版的
 * `document.execCommand('copy')`（原版仅用后者，该API已废弃且无权限/非安全上下文时静默失败）。
 */
export const CopyTextLayout = forwardRef<HTMLDivElement, CopyTextLayoutProps>(({
  buttonProps,
  className,
  copyText,
  label,
  multiline,
  onCopyResult,
  textInputProps,
  ...rest
}, ref) => {
  const singleLineRef = useRef<HTMLInputElement>(null);
  const multilineRef = useRef<HTMLTextAreaElement>(null);
  /**
   * 选中中标记，对齐原版CopyTextLayout.selecting的防重入：原版`textInput.select()`经
   * selectRange先`focus()`再setSelectionRange，聚焦会同步回到onInputFocus形成回环，故需要它；
   * 本版直接调DOM `select()`（不移焦、只派发select事件），此标记仅作同构防御保留
   */
  const selectingRef = useRef(false);
  const defaultButtonLabel = useMessage('ooui-copytextlayout-copy');
  const {
    onFocus: callerInputFocus,
    readOnly = true,
    value: controlledValue,
    ...textInputRest
  } = textInputProps ?? {};
  const {
    children: buttonChildren,
    icon: buttonIcon = 'copy',
    onClick: callerButtonClick,
    ...buttonRest
  } = buttonProps ?? {};

  /** 当前实际渲染的输入元素（单行input与多行textarea二选一） */
  const getInput = () => (multiline ? multilineRef.current : singleLineRef.current);

  /** 全选文本并保持滚动位置，对齐原版selectText */
  const selectText = () => {
    const input = getInput();
    if (!input) {
      return;
    }
    const { scrollTop, scrollLeft } = input;
    selectingRef.current = true;
    input.select();
    selectingRef.current = false;
    input.scrollTop = scrollTop;
    input.scrollLeft = scrollLeft;
  };

  /**
   * 写入剪贴板：优先navigator.clipboard（无需选中区域），失败或不可用时回落到
   * execCommand对当前选中区域的复制（原版路径，需要selectText已选中）
   */
  const copyToClipboard = async (): Promise<boolean> => {
    const text = getInput()?.value ?? '';
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        // 权限被拒或非安全上下文：继续尝试execCommand
      }
    }
    try {
      return document.execCommand('copy');
    } catch {
      return false;
    }
  };

  /** 点击复制按钮：先全选再复制，结果经onCopyResult上报（对齐原版onButtonClick） */
  const handleCopy = async () => {
    selectText();
    onCopyResult?.(await copyToClipboard());
  };

  /**
   * 文本框聚焦即全选（对齐原版onInputFocus），便于直接Ctrl+C。
   * 原版绑定在输入元素上，此处透传到组件根（React的onFocus按focusin冒泡，
   * 根内唯一可聚焦元素即输入框，效果等同）
   */
  const handleInputFocus = (e: FocusEvent<HTMLDivElement>) => {
    callerInputFocus?.(e);
    if (!selectingRef.current) {
      selectText();
    }
  };

  // value优先（调用方显式受控），其次copyText作为非受控初始值（对齐原版config.copyText
  // 仅在TextInputWidget构造期写入、此后不随配置变更的语义），两者都缺省时不干预输入框默认值
  const valueProps = controlledValue !== undefined
    ? { value: controlledValue }
    : copyText !== undefined ? { defaultValue: copyText } : {};

  const inputNode = multiline ? (
    <MultilineTextInput
      {...textInputRest}
      {...valueProps}
      onFocus={handleInputFocus}
      readOnly={readOnly}
      inputRef={multilineRef}
    />
  ) : (
    <TextInput
      {...textInputRest}
      {...valueProps}
      onFocus={handleInputFocus}
      readOnly={readOnly}
      inputRef={singleLineRef}
    />
  );

  return (
    <FieldLayout
      {...rest}
      className={clsx(className, 'oo-ui-actionFieldLayout', 'oo-ui-copyTextLayout')}
      label={label}
      ref={ref}
    >
      {/* 多行时剥去连接类：原版构造期HACK（多行文本框与按钮不并排，按钮另起一行右浮） */}
      <div className={multiline ? undefined : 'oo-ui-actionFieldLayout-input'}>
        {inputNode}
      </div>
      <span className={multiline ? 'oo-ui-copyTextLayout-multiline-button' : 'oo-ui-actionFieldLayout-button'}>
        <Button
          {...buttonRest}
          icon={buttonIcon}
          onClick={(e) => {
            callerButtonClick?.(e);
            void handleCopy();
          }}
        >
          {buttonChildren ?? defaultButtonLabel}
        </Button>
      </span>
    </FieldLayout>
  );
});

CopyTextLayout.displayName = 'CopyTextLayout';
