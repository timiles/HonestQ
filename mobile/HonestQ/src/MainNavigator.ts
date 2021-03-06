import { createDrawerNavigator, createMaterialTopTabNavigator, createStackNavigator } from 'react-navigation';
import CustomDrawer from './CustomDrawer';
import hqColors from './hq-colors';
import LogInScreen from './screens/Account/LogInScreen';
import SignUpScreen from './screens/Account/SignUpScreen';
import UnauthScreen from './screens/Account/UnauthScreen';
import AllTagsScreen from './screens/AllTagsScreen';
import AnswerScreen from './screens/AnswerScreen';
import HomeScreen from './screens/HomeScreen';
import NewAnswerScreen from './screens/NewAnswerScreen';
import NewCommentScreen from './screens/NewCommentScreen';
import NewQuestionScreen from './screens/NewQuestionScreen';
import NewTagScreen from './screens/NewTagScreen';
import Notifications from './screens/NotificationsScreen';
import PrivacyPolicyScreen from './screens/PrivacyPolicyScreen';
import QuestionScreen from './screens/QuestionScreen';
import RecentQuestionsScreen from './screens/RecentQuestionsScreen';
import ReportScreen from './screens/ReportScreen';
import SettingsScreen from './screens/SettingsScreen';
import TagScreen from './screens/TagScreen';
import TermsOfServiceScreen from './screens/TermsOfServiceScreen';
import WatchingAnswersScreen from './screens/WatchingAnswersScreen';
import WatchingQuestionsScreen from './screens/WatchingQuestionsScreen';
import WatchingTagsScreen from './screens/WatchingTagsScreen';
import ThemeService from './ThemeService';

export function createMainNavigator() {

  const backgroundColor = ThemeService.getBackgroundColor();
  const navTextColor = ThemeService.getNavTextColor();

  const WatchingTabNavigator = createMaterialTopTabNavigator({
    WatchingTags: { screen: WatchingTagsScreen },
    WatchingQuestions: { screen: WatchingQuestionsScreen },
    WatchingAnswers: { screen: WatchingAnswersScreen },
  },
    {
      navigationOptions: {
        title: 'Watch list',
      },
      tabBarOptions: {
        indicatorStyle: {
          backgroundColor: hqColors.Orange,
        },
        upperCaseLabel: false,
      },
    });

  const AppStack = createStackNavigator({
    AllTags: { screen: AllTagsScreen },
    Answer: { screen: AnswerScreen },
    Home: { screen: HomeScreen },
    NewAnswer: { screen: NewAnswerScreen },
    NewComment: { screen: NewCommentScreen },
    NewQuestion: { screen: NewQuestionScreen },
    NewTag: { screen: NewTagScreen },
    Notifications: { screen: Notifications },
    Question: { screen: QuestionScreen },
    RecentQuestions: { screen: RecentQuestionsScreen },
    Report: { screen: ReportScreen },
    Settings: { screen: SettingsScreen },
    Tag: { screen: TagScreen },
    Watching: { screen: WatchingTabNavigator },
    TermsOfService: { screen: TermsOfServiceScreen },
    PrivacyPolicy: { screen: PrivacyPolicyScreen },
  },
    {
      initialRouteName: 'Home',
      defaultNavigationOptions: {
        headerStyle: {
          backgroundColor,
        },
        headerTintColor: navTextColor,
        headerTitleStyle: {
          fontFamily: 'Nexa Bold',
          fontWeight: 'normal',
        },
      },
    });

  return createDrawerNavigator({
    AllTags: { screen: AllTagsScreen },
    App: { screen: AppStack },
    Home: { screen: HomeScreen },
    Notifications: { screen: Notifications },
    RecentQuestions: { screen: RecentQuestionsScreen },
    Watching: { screen: WatchingTabNavigator },
    Settings: { screen: SettingsScreen },
    TermsOfService: { screen: TermsOfServiceScreen },
    PrivacyPolicy: { screen: PrivacyPolicyScreen },
  },
    {
      contentComponent: CustomDrawer,
      drawerBackgroundColor: backgroundColor,
      contentOptions: {
        activeTintColor: navTextColor,
        inactiveTintColor: navTextColor,
      },
      order: ['App', 'Home', 'Notifications', 'Watching', 'AllTags', 'RecentQuestions', 'Settings'],
    });
}

export function createUnauthNavigator() {

  const backgroundColor = ThemeService.getBackgroundColor();
  const navTextColor = ThemeService.getNavTextColor();

  const UnauthNavigator = createStackNavigator({
    Unauth: { screen: UnauthScreen, navigationOptions: { header: null } },
    LogIn: { screen: LogInScreen },
    SignUp: { screen: SignUpScreen },
    TermsOfService: { screen: TermsOfServiceScreen },
    PrivacyPolicy: { screen: PrivacyPolicyScreen },
  }, {
    initialRouteName: 'Unauth',
    defaultNavigationOptions: {
      headerStyle: {
        backgroundColor,
      },
      headerTintColor: navTextColor,
      headerTitleStyle: {
        fontFamily: 'Nexa Bold',
        fontWeight: 'normal',
      },
    },
  });

  return UnauthNavigator;
}
