import React from 'react';
import { createAppContainer } from 'react-navigation';
import { Provider } from 'react-redux';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import thunk from 'redux-thunk';
import MainNavigator from './src/MainNavigator';
import * as Store from './src/store';

const Navigation = createAppContainer(MainNavigator);

const store = createStore(combineReducers(Store.reducers), applyMiddleware(thunk));

export default class App extends React.Component {
  public render() {
    return (
      <Provider store={store}>
        <Navigation />
      </Provider>
    );
  }
}
