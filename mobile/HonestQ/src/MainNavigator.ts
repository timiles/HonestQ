import { createDrawerNavigator, createStackNavigator } from 'react-navigation';
import CustomDrawer from './CustomDrawer';
import LogInScreen from './screens/Account/LogInScreen';
import SignUpScreen from './screens/Account/SignUpScreen';
import UnauthScreen from './screens/Account/UnauthScreen';
import AnswerScreen from './screens/AnswerScreen';
import HomeScreen from './screens/HomeScreen';
import NewAnswerScreen from './screens/NewAnswerScreen';
import NewCommentScreen from './screens/NewCommentScreen';
import NewQuestionScreen from './screens/NewQuestionScreen';
import NewTagScreen from './screens/NewTagScreen';
import Notifications from './screens/NotificationsScreen';
import QuestionScreen from './screens/QuestionScreen';
import SettingsScreen from './screens/SettingsScreen';
import TagScreen from './screens/TagScreen';
import WatchingAnswersScreen from './screens/WatchingAnswersScreen';
import WatchingQuestionsScreen from './screens/WatchingQuestionsScreen';
import WatchingTagsScreen from './screens/WatchingTagsScreen';
import ThemeService from './ThemeService';

export function createMainNavigator() {

  const backgroundColor = ThemeService.getBackgroundColor();
  const navTextColor = ThemeService.getNavTextColor();

  const AppStack = createStackNavigator({
    Answer: { screen: AnswerScreen },
    Home: { screen: HomeScreen },
    NewAnswer: { screen: NewAnswerScreen },
    NewComment: { screen: NewCommentScreen },
    NewQuestion: { screen: NewQuestionScreen },
    NewTag: { screen: NewTagScreen },
    Notifications: { screen: Notifications },
    Question: { screen: QuestionScreen },
    Settings: { screen: SettingsScreen },
    Tag: { screen: TagScreen },
    WatchingAnswers: { screen: WatchingAnswersScreen },
    WatchingQuestions: { screen: WatchingQuestionsScreen },
    WatchingTags: { screen: WatchingTagsScreen },
  },
    {
      initialRouteName: 'Home',
      defaultNavigationOptions: {
        headerStyle: {
          backgroundColor,
        },
        headerTintColor: navTextColor,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      },
    });

  return createDrawerNavigator({
    App: { screen: AppStack },
    Home: { screen: HomeScreen },
    Notifications: { screen: Notifications },
    WatchingTags: { screen: WatchingTagsScreen },
    WatchingQuestions: { screen: WatchingQuestionsScreen },
    WatchingAnswers: { screen: WatchingAnswersScreen },
    Settings: { screen: SettingsScreen },
  },
    {
      contentComponent: CustomDrawer,
      drawerBackgroundColor: backgroundColor,
      contentOptions: {
        activeTintColor: navTextColor,
        inactiveTintColor: navTextColor,
      },
    });
}

export const UnauthNavigator = createStackNavigator(
  {
    Unauth: { screen: UnauthScreen },
    LogIn: { screen: LogInScreen },
    SignUp: { screen: SignUpScreen },
  }, {
    initialRouteName: 'Unauth',
    defaultNavigationOptions: {
      header: null,
    },
  });
