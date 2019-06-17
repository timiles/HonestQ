import React from 'react';
import { StyleSheet, View } from 'react-native';
import TagsList from '../components/TagsList';
import { TagNavigationProps } from './TagScreen';

interface Props {
  navigation: any;
}

export default class HomeScreen extends React.Component<Props> {

  protected static navigationOptions = {
    title: 'Welcome',
  };

  public constructor(props: Props) {
    super(props);

    this.navigateToTag = this.navigateToTag.bind(this);
  }

  public render() {
    return (
      <View style={styles.container}>
        <TagsList navigateToTagScreen={this.navigateToTag} />
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
