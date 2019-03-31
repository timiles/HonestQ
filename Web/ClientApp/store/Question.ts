﻿import { AnyAction, Reducer } from 'redux';
import { AppThunkAction } from '.';
import { deleteJson, fetchJson, getJson, postJson } from '../utils/http-utils';
import { CommentModel, QuestionModel, ReactionModel, WatchResponseModel } from './../server-models';
import { NewAnswerFormSuccessAction } from './NewAnswer';
import { NewCommentFormSuccessAction } from './NewComment';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface ContainerState {
    question?: QuestionModel;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

interface GetQuestionRequestAction {
    type: 'GET_QUESTION_REQUEST';
}
interface GetQuestionSuccessAction {
    type: 'GET_QUESTION_SUCCESS';
    payload: { questionId: number; question: QuestionModel; };
}
interface GetQuestionFailureAction {
    type: 'GET_QUESTION_FAILURE';
    payload: { error: string; };
}
interface GetQuestionResetAction {
    type: 'GET_QUESTION_RESET';
}
interface AddReactionSuccessAction {
    type: 'ADD_REACTION_SUCCESS';
    payload: { reaction: ReactionModel; };
}
interface RemoveReactionSuccessAction {
    type: 'REMOVE_REACTION_SUCCESS';
    payload: { reaction: ReactionModel; };
}
export interface UpdateWatchSuccessAction {
    type: 'UPDATE_WATCH_SUCCESS';
    payload: {
        answerId?: number;
        response: WatchResponseModel;
    };
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction =
    | GetQuestionRequestAction
    | GetQuestionSuccessAction
    | GetQuestionFailureAction
    | GetQuestionResetAction
    | NewAnswerFormSuccessAction
    | NewCommentFormSuccessAction
    | AddReactionSuccessAction
    | RemoveReactionSuccessAction
    | UpdateWatchSuccessAction
    ;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    getQuestion: (questionId: number): AppThunkAction<KnownAction> =>
        (dispatch, getState) => {
            return (async () => {
                dispatch({ type: 'GET_QUESTION_REQUEST' });

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
                            type: 'GET_QUESTION_FAILURE',
                            payload: { error: reason || 'Get Question failed' },
                        });
                    });
            })();
        },
    addReaction: (reactionType: string, questionId: number, answerId: number, commentId?: number):
        AppThunkAction<KnownAction> =>
        (dispatch, getState) => {
            return (async () => {

                const url = commentId ?
                    `/api/questions/${questionId}/answers/${answerId}/comments/${commentId}/reactions/${reactionType}` :
                    `/api/questions/${questionId}/answers/${answerId}/reactions/${reactionType}`;
                postJson<ReactionModel>(url,
                    null,
                    getState().login.loggedInUser)
                    .then((reactionResponse: ReactionModel) => {
                        dispatch({
                            type: 'ADD_REACTION_SUCCESS',
                            payload: { reaction: reactionResponse },
                        });
                    })
                    .catch((reason) => {
                        // TODO: Toast?
                    });
            })();
        },
    removeReaction: (reactionType: string, questionId: number, answerId: number, commentId?: number):
        AppThunkAction<KnownAction> =>
        (dispatch, getState) => {
            return (async () => {

                const url = commentId ?
                    `/api/questions/${questionId}/answers/${answerId}/comments/${commentId}/reactions/${reactionType}` :
                    `/api/questions/${questionId}/answers/${answerId}/reactions/${reactionType}`;
                deleteJson<ReactionModel>(url,
                    getState().login.loggedInUser)
                    .then((reactionResponse: ReactionModel) => {
                        dispatch({
                            type: 'REMOVE_REACTION_SUCCESS',
                            payload: { reaction: reactionResponse },
                        });
                    })
                    .catch((reason) => {
                        // TODO: Toast?
                    });
            })();
        },
    updateWatch: (on: boolean, questionId: number, answerId?: number):
        AppThunkAction<KnownAction> =>
        (dispatch, getState) => {
            return (async () => {

                const url = answerId ? `/api/questions/${questionId}/answers/${answerId}/watch` :
                    `/api/questions/${questionId}/watch`;

                const method = on ? 'POST' : 'DELETE';
                fetchJson<WatchResponseModel>(method, url, null, getState().login.loggedInUser)
                    .then((watchResponse) => {
                        dispatch({
                            type: 'UPDATE_WATCH_SUCCESS',
                            payload: { answerId, response: watchResponse },
                        });
                    })
                    .catch((reason) => {
                        // TODO: Toast?
                    });
            })();
        },
    reset: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        return (async () => {
            dispatch({ type: 'GET_QUESTION_RESET' });
        })();
    },
};

