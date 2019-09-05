import { Reducer } from 'redux';
import { AppThunkAction } from '.';
import { LoggedInUserModel, LogInFormModel } from '../server-models';
import { postJson } from '../utils/http-utils';
import { registerForPushNotificationsAsync } from '../utils/notification-utils';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface LogInState {
  submitting?: boolean;
  submitted?: boolean;
  error?: string | null;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

interface LogInFormRequestAction {
  type: 'LOGIN_FORM_REQUEST';
}
export interface LogInFormSuccessAction {
  type: 'LOGIN_FORM_SUCCESS';
  payload: LoggedInUserModel;
}
interface LogInFormFailureAction {
  type: 'LOGIN_FORM_FAILURE';
  payload: { error: string | null; };
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction =
  | LogInFormRequestAction
  | LogInFormSuccessAction
  | LogInFormFailureAction
  ;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
  submit: (logInForm: LogInFormModel): AppThunkAction<KnownAction> => (dispatch, getState) => {
    return (async () => {
      dispatch({ type: 'LOGIN_FORM_REQUEST' });

      if (!logInForm.username || !logInForm.password) {
        // Don't set an error message, the validation properties will display instead
        dispatch({ type: 'LOGIN_FORM_FAILURE', payload: { error: null } });
        return;
      }

      postJson<LoggedInUserModel>('/api/account/login', logInForm, null, true)
        .then((logInResponse: LoggedInUserModel) => {
          // Log in successful if there's a jwt token in the response
          if (logInResponse && logInResponse.token) {
            // Re-register push token for this user account
            registerForPushNotificationsAsync(logInResponse);

            dispatch({ type: 'LOGIN_FORM_SUCCESS', payload: logInResponse });
          } else {
            dispatch({ type: 'LOGIN_FORM_FAILURE', payload: { error: 'An error occurred, please try again' } });
          }
        })
        .catch((reason: string) => {
          dispatch({ type: 'LOGIN_FORM_FAILURE', payload: { error: reason || 'LogIn failed' } });
        });
    })();
  },
};

// ----------------
// REDUCER - For a given state and action, returns the new state.
// To support time travel, this must not mutate the old state.

const defaultState: LogInState = {};

export const reducer: Reducer<LogInState> = (state: LogInState, action: KnownAction) => {
  switch (action.type) {
    case 'LOGIN_FORM_REQUEST':
      return { submitting: true, submitted: true };
    case 'LOGIN_FORM_SUCCESS':
      return { submitting: false, submitted: true };
    case 'LOGIN_FORM_FAILURE':
      return { submitting: false, submitted: true, error: action.payload.error };

    default:
      // The following line guarantees that every action in the KnownAction union has been covered by a case above
      const exhaustiveCheck: never = action;
  }

  // For unrecognized actions (or in cases where actions have no effect), must return the existing state
  //  (or default initial state if none was supplied)
  return state || defaultState;
};
