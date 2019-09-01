import React from 'react';
import { HQSubmitButton, HQText } from '../hq-components';
import hqStyles from '../hq-styles';
import WatchIcon from '../svg-icons/WatchIcon';

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
    const activeColor = watching ? '#FF5A00' : '#FFF';

    return (
      <HQSubmitButton
        onPress={this.handlePress}
        submitting={submitting}
        activityIndicatorColor={activeColor}
      >
        <WatchIcon fill={activeColor} />
        {watching ? (
          <HQText
            style={[hqStyles.ml1, hqStyles.primaryButtonText, { color: activeColor }]}
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
      () => this.props.onChangeWatch(!this.props.watching));
  }
}
