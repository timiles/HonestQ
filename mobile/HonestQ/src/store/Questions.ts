import { Reducer } from 'redux';
import { AppThunkAction } from '.';
import { QuestionsListModel } from '../server-models';
import { getJson } from '../utils/http-utils';
import { NewAnswerFormSuccessAction } from './NewAnswer';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface ListState {
  questionsList?: QuestionsListModel;
  refreshing: boolean;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

interface GetQuestionsListRequestAction {
  type: 'GET_QUESTIONS_LIST_REQUEST';
  payload: { isRefresh: boolean };
}
interface GetQuestionsListSuccessAction {
  type: 'GET_QUESTIONS_LIST_SUCCESS';
  payload: { questionsList: QuestionsListModel; isRefresh: boolean; };
}
interface GetQuestionsListFailureAction {
  type: 'GET_QUESTIONS_LIST_FAILURE';
  payload: { error: string; isRefresh: boolean; };
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction =
  | GetQuestionsListRequestAction
  | GetQuestionsListSuccessAction
  | GetQuestionsListFailureAction
  | NewAnswerFormSuccessAction
  ;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
  loadMoreQuestionItems: (options: { beforeTimestamp?: number, isRefresh?: boolean }):
    AppThunkAction<KnownAction> => (dispatch, getState) => {
      return (async () => {
        const { beforeTimestamp, isRefresh } = options;
        if (beforeTimestamp && beforeTimestamp <= 0) {
          return;
        }
        dispatch({ type: 'GET_QUESTIONS_LIST_REQUEST', payload: { isRefresh } });

        const url = '/api/questions' + (beforeTimestamp ? `?beforeTimestamp=${beforeTimestamp}` : '');
        getJson<QuestionsListModel>(url,
          getState().auth.loggedInUser)
          .then((questionListResponse: QuestionsListModel) => {
            dispatch({
              type: 'GET_QUESTIONS_LIST_SUCCESS',
              payload: { questionsList: questionListResponse, isRefresh },
            });
          })
          .catch((reason) => {
            dispatch({
              type: 'GET_QUESTIONS_LIST_FAILURE',
              payload: { error: reason || 'Get Question list failed', isRefresh },
            });
          });
      })();
    },
};

// ----------------
// REDUCER - For a given state and action, returns the new state.
// To support time travel, this must not mutate the old state.

const defaultState: ListState = { refreshing: false };

export const reducer: Reducer<ListState> = (state: ListState, action: KnownAction) => {
  switch (action.type) {
    case 'GET_QUESTIONS_LIST_REQUEST':
      return {
        ...state,
        refreshing: action.payload.isRefresh,
      };
    case 'GET_QUESTIONS_LIST_FAILURE':
      return {
        ...state,
        refreshing: false,
      };
    case 'GET_QUESTIONS_LIST_SUCCESS': {
      if (state.questionsList) {
        if (action.payload.isRefresh) {
          // Start with new questions, if the list overlaps with the existing list we can append them too.
          const questionsNext = action.payload.questionsList.questions;
          const lastId = questionsNext[questionsNext.length - 1].id;
          if (lastId <= state.questionsList.questions[0].id + 1) {
            // The lists overlap, so let's copy in the tail end of the existing questions
            for (const question of state.questionsList.questions.filter((x) => x.id < lastId)) {
              questionsNext.push(question);
            }
          }
          return {
            ...state,
            questionsList: {
              questions: questionsNext,
              lastTimestamp: Math.min(state.questionsList.lastTimestamp, action.payload.questionsList.lastTimestamp),
            },
            refreshing: false,
          };
        } else {
          // Append to the end of the existing list
          const questionsNext = state.questionsList.questions.slice();
          questionsNext.push(...action.payload.questionsList.questions);
          return {
            ...state,
            questionsList: {
              questions: questionsNext,
              lastTimestamp: action.payload.questionsList.lastTimestamp,
            },
            refreshing: false,
          };
        }
      }
      return {
        ...state,
        questionsList: action.payload.questionsList,
        refreshing: false,
      };
    }
    case 'NEW_ANSWER_FORM_SUCCESS': {
      if (!state.questionsList) {
        // In case the Questions page hasn't been loaded yet (quite likely).
        return state;
      }
      const questionListModel = state.questionsList;
      // Slice for immutability
      const questionItemsNext = questionListModel.questions.slice();
      const question = questionItemsNext.filter((x) => x.id === action.payload.questionId)[0];
      if (question) {
        question.answersCount++;
      }
      const questionListNext = { ...questionListModel, questions: questionItemsNext };
      return {
        ...state,
        questionsList: questionListNext,
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
