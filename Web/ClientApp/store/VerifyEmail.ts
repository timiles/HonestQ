import { Reducer } from 'redux';
import { AppThunkAction } from '.';
import { VerifyEmailFormModel, VerifyEmailResponseModel } from '../server-models';
import { postJson } from '../utils';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface VerifyEmailState {
    submitting?: boolean | null;
    success?: boolean | null;
    error?: string | null;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

interface StartVerifyEmailAction { type: 'VERIFY_EMAIL_REQUESTED'; }
interface VerifyEmailSuccessAction { type: 'VERIFY_EMAIL_SUCCESS'; }
interface VerifyEmailFailedAction { type: 'VERIFY_EMAIL_FAILED'; payload: { error: string | null; }; }

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction =
    | StartVerifyEmailAction
    | VerifyEmailSuccessAction
    | VerifyEmailFailedAction
    ;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    verifyEmail: (verifyEmailForm: VerifyEmailFormModel): AppThunkAction<KnownAction> => (dispatch, getState) => {
        return (async () => {
            dispatch({ type: 'VERIFY_EMAIL_REQUESTED' });

            postJson<VerifyEmailResponseModel>('/api/account/verifyemail', verifyEmailForm, null, false, true)
                .then((response: VerifyEmailResponseModel) => {
                    if (response.success) {
                        dispatch({ type: 'VERIFY_EMAIL_SUCCESS' });
                    } else {
                        dispatch({ type: 'VERIFY_EMAIL_FAILED', payload: { error: response.error } });
                    }
                })
                .catch((reason: string) => {
                    dispatch({ type: 'VERIFY_EMAIL_FAILED', payload: { error: reason || 'VerifyEmail failed' } });
                });
        })();
    },
};

// ----------------
// REDUCER - For a given state and action, returns the new state.
// To support time travel, this must not mutate the old state.

const defaultState: VerifyEmailState = {};

export const reducer: Reducer<VerifyEmailState> = (state: VerifyEmailState, action: KnownAction) => {
    switch (action.type) {
        case 'VERIFY_EMAIL_REQUESTED':
            return { submitting: true };
        case 'VERIFY_EMAIL_SUCCESS':
            return { success: true };
        case 'VERIFY_EMAIL_FAILED':
            return { success: false, error: action.payload.error };
        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    // For unrecognized actions (or in cases where actions have no effect), must return the existing state
    //  (or default initial state if none was supplied)
    return state || defaultState;
};
