import { Reducer } from 'redux';
import { AppThunkAction } from '.';
import { postJson } from '../utils/http-utils';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface LogOutState {
  submitting?: boolean;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

interface LogOutRequestAction { type: 'LOGOUT_REQUEST'; }
export interface LogOutSuccessAction { type: 'LOGOUT_SUCCESS'; }
interface LogOutFailureAction { type: 'LOGOUT_FAILURE'; }

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction =
  | LogOutRequestAction
  | LogOutSuccessAction
  | LogOutFailureAction
  ;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
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

const defaultState: LogOutState = {};

export const reducer: Reducer<LogOutState> = (state: LogOutState, action: KnownAction) => {
  switch (action.type) {
    case 'LOGOUT_REQUEST':
      return { submitting: true };
    case 'LOGOUT_FAILURE':
      return { submitting: false };
    case 'LOGOUT_SUCCESS':
      return { submitting: false };

    default:
      // The following line guarantees that every action in the KnownAction union has been covered by a case above
      const exhaustiveCheck: never = action;
  }

  // For unrecognized actions (or in cases where actions have no effect), must return the existing state
  //  (or default initial state if none was supplied)
  return state || defaultState;
};
