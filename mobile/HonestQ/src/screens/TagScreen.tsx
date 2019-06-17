import React from 'react';
import { Text } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';

export interface TagNavigationProps {
  slug: string;
}

interface Props {
  navigation: NavigationScreenProp<{}, TagNavigationProps>;
}

export default class TagScreen extends React.Component<Props> {
  public render() {
    const { slug } = this.props.navigation.state.params;
    return (
      <Text>Tag slug: {slug}</Text>
    );
  }
}
