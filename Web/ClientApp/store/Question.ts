﻿import { AnyAction, Reducer } from 'redux';
import { AppThunkAction } from '.';
import { QuestionProps } from '../components/Question/Question';
import { CommentModel, QuestionModel } from '../server-models';
import { getJson } from '../utils';
import { NewAnswerFormReceivedAction } from './NewAnswer';
import { NewCommentFormReceivedAction } from './NewComment';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface ContainerState {
    question: QuestionProps;
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
    payload: { questionId: number; question: QuestionModel; };
}
interface GetQuestionFailedAction {
    type: 'GET_QUESTION_FAILED';
    payload: { questionId: number; error: string; };
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction =
    | GetQuestionRequestedAction
    | GetQuestionSuccessAction
    | GetQuestionFailedAction
    | NewAnswerFormReceivedAction
    | NewCommentFormReceivedAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    getQuestion: (questionId: number): AppThunkAction<KnownAction> =>
        (dispatch, getState) => {
            return (async () => {
                dispatch({ type: 'GET_QUESTION_REQUESTED', payload: { questionId } });

                getJson<QuestionModel>(`/api/questions/${questionId}`,
                    getState().login.loggedInUser)
                    .then((questionResponse: QuestionModel) => {
                        dispatch({
                            type: 'GET_QUESTION_SUCCESS',
                            payload: { questionId, question: questionResponse },
                        });
                    })
                    .catch((reason) => {
                        dispatch({
                            type: 'GET_QUESTION_FAILED',
                            payload: {
                                questionId,
                                error: reason || 'Get Question failed',
                            },
                        });
                    });
            })();
        },
};

// ----------------
// REDUCER - For a given state and action, returns the new state.
// To support time travel, this must not mutate the old state.

const defaultState: ContainerState = { question: {} };

export const reducer: Reducer<ContainerState> = (state: ContainerState, anyAction: AnyAction) => {
    // Currently all actions have payload so compiler doesn't like matching AnyAction with KnownAction
    const action = anyAction as KnownAction;
    switch (action.type) {
        case 'GET_QUESTION_REQUESTED':
            return {
                question: {
                    loading: true,
                    questionId: action.payload.questionId,
                },
            };
        case 'GET_QUESTION_SUCCESS':
            return {
                question: {
                    questionId: action.payload.questionId,
                    model: action.payload.question,
                },
            };
        case 'GET_QUESTION_FAILED':
            return {
                question: {
                    questionId: action.payload.questionId,
                    error: action.payload.error,
                },
            };
        case 'NEW_ANSWER_FORM_RECEIVED': {
            const questionModel = state.question!.model!;
            // Slice for immutability
            const answersNext = questionModel.answers.slice();
            answersNext.push(action.payload.answer);
            const questionNext = { ...questionModel, answers: answersNext };
            return {
                question: {
                    questionId: state.question!.questionId,
                    model: questionNext,
                },
            };
        }
        case 'NEW_COMMENT_FORM_RECEIVED': {
            const questionModel = state.question!.model!;
            // Slice for immutability
            const answersNext = questionModel.answers;
            const answerModel = answersNext.filter((x) => x.id === action.payload.answerId)[0];
            if (action.payload.comment.parentCommentId) {
                appendNewComment(answerModel.comments, action.payload.comment);
            } else {
                answerModel.comments.push(action.payload.comment);
            }
            const questionNext = { ...questionModel, answers: answersNext };
            return {
                question: {
                    questionId: state.question!.questionId,
                    model: questionNext,
                },
            };
        }

        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    // For unrecognized actions (or in cases where actions have no effect), must return the existing state
    //  (or default initial state if none was supplied)
    return state || defaultState;
};

function appendNewComment(comments: CommentModel[], newComments: CommentModel): boolean {
    for (const comment of comments) {
        if (comment.id === newComments.parentCommentId) {
            comment.comments.push(newComments);
            return true;
        }
        if (appendNewComment(comment.comments, newComments)) {
            return true;
        }
    }
    return false;
}