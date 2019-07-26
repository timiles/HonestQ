import { Reducer } from 'redux';
import { AppThunkAction } from '.';
import { AnswerListItemModel, AnswersListModel } from '../server-models';
import { getJson } from '../utils/http-utils';
import { LogOutSuccessAction } from './LogOut';
import { UpdateWatchAnswerSuccessAction } from './Question';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

type WatchingAnswerListItemModel = AnswerListItemModel & { watching: boolean };

export interface State {
  answersList?: WatchingAnswerListItemModel[];
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

interface GetWatchingAnswersListRequestAction {
  type: 'GET_WATCHING_ANSWERS_LIST_REQUEST';
}
interface GetWatchingAnswersListSuccessAction {
  type: 'GET_WATCHING_ANSWERS_LIST_SUCCESS';
  payload: AnswersListModel;
}
interface GetWatchingAnswersListFailureAction {
  type: 'GET_WATCHING_ANSWERS_LIST_FAILURE';
  payload: { error: string; };
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction =
  | GetWatchingAnswersListRequestAction
  | GetWatchingAnswersListSuccessAction
  | GetWatchingAnswersListFailureAction
  | UpdateWatchAnswerSuccessAction
  | LogOutSuccessAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
  getWatchingAnswersList: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
    return (async () => {
      dispatch({ type: 'GET_WATCHING_ANSWERS_LIST_REQUEST' });

      getJson<AnswersListModel>('/api/watching/answers', getState().auth.loggedInUser)
        .then((answersListResponse: AnswersListModel) => {
          dispatch({ type: 'GET_WATCHING_ANSWERS_LIST_SUCCESS', payload: answersListResponse });
        })
        .catch((reason) => {
          dispatch({
            type: 'GET_WATCHING_ANSWERS_LIST_FAILURE',
            payload: {
              error: reason || 'Get answers list failed',
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
    case 'GET_WATCHING_ANSWERS_LIST_REQUEST':
    case 'GET_WATCHING_ANSWERS_LIST_FAILURE':
      return state;
    case 'GET_WATCHING_ANSWERS_LIST_SUCCESS':
      return {
        answersList: action.payload.answers.map((x) => ({ ...x, watching: true })),
      };
    case 'UPDATE_WATCH_ANSWER_SUCCESS': {
      if (!state.answersList) {
        return state;
      }
      // Slice for immutability
      const answersListNext = state.answersList.slice();
      const answer = answersListNext.filter((x) => x.id === action.payload.answerId)[0];
      if (answer) {
        answer.watching = action.payload.response.watching;
      }
      return {
        answersList: answersListNext,
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
