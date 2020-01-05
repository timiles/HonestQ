import React from 'react';
import Icon, { IconValue } from './SvgIcons/Icon';

interface Props {
  value: boolean;
  onChange?: (isAgree: boolean) => void;
}

export default class AgreementRatingLabel extends React.Component<Props> {

  constructor(props: Props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
  }

  public render() {
    const { value, onChange } = this.props;

    return (
      <span className="badge badge-pill badge-reaction d-flex align-items-center">
        {onChange && (
          <label className="switch mr-2">
            <input className="switch-input" type="checkbox" checked={value} onChange={this.handleChange} />
            <span className="switch-label" />
            <span className="switch-handle" />
          </label>
        )}
        <Icon value={value ? IconValue.Agree : IconValue.Disagree} />
        <label>{value ? 'Agree' : 'Disagree'}</label>
      </span>
    );
  }

  private handleChange(event: React.FormEvent<HTMLInputElement>): void {
    const { checked } = event.currentTarget;
    this.props.onChange!(checked);
  }
}
