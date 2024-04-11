import React from 'react';
import classnames from 'classnames';
import './style.less';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 按钮类型 */
  buttonType?: 'normal' | 'primary' | 'danger' | 'flat' | 'link';
}

/** 按钮组件 */
const Button: React.FC<ButtonProps> = ({ buttonType, children, className, ...props }) => {
  const classNames = classnames(
    'bearui-button',
    `bearui-button-${buttonType || 'normal'}`,
    className,
  );
  return (
    <button
      className={classNames}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
