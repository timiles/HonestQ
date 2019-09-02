import React from 'react';
import { ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import WatchIcon from '../svg-icons/WatchIcon';
import ThemeService from '../ThemeService';

interface Props {
  onChangeWatch: (watching: boolean) => void;
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
    const activeColor = watching ? '#FF5A00' : ThemeService.getNavTextColor();

    return (
      <TouchableOpacity
        onPress={this.handlePress}
        disabled={submitting}
      >
        {submitting ?
          <ActivityIndicator color={activeColor} style={styles.activityIndicatorWidth} /> :
          <WatchIcon fill={activeColor} />
        }
      </TouchableOpacity>
    );
  }

  private handlePress(): void {
    this.setState({ submitting: true },
      () => this.props.onChangeWatch(!this.props.watching));
  }
}

// tslint:disable:no-object-literal-type-assertion
const styles = StyleSheet.create({
  activityIndicatorWidth: {
    width: WatchIcon.getWidth(),
  } as ViewStyle,
});
