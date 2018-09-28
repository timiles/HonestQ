﻿import { Reducer } from 'redux';
import { AppThunkAction } from '.';
import { FormProps } from '../components/shared/FormProps';
import { AnswerFormModel, AnswerModel } from '../server-models';
import { postJson } from '../utils';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface NewAnswerState {
    answerForm?: FormProps<AnswerFormModel>;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

interface NewAnswerFormSubmittedAction {
    type: 'NEW_ANSWER_FORM_SUBMITTED';
}
export interface NewAnswerFormReceivedAction {
    type: 'NEW_ANSWER_FORM_RECEIVED';
    payload: { answer: AnswerModel; };
}
interface NewAnswerFormFailedAction {
    type: 'NEW_ANSWER_FORM_FAILED';
    payload: { error?: string; };
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction = NewAnswerFormSubmittedAction
    | NewAnswerFormReceivedAction
    | NewAnswerFormFailedAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    submit: (questionId: number, answerForm: AnswerFormModel):
        AppThunkAction<KnownAction> => (dispatch, getState) => {
            return (async () => {
                dispatch({ type: 'NEW_ANSWER_FORM_SUBMITTED' });

                if (!answerForm.text) {
                    // Don't set an error message, the validation properties will display instead
                    dispatch({ type: 'NEW_ANSWER_FORM_FAILED', payload: {} });
                    return;
                }

                postJson<AnswerModel>(
                    `/api/questions/${questionId}/answers`,
                    answerForm, getState().login.loggedInUser!)
                    .then((responseModel: AnswerModel) => {
                        dispatch({
                            type: 'NEW_ANSWER_FORM_RECEIVED',
                            payload: { answer: responseModel },
                        });
                    })
                    .catch((reason: string) => {
                        dispatch({
                            type: 'NEW_ANSWER_FORM_FAILED',
                            payload: { error: reason || 'Posting answer failed' },
                        });
                    });
            })();
        },
};

// ----------------
// REDUCER - For a given state and action, returns the new state.
// To support time travel, this must not mutate the old state.

const defaultState: NewAnswerState = { answerForm: {} };

export const reducer: Reducer<NewAnswerState> = (state: NewAnswerState, action: KnownAction) => {
    switch (action.type) {
        case 'NEW_ANSWER_FORM_SUBMITTED':
            return {
                answerForm: {
                    submitting: true,
                    submitted: true,
                },
            };
        case 'NEW_ANSWER_FORM_RECEIVED':
            return defaultState;
        case 'NEW_ANSWER_FORM_FAILED':
            return {
                answerForm: {
                    submitted: true,
                    error: action.payload.error,
                },
            };

        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    // For unrecognized actions (or in cases where actions have no effect), must return the existing state
    //  (or default initial state if none was supplied)
    return state || defaultState;
};