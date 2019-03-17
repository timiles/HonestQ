import * as React from 'react';

interface Props {
    className?: string;
    value: CircleTagValue;
}

export enum CircleTagValue {
    Question,
    Answer,
}

export default class CircleTag extends React.Component<Props, {}> {

    public render() {
        const { className = '', value } = this.props;
        const valueClassName = CircleTagValue[value].toLowerCase();
        return <div className={`circle-tag circle-tag-${valueClassName} ${className}`} />;
    }
}
