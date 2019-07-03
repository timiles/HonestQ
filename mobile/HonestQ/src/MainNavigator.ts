import { createDrawerNavigator, createStackNavigator } from 'react-navigation';
import CustomDrawer from './CustomDrawer';
import LogInScreen from './screens/Account/LogInScreen';
import AnswerScreen from './screens/AnswerScreen';
import HomeScreen from './screens/HomeScreen';
import NewQuestionScreen from './screens/NewQuestionScreen';
import NewTagScreen from './screens/NewTagScreen';
import QuestionScreen from './screens/QuestionScreen';
import TagScreen from './screens/TagScreen';

const AppStack = createStackNavigator({
  Answer: { screen: AnswerScreen },
  Home: { screen: HomeScreen },
  LogIn: { screen: LogInScreen },
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

const DrawerNavigator = createDrawerNavigator(
  {
    Home: { screen: AppStack },
    LogIn: { screen: LogInScreen, navigationOptions: { drawerLabel: 'Log in' } },
  },
  {
    contentComponent: CustomDrawer,
    drawerBackgroundColor: '#28374B',
    contentOptions: {
      activeTintColor: '#FFFFFF',
      inactiveTintColor: '#FFFFFF',
    },
  },
);

export default DrawerNavigator;
