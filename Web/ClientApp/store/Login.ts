import { Reducer } from 'redux';
import { AppThunkAction } from '.';
import { LoggedInUserModel, LogInFormModel } from '../server-models';
import { postJson } from '../utils/http-utils';
declare var gtag: (method: string, arg: { [key: string]: string }) => void;

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

interface StartLogInAction { type: 'START_LOGIN'; }
interface LogInSuccessAction { type: 'LOGIN_SUCCESS'; payload: LoggedInUserModel; }
interface LogInFailedAction { type: 'LOGIN_FAILED'; payload: { error: string | null; }; }
interface StartLogOutAction { type: 'START_LOGOUT'; }
export interface LogOutSuccessAction { type: 'LOGOUT_SUCCESS'; }
interface LogOutFailedAction { type: 'LOGOUT_FAILED'; }

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction = StartLogInAction
    | LogInSuccessAction
    | LogInFailedAction
    | StartLogOutAction
    | LogOutSuccessAction
    | LogOutFailedAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    logIn: (logInForm: LogInFormModel): AppThunkAction<KnownAction> => (dispatch, getState) => {
        return (async () => {
            dispatch({ type: 'START_LOGIN' });

            if (!logInForm.username || !logInForm.password) {
                // Don't set an error message, the validation properties will display instead
                dispatch({ type: 'LOGIN_FAILED', payload: { error: null } });
                return;
            }

            postJson<LoggedInUserModel>('/api/account/login', logInForm, null, true)
                .then((logInResponse: LoggedInUserModel) => {
                    // Log in successful if there's a jwt token in the response
                    if (logInResponse && logInResponse.token) {
                        gtag('set', { user_id: `${logInResponse.id}` });
                        dispatch({ type: 'LOGIN_SUCCESS', payload: logInResponse });
                    } else {
                        dispatch({ type: 'LOGIN_FAILED', payload: { error: 'An error occurred, please try again' } });
                    }
                })
                .catch((reason: string) => {
                    dispatch({ type: 'LOGIN_FAILED', payload: { error: reason || 'LogIn failed' } });
                });
        })();
    },
    logOut: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        return (async () => {
            dispatch({ type: 'START_LOGOUT' });

            postJson('/api/account/logout', null, null, true)
                .then(() => {
                    dispatch({ type: 'LOGOUT_SUCCESS' });
                })
                .catch(() => {
                    dispatch({ type: 'LOGOUT_FAILED' });
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
        case 'START_LOGIN':
            return { submitting: true, submitted: true };
        case 'LOGIN_SUCCESS':
            return { submitting: false, submitted: true, loggedInUser: action.payload };
        case 'LOGIN_FAILED':
            return { submitting: false, submitted: true, error: action.payload.error };
        case 'START_LOGOUT':
            return { loggedInUser: state.loggedInUser };
        case 'LOGOUT_SUCCESS':
            return defaultState;
        case 'LOGOUT_FAILED':
            return { loggedInUser: state.loggedInUser };

        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    // For unrecognized actions (or in cases where actions have no effect), must return the existing state
    //  (or default initial state if none was supplied)
    return state || defaultState;
};
