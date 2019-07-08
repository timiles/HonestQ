import * as Font from 'expo-font';
import React from 'react';
import FlashMessage, { DefaultFlash, MessageComponentProps } from 'react-native-flash-message';
import { createAppContainer } from 'react-navigation';
import { Provider } from 'react-redux';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import thunk from 'redux-thunk';
import { HQContentView } from './src/hq-components';
import hqStyles from './src/hq-styles';
import { localStoreMiddleware } from './src/localStoreMiddleware';
import MainNavigator from './src/MainNavigator';
import NavigationService from './src/NavigationService';
import * as Store from './src/store';

const Navigation = createAppContainer(MainNavigator);

const store = createStore(combineReducers(Store.reducers), applyMiddleware(thunk, localStoreMiddleware));

interface State {
  assetsLoaded: boolean;
}

export default class App extends React.Component<{}, State> {

  public constructor(props: {}) {
    super(props);

    this.state = { assetsLoaded: false };
  }

  public async componentDidMount() {
    await Font.loadAsync({
      'lineto-circular-book': require('./assets/fonts/lineto-circular-book.ttf'),
      'Nexa Bold': require('./assets/fonts/Nexa_Bold.otf'),
    });

    this.setState({ assetsLoaded: true });
  }

  public render() {
    if (!this.state.assetsLoaded) {
      return <HQContentView />;
    }

    const hqFlashMessageComponent: React.SFC<MessageComponentProps> = (props) =>
      <DefaultFlash {...props} titleStyle={hqStyles.pr1} textStyle={hqStyles.pr1} />;

    return (
      <HQContentView>
        <Provider store={store}>
          <Navigation ref={(navigatorRef) => { NavigationService.setTopLevelNavigator(navigatorRef); }} />
        </Provider>
        <FlashMessage position="top" MessageComponent={hqFlashMessageComponent} />
      </HQContentView>
    );
  }
}
