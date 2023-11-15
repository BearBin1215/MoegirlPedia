import React from 'react';
import './style.less';

export default class Button extends React.Component {
    render() {
        const {
            type,
            children,
            ...otherProps
        } = this.props;
        return (
            <button
                className={`bearcompo-button bearcompo-button-${type || 'normal'}`}
                {...otherProps}
            >
                {children}
            </button>
        );
    }
}