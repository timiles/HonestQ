import React from 'react';
import { StyleSheet, TextStyle } from 'react-native';
import { HQSubmitButton, HQText } from '../hq-components';
import hqStyles from '../hq-styles';
import WatchIcon from '../svg-icons/WatchIcon';

interface Props {
  onWatch: (on: boolean) => void;
  watching: boolean;
}
interface State {
  submitting: boolean;
}
export default class WatchButton extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = { submitting: false };

    this.handlePress = this.handlePress.bind(this);
  }

  public componentDidUpdate(prevProps: Props) {
    if (this.props.watching !== prevProps.watching) {
      this.setState({ submitting: false });
    }
  }

  public render() {
    const { watching } = this.props;
    const { submitting } = this.state;

    return (
      <HQSubmitButton
        onPress={this.handlePress}
        submitting={submitting}
      >
        <WatchIcon fill={watching ? 'red' : 'white'} />
        {watching ? (
          <HQText
            style={[hqStyles.ml1, hqStyles.primaryButtonText, styles.watching]}
          >
            Watching
          </HQText>
        ) : (
            <HQText
              style={[hqStyles.ml1, hqStyles.primaryButtonText]}
            >
              Watch
            </HQText>
          )}
      </HQSubmitButton>
    );
  }

  private handlePress(): void {
    this.setState({ submitting: true },
      () => this.props.onWatch(!this.props.watching));
  }
}

// tslint:disable:no-object-literal-type-assertion
const styles = StyleSheet.create({
  watching: {
    color: 'red',
  } as TextStyle,
});
