import { createDrawerNavigator, createStackNavigator } from 'react-navigation';
import CustomDrawer from './CustomDrawer';
import LogInScreen from './screens/Account/LogInScreen';
import SignUpScreen from './screens/Account/SignUpScreen';
import UnauthScreen from './screens/Account/UnauthScreen';
import AnswerScreen from './screens/AnswerScreen';
import HomeScreen from './screens/HomeScreen';
import NewAnswerScreen from './screens/NewAnswerScreen';
import NewQuestionScreen from './screens/NewQuestionScreen';
import NewTagScreen from './screens/NewTagScreen';
import QuestionScreen from './screens/QuestionScreen';
import TagScreen from './screens/TagScreen';

const AppStack = createStackNavigator({
  Answer: { screen: AnswerScreen },
  Home: { screen: HomeScreen },
  NewAnswer: { screen: NewAnswerScreen },
  NewQuestion: { screen: NewQuestionScreen },
  NewTag: { screen: NewTagScreen },
  Question: { screen: QuestionScreen },
  Tag: { screen: TagScreen },
},
  {
    initialRouteName: 'Home',
    defaultNavigationOptions: {
      headerStyle: {
        backgroundColor: '#28374B',
      },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    },
  });

export const MainNavigator = createDrawerNavigator(
  {
    Home: { screen: AppStack },
  },
  {
    contentComponent: CustomDrawer,
    drawerBackgroundColor: '#28374B',
    contentOptions: {
      activeTintColor: '#FFFFFF',
      inactiveTintColor: '#FFFFFF',
    },
  });

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
