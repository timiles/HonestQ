﻿import { Reducer } from 'redux';
import { AppThunkAction } from '.';
import { TagFormModel } from '../server-models';
import { postJson } from '../utils/http-utils';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface NewTagState {
    previouslySubmittedTagFormModel?: TagFormModel;
    submitting?: boolean;
    submitted?: boolean;
    error?: string | null;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

interface TagFormSubmittedAction { type: 'TOPIC_FORM_SUBMITTED'; }
interface TagFormReceivedAction { type: 'TOPIC_FORM_RECEIVED'; payload: { tag: TagFormModel; }; }
interface TagFormFailedAction { type: 'TOPIC_FORM_FAILED'; payload: { error: string | null; }; }

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction = TagFormSubmittedAction
    | TagFormReceivedAction
    | TagFormFailedAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    submit: (tagForm: TagFormModel): AppThunkAction<KnownAction> => (dispatch, getState) => {
        return (async () => {
            dispatch({ type: 'TOPIC_FORM_SUBMITTED' });

            if (!tagForm.name) {
                // Don't set an error message, the validation properties will display instead
                dispatch({ type: 'TOPIC_FORM_FAILED', payload: { error: null } });
                return;
            }

            postJson('/api/tags', tagForm, getState().login.loggedInUser!)
                .then(() => {
                    dispatch({ type: 'TOPIC_FORM_RECEIVED', payload: { tag: tagForm } });
                })
                .catch((reason: string) => {
                    dispatch({ type: 'TOPIC_FORM_FAILED', payload: { error: reason } });
                });
        })();
    },
};

// ----------------
// REDUCER - For a given state and action, returns the new state.
// To support time travel, this must not mutate the old state.

const defaultState: NewTagState = {};

export const reducer: Reducer<NewTagState> = (state: NewTagState, action: KnownAction) => {
    switch (action.type) {
        case 'TOPIC_FORM_SUBMITTED':
            return { submitting: true, submitted: true };
        case 'TOPIC_FORM_RECEIVED':
            return { submitting: false, submitted: false, previouslySubmittedTagFormModel: action.payload.tag };
        case 'TOPIC_FORM_FAILED':
            return { submitting: false, submitted: true, error: action.payload.error };

        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    // For unrecognized actions (or in cases where actions have no effect), must return the existing state
    //  (or default initial state if none was supplied)
    return state || defaultState;
};