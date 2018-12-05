import { Reducer } from 'redux';
import { AppThunkAction } from '.';
import { EditFormProps } from '../components/shared/EditFormProps';
import { AdminQuestionFormModel, AdminQuestionModel } from '../server-models';
import { getJson, putJson } from '../utils/http-utils';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface EditQuestionState {
    editQuestionForm: EditFormProps<AdminQuestionModel>;
    savedSlug?: string;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

interface GetQuestionRequestAction {
    type: 'GET_QUESTION_REQUEST';
    payload: { questionId: number; };
}
interface GetQuestionSuccessAction {
    type: 'GET_QUESTION_SUCCESS';
    payload: { question: AdminQuestionModel; questionId: number; };
}
interface GetQuestionFailureAction {
    type: 'GET_QUESTION_FAILURE';
    payload: { questionId: number; error: string; };
}
interface EditQuestionFormRequestAction {
    type: 'EDIT_QUESTION_FORM_REQUEST';
}
interface EditQuestionFormSuccessAction {
    type: 'EDIT_QUESTION_FORM_SUCCESS';
    payload: { questionId: number; question: AdminQuestionModel; };
}
interface EditQuestionFormFailureAction {
    type: 'EDIT_QUESTION_FORM_FAILURE';
    payload: { error: string | null; };
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction = GetQuestionRequestAction
    | GetQuestionSuccessAction
    | GetQuestionFailureAction
    | EditQuestionFormRequestAction
    | EditQuestionFormSuccessAction
    | EditQuestionFormFailureAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    getQuestion: (questionId: number): AppThunkAction<KnownAction> => (dispatch, getState) => {
        return (async () => {
            dispatch({ type: 'GET_QUESTION_REQUEST', payload: { questionId } });

            getJson<AdminQuestionModel>(`/api/questions/${questionId}`, getState().login.loggedInUser)
                .then((questionResponse) => {
                    dispatch({
                        type: 'GET_QUESTION_SUCCESS',
                        payload: { question: questionResponse, questionId },
                    });
                })
                .catch((reason) => {
                    dispatch({
                        type: 'GET_QUESTION_FAILURE',
                        payload: { questionId, error: reason || 'Get tag failed' },
                    });
                });
        })();
    },
    submit: (questionId: number, questionForm: AdminQuestionFormModel):
        AppThunkAction<KnownAction> => (dispatch, getState) => {
            return (async () => {
                dispatch({ type: 'EDIT_QUESTION_FORM_REQUEST' });

                if (!questionForm.text || questionForm.text.length > 280) {
                    // Don't set an error message, the validation properties will display instead
                    dispatch({ type: 'EDIT_QUESTION_FORM_FAILURE', payload: { error: null } });
                    return;
                }

                putJson<AdminQuestionModel>(
                    `/api/questions/${questionId}`, questionForm, getState().login.loggedInUser!)
                    .then((questionResponse) => {
                        dispatch({
                            type: 'EDIT_QUESTION_FORM_SUCCESS',
                            payload: { questionId, question: questionResponse },
                        });
                    })
                    .catch((reason: string) => {
                        dispatch({ type: 'EDIT_QUESTION_FORM_FAILURE', payload: { error: reason } });
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
        case 'GET_QUESTION_REQUEST':
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
        case 'GET_QUESTION_FAILURE':
            return {
                editQuestionForm: {
                    error: action.payload.error,
                },
            };
        case 'EDIT_QUESTION_FORM_REQUEST':
            return {
                editQuestionForm: {
                    submitting: true,
                    submitted: true,
                },
            };
        case 'EDIT_QUESTION_FORM_SUCCESS':
            return {
                editQuestionForm: {
                    submitting: false,
                    submitted: false,
                },
                savedSlug: action.payload.question.slug,
            };
        case 'EDIT_QUESTION_FORM_FAILURE':
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
