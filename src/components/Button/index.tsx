import React from 'react';
import './style.less';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * 按钮类型
   */
  buttonType?: 'normal' | 'primary' | 'danger' | 'flat' | 'link';
}

const Button: React.FC<ButtonProps> = ({ buttonType, children, className, ...props }) => {
  return (
    <button
      className={`bearui-button bearui-button-${buttonType || 'normal'} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
