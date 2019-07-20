import { Middleware } from 'redux';
import { removeData, storeData } from './utils/storage-utils';

export const themeStorageKey = '@themeSetting.theme';
export const loggedInUserStorageKey = '@auth.loggedInUser';

export const localStoreMiddleware: Middleware = (store) => (next) => (action) => {

  switch (action.type) {
    case 'LOGIN_SUCCESS': {
      storeData(loggedInUserStorageKey, action.payload);
      break;
    }
    case 'SIGNUP_SUCCESS': {
      storeData(loggedInUserStorageKey, action.payload);
      break;
    }
    case 'SET_THEME_SUCCESS': {
      storeData(themeStorageKey, action.payload.theme);
      break;
    }
    case 'LOGOUT_SUCCESS': {
      removeData(loggedInUserStorageKey);
      break;
    }
  }

  next(action);
};
