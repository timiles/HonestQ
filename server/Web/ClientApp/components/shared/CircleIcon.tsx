import React from 'react';

interface Props {
  className?: string;
  value: CircleIconValue;
}

export enum CircleIconValue {
  Tag,
  Question,
  Answer,
}

export default class CircleIcon extends React.Component<Props, {}> {

  public render() {
    const { className = '', value } = this.props;
    const valueClassName = CircleIconValue[value].toLowerCase();
    return <div className={`circle-icon circle-icon-${valueClassName} ${className}`} />;
  }
}
