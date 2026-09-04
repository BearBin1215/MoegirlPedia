import React, {
  useState,
  forwardRef,
  type ReactNode,
} from 'react';
import clsx from 'clsx';
import MenuLayout, { type MenuLayoutProps } from '../MenuLayout';
import PanelLayout from '../PanelLayout';
import OutlineSelect from '../../widgets/OutlineSelect';
import StackLayout from '../StackLayout';
import type { PageLayoutProps } from '../PageLayout';
import type { ChangeHandler } from '../../utils';

interface BookletLayoutOptionProps extends PageLayoutProps {
  /** 菜单选项显示内容 */
  label: ReactNode;

  /** 页签值，同时作为激活匹配依据与列表key */
  value: string | number;
}

export interface BookletLayoutProps extends Omit<MenuLayoutProps, 'menu' | 'children' | 'onChange'> {
  /** 当前激活页签（受控，传入即受控模式） */
  value?: string | number;

  /** 非受控初始激活页签 */
  defaultValue?: string | number;

  /** 页签集 */
  options: BookletLayoutOptionProps[];

  /** 页签变化钩子 */
  onChange?: ChangeHandler<string | number>;
}

const BookletLayout = forwardRef<HTMLDivElement, BookletLayoutProps>(({
  className,
  options,
  value,
  defaultValue,
  onChange,
  ...rest
}, ref) => {
  const isControlled = value !== undefined;
  const [innerValue, setInnerValue] = useState<string | number | undefined>(defaultValue);
  const activeValue = isControlled ? value : innerValue;

  const classes = clsx(
    className,
    'oo-ui-bookletLayout',
  );

  const menuOptions = options.map((option) => ({
    ...option,
    children: option.label,
    hidden: undefined,
  }));

  const handleSelect = (value: string | number) => {
    if (value !== activeValue) {
      onChange?.(value);
      if (!isControlled) {
        setInnerValue(value);
      }
    }
  };

  return (
    <MenuLayout
      {...rest}
      className={classes}
      ref={ref}
      menu={
        <PanelLayout
          className='oo-ui-bookletLayout-outlinePanel'
          scrollable
          expanded
        >
          <OutlineSelect
            value={activeValue}
            onChange={handleSelect}
            options={menuOptions}
          />
        </PanelLayout>
      }
    >
      <StackLayout
        className='oo-ui-bookletLayout-stackLayout'
        activeValue={activeValue}
        options={options}
      />
    </MenuLayout>
  );
});

BookletLayout.displayName = 'BookletLayout';

export default BookletLayout;
