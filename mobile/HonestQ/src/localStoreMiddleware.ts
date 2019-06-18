import { Middleware } from 'redux';
import * as Store from './store';
import { LogInSuccessAction } from './store/Login';
import { getData, removeData, storeData } from './utils/storage-utils';

export const localStoreMiddleware: Middleware = (store) => (next) => (action) => {

  const loggedInUserStorageKey = '@login.loggedInUser';
  const state: Store.ApplicationState = store.getState();
  if (!state.login.loggedInUser) {
    getData(loggedInUserStorageKey,
      (login) => {
        if (login && !state.login.loggedInUser) {
          const logInSuccessAction: LogInSuccessAction = { type: 'LOGIN_SUCCESS', payload: login };
          store.dispatch(logInSuccessAction);
        }
      });
  }

  switch (action.type) {
    case 'LOGIN_SUCCESS': {
      storeData(loggedInUserStorageKey, action.payload);
      break;
    }
    case 'LOGOUT_SUCCESS': {
      removeData(loggedInUserStorageKey);
      break;
    }
  }

  next(action);
};
