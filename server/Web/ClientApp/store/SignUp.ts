import { Reducer } from 'redux';
import { AppThunkAction } from '.';
import { SignUpFormModel } from '../server-models';
import { postJson } from '../utils/http-utils';

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

interface SignUpRequestAction { type: 'SIGNUP_REQUEST'; payload: SignUpFormModel; }
interface SignUpSuccessAction { type: 'SIGNUP_SUCCESS'; }
interface SignUpFailureAction { type: 'SIGNUP_FAILURE'; payload: { reason: string; }; }

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction =
    | SignUpRequestAction
    | SignUpSuccessAction
    | SignUpFailureAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {

    submitSignUpForm: (form: SignUpFormModel): AppThunkAction<KnownAction> => (dispatch, getState) => {
        return (async () => {
            dispatch({ type: 'SIGNUP_REQUEST', payload: form });

            const user = form;
            if (!user.email || !user.username || !user.password || user.password.length < 7) {
                // Don't set an error message, the validation properties will display instead
                dispatch({ type: 'SIGNUP_FAILURE', payload: { reason: '' } });
                return;
            }

            postJson('/api/account/signup', user, null)
                .then((response) => {
                    dispatch({ type: 'SIGNUP_SUCCESS' });
                })
                .catch((reason) => {
                    dispatch({ type: 'SIGNUP_FAILURE', payload: { reason } });
                });
        })();
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

        case 'SIGNUP_REQUEST':
            return {
                submitting: true,
                submitted: true,
                success: false,
                error: undefined,
            };
        case 'SIGNUP_SUCCESS':
            return {
                submitting: false,
                submitted: true,
                success: true,
                error: undefined,
            };
        case 'SIGNUP_FAILURE':
            return {
                submitting: false,
                submitted: true,
                success: false,
                error: action.payload.reason,
            };

        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    return state || defaultState;
};
