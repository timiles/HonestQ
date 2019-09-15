import React from 'react';
import Icon, { IconValue } from './SvgIcons/Icon';

interface Props {
  value: boolean;
}

export default class AgreementRatingLabel extends React.Component<Props> {

  public render() {
    const { value } = this.props;

    return (
      <span className="badge badge-pill badge-reaction">
        <Icon value={value ? IconValue.Agree : IconValue.Disagree} />
        <label>{value ? 'Agree' : 'Disagree'}</label>
      </span>
    );
  }
}
