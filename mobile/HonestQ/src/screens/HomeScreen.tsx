import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { NavigationScreenOptions, NavigationScreenProps } from 'react-navigation';
import NotificationsCount from '../components/NotificationsCount';
import { HQNavigationButton } from '../hq-components';
import hqStyles from '../hq-styles';
import NavigationService from '../NavigationService';
import MenuIcon from '../svg-icons/MenuIcon';
import ThemeService from '../ThemeService';

export default class HomeScreen extends React.Component {

  protected static navigationOptions =
    ({ navigation }: NavigationScreenProps): NavigationScreenOptions => {
      return {
        title: 'Home',
        headerLeft: ({ tintColor }) => (
          <TouchableOpacity style={hqStyles.ml1} onPress={() => navigation.openDrawer()}>
            <MenuIcon fill={tintColor} />
          </TouchableOpacity>
        ),
        headerRight: (
          <TouchableOpacity style={hqStyles.mr1} onPress={() => navigation.navigate('Notifications')}>
            <NotificationsCount />
          </TouchableOpacity>
        ),
      };
    }

  public render() {
    return (
      <View style={[ThemeService.getStyles().contentView, hqStyles.p1]}>
        <HQNavigationButton onPress={this.navigateToRecentQuestions} title="Recent Questions" />
      </View>
    );
  }

  private navigateToRecentQuestions() {
    NavigationService.navigate('RecentQuestions');
  }
}
