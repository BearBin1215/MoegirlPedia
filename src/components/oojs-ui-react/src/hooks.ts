import { useEffect, useState, type CSSProperties, type RefObject } from 'react';

/**
 * 受控/非受控通用值状态（对齐React受控组件惯例，原版通过setters维护无对应物）：
 * 传入`value`即受控模式（内部state不生效）；否则维护内部state并以`defaultValue`初始化。
 * `commit`供事件回调使用：非受控时同步内部state，并始终转发给`onChange`
 */
export function useControlledValue<T, E = never>(
  { value, defaultValue }: { value?: T; defaultValue?: T },
  onChange?: (value: T, event?: E) => void,
) {
  const isControlled = value !== undefined;
  const [innerValue, setInnerValue] = useState<T | undefined>(defaultValue);
  // 非受控时innerValue以defaultValue初始化，语义上始终有值；断言为T以保持调用侧类型简洁
  const currentValue = (isControlled ? value : innerValue) as T;
  const commit = (nextValue: T, event?: E) => {
    if (!isControlled) {
      setInnerValue(nextValue);
    }
    onChange?.(nextValue, event);
  };
  return { value: currentValue, isControlled, commit } as const;
}

/**
 * TextInput系组件：label渲染在input旁，input需按label宽度预留内边距。
 * label在首次渲染后才能测量，故在effect中计算；label内容或位置变化后重算
 */
export function useLabelPadding(
  labelRef: RefObject<HTMLElement | null>,
  label: unknown,
  labelPosition: 'before' | 'after',
): CSSProperties {
  const [inputStyle, setInputStyle] = useState<CSSProperties>({});

  useEffect(() => {
    const style: CSSProperties = {};
    if (labelRef.current) {
      // +2px为label与输入内容之间的间距余量
      const paddingWidth = `${labelRef.current.offsetWidth + 2}px`;
      if (labelPosition === 'before') {
        style.paddingLeft = paddingWidth;
      } else {
        style.paddingRight = paddingWidth;
      }
    }
    setInputStyle(style);
  }, [label, labelPosition]);

  return inputStyle;
}
