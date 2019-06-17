import { Reducer } from 'redux';
import { AppThunkAction } from '.';
import { FormProps } from '../components/shared/FormProps';
import { CommentFormModel, CommentModel, QuestionModel } from '../server-models';
import { getJson, putJson } from '../utils/http-utils';
import { findComment } from '../utils/model-utils';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface EditCommentState {
    editCommentForm: FormProps<CommentFormModel>;
    savedSuccessfully?: boolean;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

interface GetEditCommentRequestAction {
    type: 'GET_EDIT_COMMENT_REQUEST';
}
interface GetEditCommentSuccessAction {
    type: 'GET_EDIT_COMMENT_SUCCESS';
    payload: { commentId: number; comment: CommentModel; };
}
interface GetEditCommentFailureAction {
    type: 'GET_EDIT_COMMENT_FAILURE';
    payload: { error: string; };
}
interface EditCommentFormRequestAction {
    type: 'EDIT_COMMENT_FORM_REQUEST';
}
interface EditCommentFormSuccessAction {
    type: 'EDIT_COMMENT_FORM_SUCCESS';
    payload: { commentId: number; comment: CommentModel; };
}
interface EditCommentFormFailureAction {
    type: 'EDIT_COMMENT_FORM_FAILURE';
    payload: { error: string | null; };
}
interface EditCommentFormResetAction {
    type: 'EDIT_COMMENT_FORM_RESET';
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction =
    | GetEditCommentRequestAction
    | GetEditCommentSuccessAction
    | GetEditCommentFailureAction
    | EditCommentFormRequestAction
    | EditCommentFormSuccessAction
    | EditCommentFormFailureAction
    | EditCommentFormResetAction
    ;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    getComment: (questionId: number, answerId: number, commentId: number):
        AppThunkAction<KnownAction> => (dispatch, getState) => {
            return (async () => {
                dispatch({ type: 'GET_EDIT_COMMENT_REQUEST' });

                getJson<QuestionModel>(`/api/questions/${questionId}`, getState().login.loggedInUser)
                    .then((questionResponse: QuestionModel) => {
                        const answerResponse = questionResponse.answers.filter((x) => x.id === answerId)[0];
                        const commentResponse = findComment(answerResponse.comments, commentId)!;
                        dispatch({
                            type: 'GET_EDIT_COMMENT_SUCCESS',
                            payload: { commentId, comment: commentResponse },
                        });
                    })
                    .catch((reason) => {
                        dispatch({
                            type: 'GET_EDIT_COMMENT_FAILURE',
                            payload: { error: reason || 'Get comment failed' },
                        });
                    });
            })();
        },
    submit: (questionId: number, answerId: number, commentId: number, commentForm: CommentFormModel):
        AppThunkAction<KnownAction> => (dispatch, getState) => {
            return (async () => {
                dispatch({ type: 'EDIT_COMMENT_FORM_REQUEST' });

                if (!commentForm.text || commentForm.text.length > 280) {
                    // Don't set an error message, the validation properties will display instead
                    dispatch({ type: 'EDIT_COMMENT_FORM_FAILURE', payload: { error: null } });
                    return;
                }

                putJson<CommentModel>(
                    `/api/questions/${questionId}/answers/${answerId}/comments/${commentId}`,
                    commentForm, getState().login.loggedInUser!)
                    .then((commentResponse: CommentModel) => {
                        dispatch({
                            type: 'EDIT_COMMENT_FORM_SUCCESS',
                            payload: { commentId, comment: commentResponse },
                        });
                    })
                    .catch((reason: string) => {
                        dispatch({ type: 'EDIT_COMMENT_FORM_FAILURE', payload: { error: reason } });
                    });
            })();
        },
    resetForm: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        return (async () => {
            dispatch({ type: 'EDIT_COMMENT_FORM_RESET' });
        })();
    },
};

// ----------------
// REDUCER - For a given state and action, returns the new state.
// To support time travel, this must not mutate the old state.

const defaultState: EditCommentState = { editCommentForm: {} };

export const reducer: Reducer<EditCommentState> = (state: EditCommentState, action: KnownAction) => {
    switch (action.type) {
        case 'GET_EDIT_COMMENT_REQUEST':
        case 'GET_EDIT_COMMENT_FAILURE':
            return state;
        case 'GET_EDIT_COMMENT_SUCCESS':
            return {
                editCommentForm: {
                    initialState: action.payload.comment,
                },
            };
        case 'EDIT_COMMENT_FORM_REQUEST':
            return {
                editCommentForm: {
                    submitting: true,
                    submitted: true,
                },
            };
        case 'EDIT_COMMENT_FORM_SUCCESS':
            return {
                editCommentForm: {
                    submitting: false,
                    submitted: false,
                },
                savedSuccessfully: true,
            };
        case 'EDIT_COMMENT_FORM_FAILURE':
            return {
                editCommentForm: {
                    submitting: false,
                    submitted: true,
                    error: action.payload.error,
                },
            };
        case 'EDIT_COMMENT_FORM_RESET':
            return defaultState;

        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    // For unrecognized actions (or in cases where actions have no effect), must return the existing state
    //  (or default initial state if none was supplied)
    return state || defaultState;
};
