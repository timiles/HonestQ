import React, { Component } from 'react';
import { EmitterSubscription, Keyboard, KeyboardEvent, ScrollView, ScrollViewProps, View } from 'react-native';

interface State {
  keyboardHeight: number;
}

export default class KeyboardPaddedScrollView extends Component<ScrollViewProps, State> {

  private scrollViewRef: React.RefObject<ScrollView>;
  private keyboardDidShowSub: EmitterSubscription;
  private keyboardDidHideSub: EmitterSubscription;

  constructor(props: {}) {
    super(props);

    this.state = {
      keyboardHeight: 0,
    };

    this.scrollViewRef = React.createRef<ScrollView>();
  }

  public componentDidMount() {
    this.keyboardDidShowSub = Keyboard.addListener('keyboardDidShow', this.handleKeyboardDidShow.bind(this));
    this.keyboardDidHideSub = Keyboard.addListener('keyboardDidHide', this.handleKeyboardDidHide.bind(this));
  }

  public componentWillUnmount() {
    this.keyboardDidShowSub.remove();
    this.keyboardDidHideSub.remove();
  }

  public componentDidUpdate() {
    if (this.state.keyboardHeight > 0) {
      this.scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }

  public render() {
    const { style, contentContainerStyle, children } = this.props;
    const { keyboardHeight } = this.state;

    return (
      <ScrollView
        ref={this.scrollViewRef}
        style={style}
        contentContainerStyle={contentContainerStyle}
        keyboardShouldPersistTaps="handled"
      >
        {children}
        <View style={{ height: keyboardHeight }} />
      </ScrollView>
    );
  }

  private handleKeyboardDidShow(event: KeyboardEvent) {
    const keyboardHeight = event.endCoordinates.height;
    this.setState({ keyboardHeight });
  }

  private handleKeyboardDidHide() {
    this.setState({ keyboardHeight: 0 });
  }
}
