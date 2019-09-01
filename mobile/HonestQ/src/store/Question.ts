import { AnyAction, Reducer } from 'redux';
import { AppThunkAction } from '.';
import { fetchJson, getJson } from '../utils/http-utils';
import { findComment } from '../utils/model-utils';
// tslint:disable-next-line:max-line-length
import { QuestionModel, ReactionModel, WatchingAnswerListItemModel, WatchingQuestionListItemModel } from './../server-models';
import { NewAnswerFormSuccessAction } from './NewAnswer';
import { NewCommentFormSuccessAction } from './NewComment';

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
export interface UpdateWatchQuestionSuccessAction {
  type: 'UPDATE_WATCH_QUESTION_SUCCESS';
  payload: {
    questionId: number;
    watching: boolean;
    watchingQuestionListItem?: WatchingQuestionListItemModel;
  };
}
export interface UpdateWatchAnswerSuccessAction {
  type: 'UPDATE_WATCH_ANSWER_SUCCESS';
  payload: {
    questionId: number;
    answerId: number;
    watching: boolean;
    watchingAnswerListItem?: WatchingAnswerListItemModel;
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
  | UpdateWatchQuestionSuccessAction
  | UpdateWatchAnswerSuccessAction
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
          getState().auth.loggedInUser)
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
  updateUpvote: (on: boolean, questionId: number, answerId: number, commentId?: number):
    AppThunkAction<KnownAction> =>
    (dispatch, getState) => {
      return (async () => {

        const url = commentId ?
          `/api/questions/${questionId}/answers/${answerId}/comments/${commentId}/reactions/Upvote` :
          `/api/questions/${questionId}/answers/${answerId}/reactions/Upvote`;

        const method = on ? 'POST' : 'DELETE';
        fetchJson<ReactionModel>(method, url, null, getState().auth.loggedInUser)
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
  updateWatchQuestion: (watching: boolean, questionId: number):
    AppThunkAction<KnownAction> =>
    (dispatch, getState) => {
      return (async () => {
        const url = `/api/questions/${questionId}/watch`;
        const method = watching ? 'POST' : 'DELETE';
        fetchJson<WatchingQuestionListItemModel>(method, url, null, getState().auth.loggedInUser)
          .then((response) => {
            dispatch({
              type: 'UPDATE_WATCH_QUESTION_SUCCESS',
              payload: { questionId, watching, watchingQuestionListItem: response },
            });
          })
          .catch((reason) => {
            // TODO: Toast?
          });
      })();
    },
  updateWatchAnswer: (watching: boolean, questionId: number, answerId: number):
    AppThunkAction<KnownAction> =>
    (dispatch, getState) => {
      return (async () => {

        const url = `/api/questions/${questionId}/answers/${answerId}/watch`;
        const method = watching ? 'POST' : 'DELETE';
        fetchJson<WatchingAnswerListItemModel>(method, url, null, getState().auth.loggedInUser)
          .then((response) => {
            dispatch({
              type: 'UPDATE_WATCH_ANSWER_SUCCESS',
              payload: { questionId, answerId, watching, watchingAnswerListItem: response },
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
          parentComment.comments.unshift(action.payload.comment);
        }
        // Else?
      } else {
        answerModel.comments.unshift(action.payload.comment);
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
    case 'UPDATE_WATCH_QUESTION_SUCCESS': {
      // We could be updating from WatchingAnswersScreen
      if (!state.question) {
        return state;
      }
      const { watching } = action.payload;
      const questionNext = { ...state.question!, watching };
      return {
        question: questionNext,
      };
    }
    case 'UPDATE_WATCH_ANSWER_SUCCESS': {
      // We could be updating from WatchingAnswersScreen
      if (!state.question) {
        return state;
      }
      const { answerId, watching } = action.payload;
      const questionModel = state.question!;
      // Slice for immutability
      const answersNext = questionModel.answers.slice();
      const answerModel = answersNext.filter((x) => x.id === answerId)[0];
      if (answerModel) {
        answerModel.watching = watching;
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
