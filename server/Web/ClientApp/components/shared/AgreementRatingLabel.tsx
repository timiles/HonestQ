import React from 'react';
import Icon, { IconValue } from './SvgIcons/Icon';

interface Props {
  value: string;
}

export default class AgreementRatingLabel extends React.Component<Props> {

  public render() {
    const { value } = this.props;
    const iconValue = IconValue[value as keyof typeof IconValue];

    return (
      <span className="badge badge-pill badge-reaction">
        {iconValue >= 0 && <Icon value={iconValue} />}
        <label>{value.toSentenceCase()}</label>
      </span>
    );
  }
}
