import React from 'react';
import { Text, View } from 'react-native';
import { NavigationScreenOptions, NavigationScreenProps } from 'react-navigation';
import TagsList from '../components/TagsList';
import ThemeService from '../ThemeService';

interface Props {
  navigation: any;
}

export default class HomeScreen extends React.Component<Props> {

  protected static navigationOptions =
    ({ navigation }: NavigationScreenProps): NavigationScreenOptions => {
      return {
        title: 'Home',
        headerLeft: ({ tintColor }) => (
          <Text style={{ color: tintColor }} onPress={() => navigation.openDrawer()}>Menu</Text>
        ),
      };
    }

  public render() {

    return (
      <View style={ThemeService.getStyles().contentView}>
        <TagsList />
      </View>
    );
  }
}
