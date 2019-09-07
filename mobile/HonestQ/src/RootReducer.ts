import { Reducer } from 'react';
import { AnyAction, combineReducers } from 'redux';
import * as StoreModule from './store';
import { LogOutSuccessAction } from './store/LogOut';

export function createRootReducer(): Reducer<StoreModule.ApplicationState, AnyAction> {

  const allReducers = combineReducers<StoreModule.ApplicationState>(StoreModule.reducers);

  const rootReducer = (state: StoreModule.ApplicationState, action: LogOutSuccessAction) => {
    if (action.type === 'LOGOUT_SUCCESS') {
      state = undefined;
    }
    return allReducers(state, action);
  };

  return rootReducer;
}
