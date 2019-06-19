﻿import { AnyAction, Reducer } from 'redux';
import { AppThunkAction } from '.';
import { deleteJson, fetchJson, getJson, postJson } from '../utils/http-utils';
import { findComment } from '../utils/model-utils';
import { QuestionModel, ReactionModel, WatchResponseModel } from './../server-models';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface QuestionState {
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
  addUpvote: (questionId: number, answerId: number, commentId?: number):
    AppThunkAction<KnownAction> =>
    (dispatch, getState) => {
      return (async () => {

        const url = commentId ?
          `/api/questions/${questionId}/answers/${answerId}/comments/${commentId}/reactions/Upvote` :
          `/api/questions/${questionId}/answers/${answerId}/reactions/Upvote`;
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
  removeUpvote: (questionId: number, answerId: number, commentId?: number):
    AppThunkAction<KnownAction> =>
    (dispatch, getState) => {
      return (async () => {

        const url = commentId ?
          `/api/questions/${questionId}/answers/${answerId}/comments/${commentId}/reactions/Upvote` :
          `/api/questions/${questionId}/answers/${answerId}/reactions/Upvote`;
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

const defaultState: QuestionState = {};

export const reducer: Reducer<QuestionState> = (state: QuestionState, anyAction: AnyAction) => {
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
    case 'ADD_REACTION_SUCCESS': {
      const reaction = action.payload.reaction;
      const questionModel = state.question!;
      // Slice for immutability
      const answersNext = questionModel.answers;
      const answerModel = answersNext.filter((x) => x.id === reaction.answerId)[0];

      if (reaction.commentId) {
        const comment = findComment(answerModel.comments, reaction.commentId);
        if (comment) {
          comment.upvotes = reaction.newCount;
          comment.upvotedByMe = reaction.isMyReaction;
        }
      } else {
        answerModel.upvotes = reaction.newCount;
        answerModel.upvotedByMe = reaction.isMyReaction;
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
          comment.upvotes = reaction.newCount;
          comment.upvotedByMe = reaction.isMyReaction;
        }
      } else {
        answerModel.upvotes = reaction.newCount;
        answerModel.upvotedByMe = reaction.isMyReaction;
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