import { Reducer } from 'redux';
import { AppThunkAction } from '.';
import { QuestionListItemModel, QuestionsListModel } from '../server-models';
import { getJson } from '../utils/http-utils';
import { LogOutSuccessAction } from './LogOut';
import { UpdateWatchQuestionSuccessAction } from './Question';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

type WatchingQuestionListItemModel = QuestionListItemModel & { watching: boolean };

export interface State {
  questionsList?: WatchingQuestionListItemModel[];
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

interface GetWatchingQuestionsListRequestAction {
  type: 'GET_WATCHING_QUESTIONS_LIST_REQUEST';
}
interface GetWatchingQuestionsListSuccessAction {
  type: 'GET_WATCHING_QUESTIONS_LIST_SUCCESS';
  payload: QuestionsListModel;
}
interface GetWatchingQuestionsListFailureAction {
  type: 'GET_WATCHING_QUESTIONS_LIST_FAILURE';
  payload: { error: string; };
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction =
  | GetWatchingQuestionsListRequestAction
  | GetWatchingQuestionsListSuccessAction
  | GetWatchingQuestionsListFailureAction
  | UpdateWatchQuestionSuccessAction
  | LogOutSuccessAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
  getWatchingQuestionsList: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
    return (async () => {
      dispatch({ type: 'GET_WATCHING_QUESTIONS_LIST_REQUEST' });

      getJson<QuestionsListModel>('/api/questions?watching=true&pageSize=100', getState().auth.loggedInUser)
        .then((questionsListResponse: QuestionsListModel) => {
          dispatch({ type: 'GET_WATCHING_QUESTIONS_LIST_SUCCESS', payload: questionsListResponse });
        })
        .catch((reason) => {
          dispatch({
            type: 'GET_WATCHING_QUESTIONS_LIST_FAILURE',
            payload: {
              error: reason || 'Get questions list failed',
            },
          });
        });
    })();
  },
};

// ----------------
// REDUCER - For a given state and action, returns the new state.
// To support time travel, this must not mutate the old state.

const defaultState: State = {};

export const reducer: Reducer<State> = (state: State, action: KnownAction) => {
  switch (action.type) {
    case 'GET_WATCHING_QUESTIONS_LIST_REQUEST':
    case 'GET_WATCHING_QUESTIONS_LIST_FAILURE':
      return state;
    case 'GET_WATCHING_QUESTIONS_LIST_SUCCESS':
      return {
        questionsList: action.payload.questions.map((x) => ({ ...x, watching: true })),
      };
    case 'UPDATE_WATCH_QUESTION_SUCCESS': {
      if (!state.questionsList) {
        return state;
      }
      // Slice for immutability
      const questionsListNext = state.questionsList.slice();
      const question = questionsListNext.filter((x) => x.id === action.payload.questionId)[0];
      if (question) {
        question.watching = action.payload.response.watching;
      }
      return {
        questionsList: questionsListNext,
      };
    }
    case 'LOGOUT_SUCCESS': {
      return defaultState;
    }

    default:
      // The following line guarantees that every action in the KnownAction union has been covered by a case above
      const exhaustiveCheck: never = action;
  }

  // For unrecognized actions (or in cases where actions have no effect), must return the existing state
  //  (or default initial state if none was supplied)
  return state || defaultState;
};
