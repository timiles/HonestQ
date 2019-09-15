import React from 'react';
import { StyleSheet, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { NavigationScreenOptions, NavigationScreenProps } from 'react-navigation';
import CircleIcon from '../components/CircleIcon';
import NotificationsCount from '../components/NotificationsCount';
import hqColors from '../hq-colors';
import { HQLabel, HQNavigationButton, HQText } from '../hq-components';
import hqStyles from '../hq-styles';
import { LoggedInUserContext } from '../LoggedInUserContext';
import NavigationService from '../NavigationService';
import MenuIcon from '../svg-icons/MenuIcon';
import WatchIcon from '../svg-icons/WatchIcon';
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
        <LoggedInUserContext.Consumer>
          {(user) => <HQText style={[hqStyles.mb1, styles.hi]}>Hi, {user.username}!</HQText>}
        </LoggedInUserContext.Consumer>
        <HQNavigationButton style={hqStyles.mb1} onPress={this.navigateToNewQuestion}>
          <View style={hqStyles.row}>
            <CircleIcon type="?" />
            <HQLabel style={styles.buttonLabel}>Ask a question</HQLabel>
          </View>
        </HQNavigationButton>
        <HQNavigationButton style={hqStyles.mb1} onPress={this.navigateToRecentQuestions}>
          <View style={hqStyles.row}>
            <CircleIcon type="Q" />
            <HQLabel style={styles.buttonLabel}>Recent questions</HQLabel>
          </View>
        </HQNavigationButton>
        <HQNavigationButton style={hqStyles.mb1} onPress={this.navigateToWatching}>
          <View style={hqStyles.row}>
            <View style={styles.watchIconContainer}>
              <WatchIcon fill={hqColors.Orange} width={36} />
            </View>
            <HQLabel style={styles.buttonLabel}>Manage watch list</HQLabel>
          </View>
        </HQNavigationButton>
        <HQNavigationButton style={hqStyles.mb1} onPress={this.navigateToAllTags}>
          <View style={hqStyles.row}>
            <CircleIcon type="#" />
            <HQLabel style={styles.buttonLabel}>Browse all tags</HQLabel>
          </View>
        </HQNavigationButton>
      </View>
    );
  }

  private navigateToAllTags() {
    NavigationService.navigate('AllTags');
  }

  private navigateToNewQuestion() {
    NavigationService.navigate('NewQuestion');
  }

  private navigateToRecentQuestions() {
    NavigationService.navigate('RecentQuestions');
  }

  private navigateToWatching() {
    NavigationService.navigate('Watching');
  }
}

// tslint:disable:no-object-literal-type-assertion
const styles = StyleSheet.create({
  hi: {
    fontSize: 24,
  } as TextStyle,

  buttonLabel: {
    fontSize: 24,
    marginLeft: 5,
  } as TextStyle,

  watchIconContainer: {
    margin: 5,
  } as ViewStyle,
});
