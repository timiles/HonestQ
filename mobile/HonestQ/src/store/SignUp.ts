import { Reducer } from 'redux';
import { AppThunkAction } from '.';
import { LoggedInUserModel, SignUpFormModel } from '../server-models';
import { postJson } from '../utils/http-utils';
import { registerForPushNotificationsAsync } from '../utils/notification-utils';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface SignUpState {
  submitting: boolean;
  submitted: boolean;
  success: boolean;
  error?: string;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.

interface SignUpFormRequestAction {
  type: 'SIGNUP_FORM_REQUEST';
}
export interface SignUpFormSuccessAction {
  type: 'SIGNUP_FORM_SUCCESS';
  payload: LoggedInUserModel;
}
interface SignUpFormFailureAction {
  type: 'SIGNUP_FORM_FAILURE';
  payload: { reason: string; };
}
interface SignUpFormResetAction {
  type: 'SIGNUP_FORM_RESET';
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction =
  | SignUpFormRequestAction
  | SignUpFormSuccessAction
  | SignUpFormFailureAction
  | SignUpFormResetAction
  ;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {

  submit: (form: SignUpFormModel, confirmPassword: string):
    AppThunkAction<KnownAction> => (dispatch, getState) => {
      return (async () => {
        dispatch({ type: 'SIGNUP_FORM_REQUEST' });

        if (!form.username || !form.password || form.password.length < 7 || form.password !== confirmPassword) {
          // Don't set an error message, the validation properties will display instead
          dispatch({ type: 'SIGNUP_FORM_FAILURE', payload: { reason: null } });
          return;
        }

        postJson<LoggedInUserModel>('/api/account/signup', form, null)
          .then((response) => {
            // Re-register push token for this user account
            registerForPushNotificationsAsync(response);

            dispatch({ type: 'SIGNUP_FORM_SUCCESS', payload: response });
          })
          .catch((reason) => {
            dispatch({ type: 'SIGNUP_FORM_FAILURE', payload: { reason } });
          });
      })();
    },
  reset: (): AppThunkAction<KnownAction> => (dispatch) => {
    return (async () => { dispatch({ type: 'SIGNUP_FORM_RESET' }); })();
  },
};

// ----------------
// REDUCER - For a given state and action, returns the new state.
// To support time travel, this must not mutate the old state.

const defaultState: SignUpState = {
  submitting: false,
  submitted: false,
  success: false,
  error: undefined,
};

export const reducer: Reducer<SignUpState> = (state: SignUpState, action: KnownAction) => {
  switch (action.type) {

    case 'SIGNUP_FORM_REQUEST':
      return {
        submitting: true,
        submitted: true,
        success: false,
        error: undefined,
      };
    case 'SIGNUP_FORM_SUCCESS':
      return {
        submitting: false,
        submitted: false,
        success: true,
        error: undefined,
      };
    case 'SIGNUP_FORM_FAILURE':
      return {
        submitting: false,
        submitted: true,
        success: false,
        error: action.payload.reason,
      };
    case 'SIGNUP_FORM_RESET':
      return defaultState;

    default:
      // The following line guarantees that every action in the KnownAction union has been covered by a case above
      const exhaustiveCheck: never = action;
  }

  return state || defaultState;
};
