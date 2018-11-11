import { Reducer } from 'redux';
import { AppThunkAction } from '.';
import { EditFormProps } from '../components/shared/EditFormProps';
import { QuestionFormModel, QuestionModel } from '../server-models';
import { getJson, putJson } from '../utils/http-utils';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface EditQuestionState {
    editQuestionForm: EditFormProps<QuestionFormModel>;
    savedSlug?: string;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

interface GetQuestionRequestedAction {
    type: 'GET_QUESTION_REQUESTED';
    payload: { questionId: number; };
}
interface GetQuestionSuccessAction {
    type: 'GET_QUESTION_SUCCESS';
    payload: { question: QuestionModel; questionId: number; };
}
interface GetQuestionFailedAction {
    type: 'GET_QUESTION_FAILED';
    payload: { questionId: number; error: string; };
}
interface EditQuestionFormSubmittedAction {
    type: 'EDIT_QUESTION_FORM_SUBMITTED';
}
interface EditQuestionFormReceivedAction {
    type: 'EDIT_QUESTION_FORM_RECEIVED';
    payload: { questionId: number; question: QuestionModel; };
}
interface EditQuestionFormFailedAction {
    type: 'EDIT_QUESTION_FORM_FAILED';
    payload: { error: string | null; };
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction = GetQuestionRequestedAction
    | GetQuestionSuccessAction
    | GetQuestionFailedAction
    | EditQuestionFormSubmittedAction
    | EditQuestionFormReceivedAction
    | EditQuestionFormFailedAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    getQuestion: (questionId: number): AppThunkAction<KnownAction> => (dispatch, getState) => {
        return (async () => {
            dispatch({ type: 'GET_QUESTION_REQUESTED', payload: { questionId } });

            getJson<QuestionModel>(`/api/questions/${questionId}`, getState().login.loggedInUser)
                .then((questionResponse: QuestionModel) => {
                    dispatch({
                        type: 'GET_QUESTION_SUCCESS',
                        payload: { question: questionResponse, questionId },
                    });
                })
                .catch((reason) => {
                    dispatch({
                        type: 'GET_QUESTION_FAILED',
                        payload: { questionId, error: reason || 'Get tag failed' },
                    });
                });
        })();
    },
    submit: (questionId: number, questionForm: QuestionFormModel):
        AppThunkAction<KnownAction> => (dispatch, getState) => {
            return (async () => {
                dispatch({ type: 'EDIT_QUESTION_FORM_SUBMITTED' });

                if (!questionForm.text) {
                    // Don't set an error message, the validation properties will display instead
                    dispatch({ type: 'EDIT_QUESTION_FORM_FAILED', payload: { error: null } });
                    return;
                }

                putJson<QuestionModel>(
                    `/api/questions/${questionId}`, questionForm, getState().login.loggedInUser!)
                    .then((questionResponse: QuestionModel) => {
                        dispatch({
                            type: 'EDIT_QUESTION_FORM_RECEIVED',
                            payload: { questionId, question: questionResponse },
                        });
                    })
                    .catch((reason: string) => {
                        dispatch({ type: 'EDIT_QUESTION_FORM_FAILED', payload: { error: reason } });
                    });
            })();
        },
};

// ----------------
// REDUCER - For a given state and action, returns the new state.
// To support time travel, this must not mutate the old state.

const defaultState: EditQuestionState = { editQuestionForm: {} };

export const reducer: Reducer<EditQuestionState> = (state: EditQuestionState, action: KnownAction) => {
    switch (action.type) {
        case 'GET_QUESTION_REQUESTED':
            return {
                editQuestionForm: {
                    loading: true,
                },
            };
        case 'GET_QUESTION_SUCCESS':
            return {
                editQuestionForm: {
                    initialState: action.payload.question,
                },
            };
        case 'GET_QUESTION_FAILED':
            return {
                editQuestionForm: {
                    error: action.payload.error,
                },
            };
        case 'EDIT_QUESTION_FORM_SUBMITTED':
            return {
                editQuestionForm: {
                    submitting: true,
                    submitted: true,
                },
            };
        case 'EDIT_QUESTION_FORM_RECEIVED':
            return {
                editQuestionForm: {
                    submitting: false,
                    submitted: false,
                },
                savedSlug: action.payload.question.slug,
            };
        case 'EDIT_QUESTION_FORM_FAILED':
            return {
                editQuestionForm: {
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
