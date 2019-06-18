import { createStackNavigator } from 'react-navigation';
import LogInScreen from './screens/Account/LogInScreen';
import HomeScreen from './screens/HomeScreen';
import TagScreen from './screens/TagScreen';

const MainNavigator = createStackNavigator({
  Home: { screen: HomeScreen },
  LogIn: { screen: LogInScreen },
  Tag: { screen: TagScreen },
});

export default MainNavigator;
