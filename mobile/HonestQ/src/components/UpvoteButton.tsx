import React from 'react';
import { ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import hqColors from '../hq-colors';
import { HQText } from '../hq-components';
import hqStyles from '../hq-styles';
import UpvoteIcon from '../svg-icons/UpvoteIcon';
import ThemeService from '../ThemeService';

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
    const activeColor = isUpvotedByLoggedInUser ? hqColors.Orange : ThemeService.getNavTextColor();

    return (
      <TouchableOpacity
        style={hqStyles.flexRow}
        onPress={this.handlePress}
        disabled={submitting}
      >
        {submitting ?
          <ActivityIndicator color={activeColor} style={styles.activityIndicatorWidth} /> :
          <UpvoteIcon fill={activeColor} />
        }
        {count > 0 && (
          <HQText
            style={[hqStyles.ml1, hqStyles.primaryButtonText, { color: activeColor }]}
          >
            {count}
          </HQText>
        )}
      </TouchableOpacity>
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
  activityIndicatorWidth: {
    width: UpvoteIcon.getWidth(),
  } as ViewStyle,
});
