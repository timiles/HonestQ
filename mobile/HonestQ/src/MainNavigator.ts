import { createStackNavigator } from 'react-navigation';
import HomeScreen from './screens/HomeScreen';
import TagScreen from './screens/TagScreen';

const MainNavigator = createStackNavigator({
  Home: { screen: HomeScreen },
  Tag: { screen: TagScreen },
});

export default MainNavigator;
