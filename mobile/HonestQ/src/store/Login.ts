import { Reducer } from 'redux';
import { AppThunkAction } from '.';
import { LoggedInUserModel, LogInFormModel } from '../server-models';
import { postJson } from '../utils/http-utils';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface LoginState {
  loggedInUser?: LoggedInUserModel;
  submitting?: boolean;
  submitted?: boolean;
  error?: string | null;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

interface LogInRequestAction { type: 'LOGIN_REQUEST'; }
export interface LogInSuccessAction { type: 'LOGIN_SUCCESS'; payload: LoggedInUserModel; }
interface LogInFailureAction { type: 'LOGIN_FAILURE'; payload: { error: string | null; }; }
interface LogOutRequestAction { type: 'LOGOUT_REQUEST'; }
export interface LogOutSuccessAction { type: 'LOGOUT_SUCCESS'; }
interface LogOutFailureAction { type: 'LOGOUT_FAILURE'; }

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction = LogInRequestAction
  | LogInSuccessAction
  | LogInFailureAction
  | LogOutRequestAction
  | LogOutSuccessAction
  | LogOutFailureAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
  logIn: (logInForm: LogInFormModel): AppThunkAction<KnownAction> => (dispatch, getState) => {
    return (async () => {
      dispatch({ type: 'LOGIN_REQUEST' });

      if (!logInForm.username || !logInForm.password) {
        // Don't set an error message, the validation properties will display instead
        dispatch({ type: 'LOGIN_FAILURE', payload: { error: null } });
        return;
      }

      postJson<LoggedInUserModel>('/api/account/login', logInForm, null, true)
        .then((logInResponse: LoggedInUserModel) => {
          // Log in successful if there's a jwt token in the response
          if (logInResponse && logInResponse.token) {
            dispatch({ type: 'LOGIN_SUCCESS', payload: logInResponse });
          } else {
            dispatch({ type: 'LOGIN_FAILURE', payload: { error: 'An error occurred, please try again' } });
          }
        })
        .catch((reason: string) => {
          dispatch({ type: 'LOGIN_FAILURE', payload: { error: reason || 'LogIn failed' } });
        });
    })();
  },
  logOut: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
    return (async () => {
      dispatch({ type: 'LOGOUT_REQUEST' });

      postJson('/api/account/logout', null, null, true)
        .then(() => {
          dispatch({ type: 'LOGOUT_SUCCESS' });
        })
        .catch(() => {
          dispatch({ type: 'LOGOUT_FAILURE' });
        });
    })();
  },
};

// ----------------
// REDUCER - For a given state and action, returns the new state.
// To support time travel, this must not mutate the old state.

const defaultState: LoginState = {};

export const reducer: Reducer<LoginState> = (state: LoginState, action: KnownAction) => {
  switch (action.type) {
    case 'LOGIN_REQUEST':
      return { submitting: true, submitted: true };
    case 'LOGIN_SUCCESS':
      return { submitting: false, submitted: true, loggedInUser: action.payload };
    case 'LOGIN_FAILURE':
      return { submitting: false, submitted: true, error: action.payload.error };
    case 'LOGOUT_REQUEST':
      return { loggedInUser: state.loggedInUser };
    case 'LOGOUT_SUCCESS':
      return defaultState;
    case 'LOGOUT_FAILURE':
      return { loggedInUser: state.loggedInUser };

    default:
      // The following line guarantees that every action in the KnownAction union has been covered by a case above
      const exhaustiveCheck: never = action;
  }

  // For unrecognized actions (or in cases where actions have no effect), must return the existing state
  //  (or default initial state if none was supplied)
  return state || defaultState;
};
