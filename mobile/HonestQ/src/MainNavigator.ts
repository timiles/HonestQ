import { createStackNavigator } from 'react-navigation';
import LogInScreen from './screens/Account/LogInScreen';
import AnswerScreen from './screens/AnswerScreen';
import HomeScreen from './screens/HomeScreen';
import QuestionScreen from './screens/QuestionScreen';
import TagScreen from './screens/TagScreen';

const MainNavigator = createStackNavigator({
  Answer: { screen: AnswerScreen },
  Home: { screen: HomeScreen },
  LogIn: { screen: LogInScreen },
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

export default MainNavigator;
