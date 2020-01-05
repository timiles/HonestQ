import React from 'react';
import ButtonOrLogIn from '../shared/ButtonOrLogIn';

interface Props {
  className?: string;
  onClick: () => void;
}

export default class NewCommentButton extends React.Component<Props> {

  constructor(props: Props) {
    super(props);

    this.handleReply = this.handleReply.bind(this);
  }

  public render() {
    const { className = '' } = this.props;

    return (
      <ButtonOrLogIn
        type="button"
        className={`${className} mr-2`}
        onClick={this.handleReply}
      >
        Reply
      </ButtonOrLogIn>
    );
  }

  private handleReply() {
    this.props.onClick();
  }
}
