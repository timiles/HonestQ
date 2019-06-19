import { createStackNavigator } from 'react-navigation';
import LogInScreen from './screens/Account/LogInScreen';
import HomeScreen from './screens/HomeScreen';
import QuestionScreen from './screens/QuestionScreen';
import TagScreen from './screens/TagScreen';

const MainNavigator = createStackNavigator({
  Home: { screen: HomeScreen },
  LogIn: { screen: LogInScreen },
  Question: { screen: QuestionScreen },
  Tag: { screen: TagScreen },
});

export default MainNavigator;
