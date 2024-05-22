import React, { useState, forwardRef, Children } from 'react';
import classNames from 'classnames';
import MenuLayout from '../MenuLayout';
import PanelLayout from '../PanelLayout';
import StackLayout from '../StackLayout';
import OutlineSelect from '../../widgets/OutlineSelect';
import OutlineOption from '../../widgets/OutlineOption';
import type { ReactElement } from 'react';
import type { OptionData } from '../../widgets/Option';
import type { MenuLayoutProps } from '../MenuLayout';
import type { PageLayoutProps } from '../PageLayout';
import type { ElementRef } from '../../types/ref';
import type { ChangeHandler } from '../../types/utils';

type PageElement = ReactElement<PageLayoutProps>;

export interface BookletLayoutProps extends Omit<MenuLayoutProps, 'menu' | 'children' | 'onChange'> {
  /** 默认激活标签 */
  defaultKey?: string | number | boolean;

  children?: PageElement | PageElement[];

  /** 页签变化钩子 */
  onChange?: ChangeHandler<any>;
}

const BookletLayout = forwardRef<ElementRef<HTMLDivElement>, BookletLayoutProps>(({
  className,
  children,
  defaultKey,
  onChange,
  ...rest
}, ref) => {
  const [activeKey, setActiveKey] = useState(defaultKey);

  const classes = classNames(
    className,
    'oo-ui-bookletLayout',
  );

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
      menu={
        <PanelLayout
          className='oo-ui-bookletLayout-outlinePanel'
          scrollable
          expanded
        >
          <OutlineSelect value={activeKey} onSelect={handleSelect}>
            {Children.map(children, (page) => {
              if (!page) {
                return void 0;
              }
              return (
                <OutlineOption key={page.key} data={page.key!}>
                  {page.props.label}
                </OutlineOption>
              );
            })}
          </OutlineSelect>
        </PanelLayout>
      }
    >
      <StackLayout
        className='oo-ui-bookletLayout-stackLayout'
        activeKey={activeKey}
      >
        {children}
      </StackLayout>
    </MenuLayout>
  );
});

BookletLayout.displayName = 'BookletLayout';

export default BookletLayout;
