import React from 'react';
import { Button, StyleSheet, View } from 'react-native';
import { TagNavigationProps } from './TagScreen';

interface Props {
  navigation: any;
}

export default class HomeScreen extends React.Component<Props> {

  protected static navigationOptions = {
    title: 'Welcome',
  };

  public render() {
    return (
      <View style={styles.container}>
        {['a', 'b', 'c'].map((x) =>
          <Button
            key={x}
            title={`Tag ${x}`}
            data-id={x}
            onPress={this.navigateToTag.bind(this, x)}
          />,
        )}
      </View>
    );
  }

  private navigateToTag(tagSlug: string): void {
    const navProps: TagNavigationProps = { slug: tagSlug };
    this.props.navigation.navigate('Tag', navProps);
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
});
