import React from 'react';
import { Text } from 'react-native';
import { NavigationScreenOptions, NavigationScreenProps } from 'react-navigation';
import TagsList from '../components/TagsList';
import { HQContentView } from '../hq-components';

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

  public render() {
    return (
      <HQContentView>
        <TagsList />
      </HQContentView>
    );
  }
}
