﻿import { push } from 'react-router-redux';
import { Reducer } from 'redux';
import { AppThunkAction } from '.';
import { FormProps } from '../components/shared/FormProps';
import { QuestionFormModel, QuestionListItemModel } from '../server-models';
import { postJson } from '../utils';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface NewQuestionState {
    questionForm?: FormProps<QuestionFormModel>;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

interface NewQuestionFormSubmittedAction {
    type: 'NEW_QUESTION_FORM_SUBMITTED';
}
export interface NewQuestionFormReceivedAction {
    type: 'NEW_QUESTION_FORM_RECEIVED';
    payload: { questionListItem: QuestionListItemModel; };
}
interface NewQuestionFormFailedAction {
    type: 'NEW_QUESTION_FORM_FAILED';
    payload: { error: string | null; };
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction = NewQuestionFormSubmittedAction
    | NewQuestionFormReceivedAction
    | NewQuestionFormFailedAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    submit: (questionForm: QuestionFormModel):
        AppThunkAction<KnownAction> => (dispatch, getState) => {
            return (async () => {
                dispatch({ type: 'NEW_QUESTION_FORM_SUBMITTED' });

                if (!questionForm.text) {
                    // Don't set an error message, the validation properties will display instead
                    dispatch({ type: 'NEW_QUESTION_FORM_FAILED', payload: { error: null } });
                    return;
                }

                postJson<QuestionListItemModel>(
                    `/api/questions`, questionForm, getState().login.loggedInUser!)
                    .then((responseModel: QuestionListItemModel) => {
                        dispatch({
                            type: 'NEW_QUESTION_FORM_RECEIVED',
                            payload: { questionListItem: responseModel },
                        });
                        setTimeout(() => {
                            // Wait a bit for modal to have closed, then go to new Question
                            dispatch(push(`/questions/${responseModel.id}/${responseModel.slug}`) as any);
                        }, 700);
                    })
                    .catch((reason: string) => {
                        dispatch({
                            type: 'NEW_QUESTION_FORM_FAILED',
                            payload: { error: reason || 'Posting Question failed' },
                        });
                    });
            })();
        },
};

// ----------------
// REDUCER - For a given state and action, returns the new state.
// To support time travel, this must not mutate the old state.

const defaultState: NewQuestionState = { questionForm: {} };

export const reducer: Reducer<NewQuestionState> = (state: NewQuestionState, action: KnownAction) => {
    switch (action.type) {
        case 'NEW_QUESTION_FORM_SUBMITTED':
            return {
                questionForm: {
                    submitting: true,
                    submitted: true,
                },
            };
        case 'NEW_QUESTION_FORM_RECEIVED':
            return defaultState;
        case 'NEW_QUESTION_FORM_FAILED':
            return {
                questionForm: {
                    submitting: false,
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