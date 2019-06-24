import React from 'react';
import { Text } from 'react-native';
import { NavigationScreenOptions, NavigationScreenProps } from 'react-navigation';
import LoggedInUserInfo from '../components/LoggedInUserInfo';
import TagsList from '../components/TagsList';
import { HQContentView } from '../hq-components';
import { TagNavigationProps } from './TagScreen';

interface Props {
  navigation: any;
}

export default class HomeScreen extends React.Component<Props> {

  protected static navigationOptions =
    ({ navigation }: NavigationScreenProps): NavigationScreenOptions => {
      return {
        title: 'Welcome to HonestQ',
        headerLeft: ({ tintColor }) => (
          <Text style={{ color: tintColor }} onPress={() => navigation.openDrawer()}>Menu</Text>
        ),
      };
    }

  public constructor(props: Props) {
    super(props);

    this.navigateToTag = this.navigateToTag.bind(this);
  }

  public render() {
    return (
      <HQContentView>
        <LoggedInUserInfo navigation={this.props.navigation} />
        <TagsList navigateToTagScreen={this.navigateToTag} />
      </HQContentView>
    );
  }

  private navigateToTag(tagSlug: string, tagName: string): void {
    const navProps: TagNavigationProps = { tagSlug, tagName };
    this.props.navigation.navigate('Tag', navProps);
  }
}