// ----------------
// REDUCER - For a given state and action, returns the new state.
// To support time travel, this must not mutate the old state.

const defaultState: ContainerState = {};

export const reducer: Reducer<ContainerState> = (state: ContainerState, anyAction: AnyAction) => {
    // Currently all actions have payload so compiler doesn't like matching AnyAction with KnownAction
    const action = anyAction as KnownAction;
    switch (action.type) {
        case 'GET_QUESTION_REQUEST':
        case 'GET_QUESTION_FAILURE':
            return state;
        case 'GET_QUESTION_SUCCESS':
            return {
                questionId: action.payload.questionId,
                question: action.payload.question,
            };
        case 'NEW_ANSWER_FORM_SUCCESS': {
            const questionModel = state.question!;
            // Slice for immutability
            const answersNext = questionModel.answers.slice();
            answersNext.push(action.payload.answer);
            const questionNext = { ...questionModel, answers: answersNext };
            return {
                question: questionNext,
            };
        }
        case 'NEW_COMMENT_FORM_SUCCESS': {
            if (action.payload.comment.status !== 'OK') {
                return state;
            }
            const questionModel = state.question!;
            // Slice for immutability
            const answersNext = questionModel.answers;
            const answerModel = answersNext.filter((x) => x.id === action.payload.answerId)[0];
            if (action.payload.comment.parentCommentId) {
                const parentComment = findComment(answerModel.comments, action.payload.comment.parentCommentId);
                if (parentComment) {
                    parentComment.comments.push(action.payload.comment);
                }
                // Else?
            } else {
                answerModel.comments.push(action.payload.comment);
            }
            const questionNext = { ...questionModel, answers: answersNext };
            return {
                question: questionNext,
            };
        }
        case 'ADD_REACTION_SUCCESS': {
            const reaction = action.payload.reaction;
            const questionModel = state.question!;
            // Slice for immutability
            const answersNext = questionModel.answers;
            const answerModel = answersNext.filter((x) => x.id === reaction.answerId)[0];

            if (reaction.commentId) {
                const comment = findComment(answerModel.comments, reaction.commentId);
                if (comment) {
                    comment.reactionCounts[reaction.type] = reaction.newCount;
                    if (reaction.isMyReaction) {
                        comment.myReactions.push(reaction.type);
                    }
                }
            } else {
                answerModel.reactionCounts[reaction.type] = reaction.newCount;
                if (reaction.isMyReaction) {
                    answerModel.myReactions.push(reaction.type);
                }
            }

            const questionNext = { ...questionModel, answers: answersNext };
            return {
                question: questionNext,
            };
        }
        case 'REMOVE_REACTION_SUCCESS': {
            const reaction = action.payload.reaction;
            const questionModel = state.question!;
            // Slice for immutability
            const answersNext = questionModel.answers;
            const answerModel = answersNext.filter((x) => x.id === reaction.answerId)[0];

            if (reaction.commentId) {
                const comment = findComment(answerModel.comments, reaction.commentId);
                if (comment) {
                    comment.reactionCounts[reaction.type] = reaction.newCount;
                    const indexOfReactionToRemove = comment.myReactions.indexOf(reaction.type);
                    if (indexOfReactionToRemove >= 0) {
                        comment.myReactions.splice(indexOfReactionToRemove, 1);
                    }
                }
            } else {
                answerModel.reactionCounts[reaction.type] = reaction.newCount;
                const indexOfReactionToRemove = answerModel.myReactions.indexOf(reaction.type);
                if (indexOfReactionToRemove >= 0) {
                    answerModel.myReactions.splice(indexOfReactionToRemove, 1);
                }
            }

            const questionNext = { ...questionModel, answers: answersNext };
            return {
                question: questionNext,
            };
        }
        case 'UPDATE_WATCH_SUCCESS': {
            const { answerId, response } = action.payload;
            const questionModel = state.question!;
            // Slice for immutability
            const answersNext = questionModel.answers;
            const answerModel = answersNext.filter((x) => x.id === answerId)[0];

            if (answerId) {
                answerModel.watching = response.watching;
            } else {
                questionModel.watching = response.watching;
            }

            const questionNext = { ...questionModel, answers: answersNext };
            return {
                question: questionNext,
            };
        }
        case 'GET_QUESTION_RESET':
            return defaultState;

        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    // For unrecognized actions (or in cases where actions have no effect), must return the existing state
    //  (or default initial state if none was supplied)
    return state || defaultState;
};

function findComment(comments: CommentModel[], commentId: number): CommentModel | null {
    for (const comment of comments) {
        if (comment.id === commentId) {
            return comment;
        }
        const childComment = findComment(comment.comments, commentId);
        if (childComment) {
            return childComment;
        }
    }
    return null;
}
