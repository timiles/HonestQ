import React from 'react';
import { HQSubmitButton, HQText } from '../hq-components';
import hqStyles from '../hq-styles';
import UpvoteIcon from '../svg-icons/UpvoteIcon';

interface Props {
  answerId: number;
  commentId?: number;
  count: number;
  isUpvotedByLoggedInUser: boolean;
  onUpvote: (on: boolean, answerId: number, commentId?: number) => void;
}

interface State {
  submitting: boolean;
}

export default class UpvoteButton extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = { submitting: false };

    this.handlePress = this.handlePress.bind(this);
  }

  public componentDidUpdate(prevProps: Props) {
    if (this.props.isUpvotedByLoggedInUser !== prevProps.isUpvotedByLoggedInUser) {
      this.setState({ submitting: false });
    }
  }

  public render() {
    const { count, isUpvotedByLoggedInUser } = this.props;
    const { submitting } = this.state;
    const activeColor = isUpvotedByLoggedInUser ? '#FF5A00' : '#FFF';

    return (
      <HQSubmitButton
        onPress={this.handlePress}
        submitting={submitting}
        activityIndicatorColor={activeColor}
      >
        <UpvoteIcon fill={activeColor} />
        {count > 0 && (
          <HQText
            style={[hqStyles.ml1, hqStyles.primaryButtonText, { color: activeColor }]}
          >
            {count}
          </HQText>
        )}
      </HQSubmitButton>
    );
  }

  private handlePress(): void {
    const { answerId, commentId, isUpvotedByLoggedInUser } = this.props;
    this.setState({ submitting: true },
      () => this.props.onUpvote(!isUpvotedByLoggedInUser, answerId, commentId));
  }
}
