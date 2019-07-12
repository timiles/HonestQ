import { Middleware } from 'redux';
import * as Store from './store';
import { LogInSuccessAction } from './store/LogInn';
import { getData, removeData, storeData } from './utils/storage-utils';

export const localStoreMiddleware: Middleware = (store) => (next) => (action) => {

  const loggedInUserStorageKey = '@auth.loggedInUser';
  const state: Store.ApplicationState = store.getState();
  if (!state.auth.loggedInUser) {
    getData(loggedInUserStorageKey,
      (login) => {
        if (login && !state.auth.loggedInUser) {
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
