import { Font } from 'expo';
import React from 'react';
import { View } from 'react-native';
import { createAppContainer } from 'react-navigation';
import { Provider } from 'react-redux';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import thunk from 'redux-thunk';
import { localStoreMiddleware } from './src/localStoreMiddleware';
import MainNavigator from './src/MainNavigator';
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
    const loadTask1 = Font.loadAsync({
      'lineto-circular-book': require('./assets/fonts/lineto-circular-book.ttf'),
    });
    const loadTask2 = Font.loadAsync({
      'Nexa Bold': require('./assets/fonts/Nexa_Bold.otf'),
    });

    await loadTask1;
    await loadTask2;
    this.setState({ assetsLoaded: true });
  }

  public render() {
    if (!this.state.assetsLoaded) {
      return <View style={{ flex: 1, backgroundColor: '#28374B' }} />;
    }
    return (
      <Provider store={store}>
        <Navigation />
      </Provider>
    );
  }
}
