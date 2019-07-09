import React from 'react';
import { StyleSheet, TextStyle } from 'react-native';
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

    return (
      <HQSubmitButton
        onPress={this.handlePress}
        submitting={submitting}
      >
        <UpvoteIcon fill={isUpvotedByLoggedInUser ? 'red' : 'white'} />
        {count > 0 && (
          <HQText
            style={[hqStyles.ml1, hqStyles.primaryButtonText, isUpvotedByLoggedInUser ? styles.countUpvotedByMe : null]}
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

// tslint:disable:no-object-literal-type-assertion
const styles = StyleSheet.create({
  countUpvotedByMe: {
    color: 'red',
  } as TextStyle,
});
