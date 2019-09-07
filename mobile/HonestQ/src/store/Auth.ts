import { Reducer } from 'redux';
import { LoggedInUserModel } from '../server-models';
import { LogInFormSuccessAction } from './LogIn';
import { SignUpFormSuccessAction } from './SignUp';

export interface AuthState {
  loggedInUser?: LoggedInUserModel;
}

type KnownAction =
  | LogInFormSuccessAction
  | SignUpFormSuccessAction
  ;

const defaultState: AuthState = {};

export const reducer: Reducer<AuthState> = (state: AuthState, action: KnownAction) => {
  switch (action.type) {
    case 'LOGIN_FORM_SUCCESS':
      return { loggedInUser: action.payload };
    case 'SIGNUP_FORM_SUCCESS':
      return { loggedInUser: action.payload };

    default:
      // The following line guarantees that every action in the KnownAction union has been covered by a case above
      const exhaustiveCheck: never = action;
  }

  // For unrecognized actions (or in cases where actions have no effect), must return the existing state
  //  (or default initial state if none was supplied)
  return state || defaultState;
};
