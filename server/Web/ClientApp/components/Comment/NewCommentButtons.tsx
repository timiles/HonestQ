import React from 'react';
import ButtonOrLogIn from '../shared/ButtonOrLogIn';
import Icon, { IconValue } from '../shared/SvgIcons/Icon';

interface Props {
  className?: string;
  hideLabelOnMobile?: boolean;
  onClick: (isAgree: boolean) => void;
}

export default class NewCommentButtons extends React.Component<Props> {

  constructor(props: Props) {
    super(props);

    this.handleOpenAgree = this.handleOpenAgree.bind(this);
    this.handleOpenDisagree = this.handleOpenDisagree.bind(this);
  }

  public render() {
    const { className = '', hideLabelOnMobile } = this.props;

    return (
      <>
        <ButtonOrLogIn
          type="button"
          className={`${className} mr-2`}
          onClick={this.handleOpenAgree}
        >
          <span className={`mr-2 ${hideLabelOnMobile ? 'd-none d-md-inline-block' : ''}`}>
            Agree
          </span>
          <Icon value={IconValue.Agree} />
        </ButtonOrLogIn>
        <ButtonOrLogIn
          type="button"
          className={className}
          onClick={this.handleOpenDisagree}
        >
          <span className={`mr-2 ${hideLabelOnMobile ? 'd-none d-md-inline-block' : ''}`}>
            Disagree
          </span>
          <Icon value={IconValue.Disagree} />
        </ButtonOrLogIn>
      </>
    );
  }

  private handleOpenAgree() {
    this.props.onClick(true);
  }

  private handleOpenDisagree() {
    this.props.onClick(false);
  }
}
