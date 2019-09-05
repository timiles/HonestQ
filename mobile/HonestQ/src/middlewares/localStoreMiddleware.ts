import { Middleware } from 'redux';
import { LogInFormSuccessAction } from '../store/LogIn';
import { LogOutSuccessAction } from '../store/LogOut';
import { SignUpFormSuccessAction } from '../store/SignUp';
import { SetThemeSuccessAction } from '../store/ThemeSetting';
import { removeData, storeData } from '../utils/storage-utils';

export const themeStorageKey = '@themeSetting.theme';
export const loggedInUserStorageKey = '@auth.loggedInUser';

type KnownAction =
  | LogInFormSuccessAction
  | SignUpFormSuccessAction
  | SetThemeSuccessAction
  | LogOutSuccessAction
  ;

export const localStoreMiddleware: Middleware = (store) => (next) => (action: KnownAction) => {

  switch (action.type) {
    case 'LOGIN_FORM_SUCCESS': {
      storeData(loggedInUserStorageKey, action.payload);
      break;
    }
    case 'SIGNUP_FORM_SUCCESS': {
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

    default:
      // The following line guarantees that every action in the KnownAction union has been covered by a case above
      const exhaustiveCheck: never = action;
  }

  next(action);
};
