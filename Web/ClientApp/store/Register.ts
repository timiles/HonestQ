import { fetch } from 'domain-task';
import { push } from 'react-router-redux';
import { Reducer } from 'redux';
import { RegisterFormModel } from '../server-models';
import { AppThunkAction } from './';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface RegisterState {
    submitting: boolean;
    submitted: boolean;
    error?: string;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.

interface ResetRegistrationFormAction { type: 'RESET_REGISTRATION'; }
interface SubmitRegistrationFormAction { type: 'SUBMIT_REGISTRATION'; payload: RegisterFormModel; }
interface RegistrationSuccessAction { type: 'REGISTRATION_SUCCESS'; }
interface RegistrationFailedAction { type: 'REGISTRATION_FAILED'; payload: { reason: string; }; }

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction = ResetRegistrationFormAction
    | SubmitRegistrationFormAction
    | RegistrationSuccessAction
    | RegistrationFailedAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {

    submitRegistrationForm: (form: RegisterFormModel): AppThunkAction<KnownAction> => (dispatch, getState) => {
        return (async () => {
            dispatch({ type: 'SUBMIT_REGISTRATION', payload: form });

            const user = form;
            if (user.firstName && user.lastName && user.username && user.password) {
                const requestOptions: RequestInit = {
                    body: JSON.stringify(user),
                    // Ensure cookie is stored from response
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    method: 'POST',
                };

                fetch('/api/account/register', requestOptions)
                    .then((response) => {
                        dispatch({ type: 'REGISTRATION_SUCCESS' });

                        setTimeout(() => {
                            // REVIEW: `KnownActions | RouterAction` causes other type inference issues. Investigate?
                            dispatch(push('/login') as any);
                            dispatch({ type: 'RESET_REGISTRATION' });
                        }, 2000);
                    })
                    .catch((reason) => {
                        dispatch({ type: 'REGISTRATION_FAILED', payload: { reason } });
                    });
            }
        })();
    },
};

// ----------------
// REDUCER - For a given state and action, returns the new state.
// To support time travel, this must not mutate the old state.

const defaultState: RegisterState = {
    submitting: false,
    submitted: false,
    error: undefined,
};

export const reducer: Reducer<RegisterState> = (state: RegisterState, action: KnownAction) => {
    switch (action.type) {

        case 'RESET_REGISTRATION':
            return defaultState;
        case 'SUBMIT_REGISTRATION':
            return {
                submitting: true,
                submitted: true,
                error: undefined,
            };
        case 'REGISTRATION_SUCCESS':
            return defaultState;
        case 'REGISTRATION_FAILED':
            return {
                submitting: false,
                submitted: true,
                error: action.payload.reason,
            };

        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    return state || defaultState;
};
