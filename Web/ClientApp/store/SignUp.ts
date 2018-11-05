﻿import { Reducer } from 'redux';
import { AppThunkAction } from '.';
import { SignUpFormModel } from '../server-models';
import { postJson } from '../utils';

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

interface SubmitRegistrationFormAction { type: 'SUBMIT_SIGNUP'; payload: SignUpFormModel; }
interface RegistrationSuccessAction { type: 'SIGNUP_SUCCESS'; }
interface RegistrationFailedAction { type: 'SIGNUP_FAILED'; payload: { reason: string; }; }

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction =
    | SubmitRegistrationFormAction
    | RegistrationSuccessAction
    | RegistrationFailedAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {

    submitRegistrationForm: (form: SignUpFormModel): AppThunkAction<KnownAction> => (dispatch, getState) => {
        return (async () => {
            dispatch({ type: 'SUBMIT_SIGNUP', payload: form });

            const user = form;
            if (!user.name || !user.email || !user.username || !user.password || user.password.length < 7) {
                // Don't set an error message, the validation properties will display instead
                dispatch({ type: 'SIGNUP_FAILED', payload: { reason: '' } });
                return;
            }

            postJson('/api/account/signup', user, null)
                .then((response) => {
                    dispatch({ type: 'SIGNUP_SUCCESS' });
                })
                .catch((reason) => {
                    dispatch({ type: 'SIGNUP_FAILED', payload: { reason } });
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

        case 'SUBMIT_SIGNUP':
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
        case 'SIGNUP_FAILED':
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