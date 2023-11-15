import React from 'react';
import './style.less';

export default class Button extends React.Component {
    render() {
        const {
            type,
            children,
            className,
            ...otherProps
        } = this.props;
        return (
            <button
                className={`bearcompo-button bearcompo-button-${type || 'normal'} ${className}`}
                {...otherProps}
            >
                {children}
            </button>
        );
    }
}