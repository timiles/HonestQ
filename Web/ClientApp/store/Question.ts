import { AnyAction, Reducer } from 'redux';
import { AppThunkAction } from '.';
import { QuestionProps } from '../components/Question/Question';
import { CommentModel, QuestionModel } from '../server-models';
import { deleteJson, fetchJson, getJson, postJson } from '../utils/http-utils';
import { ReactionModel, WatchResponseModel } from './../server-models';
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
interface AddReactionSuccessAction {
    type: 'ADD_REACTION_SUCCESS';
    payload: { reaction: ReactionModel; };
}
interface RemoveReactionSuccessAction {
    type: 'REMOVE_REACTION_SUCCESS';
    payload: { reaction: ReactionModel; };
}
interface UpdateWatchQuestionSuccessAction {
    type: 'UPDATE_WATCH_QUESTION_SUCCESS';
    payload: {
        answerId?: number;
        commentId?: number;
        response: WatchResponseModel;
    };
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction =
    | GetQuestionRequestedAction
    | GetQuestionSuccessAction
    | GetQuestionFailedAction
    | NewAnswerFormReceivedAction
    | NewCommentFormReceivedAction
    | AddReactionSuccessAction
    | RemoveReactionSuccessAction
    | UpdateWatchQuestionSuccessAction
    ;

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
    updateWatch: (on: boolean, questionId: number, answerId?: number, commentId?: number):
        AppThunkAction<KnownAction> =>
        (dispatch, getState) => {
            return (async () => {

                const url =
                    commentId ? `/api/questions/${questionId}/answers/${answerId}/comments/${commentId}/watch` :
                        answerId ? `/api/questions/${questionId}/answers/${answerId}/watch` :
                            `/api/questions/${questionId}/watch`;

                const method = on ? 'POST' : 'DELETE';
                fetchJson<WatchResponseModel>(method, url, null, getState().login.loggedInUser)
                    .then((watchResponse) => {
                        dispatch({
                            type: 'UPDATE_WATCH_QUESTION_SUCCESS',
                            payload: { answerId, commentId, response: watchResponse },
                        });
                    })
                    .catch((reason) => {
                        // TODO: Toast?
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
            if (action.payload.comment.status !== 'OK') {
                return state;
            }
            const questionModel = state.question!.model!;
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
                question: {
                    questionId: state.question!.questionId,
                    model: questionNext,
                },
            };
        }
        case 'ADD_REACTION_SUCCESS': {
            const reaction = action.payload.reaction;
            const questionModel = state.question!.model!;
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
                question: {
                    questionId: state.question!.questionId,
                    model: questionNext,
                },
            };
        }
        case 'REMOVE_REACTION_SUCCESS': {
            const reaction = action.payload.reaction;
            const questionModel = state.question!.model!;
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
                question: {
                    questionId: state.question!.questionId,
                    model: questionNext,
                },
            };
        }
        case 'UPDATE_WATCH_QUESTION_SUCCESS': {
            const { answerId, commentId, response } = action.payload;
            const questionModel = state.question!.model!;
            // Slice for immutability
            const answersNext = questionModel.answers;
            const answerModel = answersNext.filter((x) => x.id === answerId)[0];

            if (commentId) {
                const comment = findComment(answerModel.comments, commentId);
                if (comment) {
                    comment.isWatchedByLoggedInUser = response.isWatchedByLoggedInUser;
                }
            } else if (answerId) {
                answerModel.isWatchedByLoggedInUser = response.isWatchedByLoggedInUser;
            } else {
                questionModel.isWatchedByLoggedInUser = response.isWatchedByLoggedInUser;
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
