import React, {
  useState,
  forwardRef,
  type ReactNode,
  type Key,
} from 'react';
import classNames from 'classnames';
import MenuLayout, { type MenuLayoutProps } from '../MenuLayout';
import StackLayout from '../StackLayout';
import type { OptionData } from '../../widgets/Option';
import type { PageLayoutProps } from '../PageLayout';
import type { ElementRef } from '../../../types/ref';
import type { ChangeHandler } from '../../../types/utils';

type BookletLayoutOptionProps = PageLayoutProps & {
  /** 菜单选项显示内容 */
  label: ReactNode;
  /** 唯一标识，用于控制显示 */
  key: Key;
};

export interface BookletLayoutProps extends Omit<MenuLayoutProps, 'menu' | 'children' | 'onChange'> {
  /** 默认激活标签 */
  defaultKey?: string | number;
  /** 页签集 */
  options: BookletLayoutOptionProps[];
  /** 页签变化钩子 */
  onChange?: ChangeHandler<string | number>;
}

const BookletLayout = forwardRef<ElementRef<HTMLDivElement>, BookletLayoutProps>(({
  className,
  options,
  defaultKey,
  onChange,
  ...rest
}, ref) => {
  const [activeKey, setActiveKey] = useState(defaultKey);

  const classes = classNames(
    className,
    'oo-ui-bookletLayout',
  );

  const menuOptions = options.map((option) => ({
    ...option,
    data: option.key,
    children: option.label,
  }));

  const handleSelect = (option: OptionData) => {
    if (typeof onChange === 'function' && option.data !== activeKey) {
      onChange({
        value: option.data,
        oldValue: activeKey,
      });
    }
    setActiveKey(option.data);
  };

  return (
    <MenuLayout
      {...rest}
      className={classes}
      ref={ref}
      options={menuOptions}
      activeKey={activeKey}
      onSelect={handleSelect}
    >
      <StackLayout
        className='oo-ui-bookletLayout-stackLayout'
        activeKey={activeKey}
        options={options}
      />
    </MenuLayout>
  );
});

BookletLayout.displayName = 'BookletLayout';

export default BookletLayout;
