import { AnyAction, Reducer } from 'redux';
import { AppThunkAction } from '.';
import { QuestionSearchResultsModel } from '../server-models';
import { getJson } from '../utils/http-utils';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface QuestionSearchState {
  loading?: boolean;
  query?: string;
  searchResults?: QuestionSearchResultsModel;
  error?: string;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

interface QuestionSearchClearAction {
  type: 'QUESTION_SEARCH_CLEAR';
}
interface QuestionSearchRequestAction {
  type: 'QUESTION_SEARCH_REQUEST';
  payload: { query: string; };
}
interface QuestionSearchSuccessAction {
  type: 'QUESTION_SEARCH_SUCCESS';
  payload: { searchResults: QuestionSearchResultsModel; query: string; };
}
interface QuestionSearchFailureAction {
  type: 'QUESTION_SEARCH_FAILURE';
  payload: { query: string; error: string; };
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction = QuestionSearchClearAction
  | QuestionSearchRequestAction
  | QuestionSearchSuccessAction
  | QuestionSearchFailureAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
  clear: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
    return (async () => {
      dispatch({ type: 'QUESTION_SEARCH_CLEAR' });
    })();
  },
  searchQuestions: (query: string, pageNumber: number, pageSize: number):
    AppThunkAction<KnownAction> => (dispatch, getState) => {
      return (async () => {
        if (!query) {
          dispatch({ type: 'QUESTION_SEARCH_CLEAR' });
          return;
        }
        dispatch({ type: 'QUESTION_SEARCH_REQUEST', payload: { query } });

        const q = encodeURIComponent(query);
        const queryUrl = `/api/questions/search?q=${q}&pageNumber=${pageNumber}&pageSize=${pageSize}`;
        getJson<QuestionSearchResultsModel>(queryUrl, getState().login.loggedInUser)
          .then((response) => {
            dispatch({
              type: 'QUESTION_SEARCH_SUCCESS',
              payload: { searchResults: response, query },
            });
          })
          .catch((reason) => {
            dispatch({
              type: 'QUESTION_SEARCH_FAILURE',
              payload: {
                query,
                error: reason || 'Question search failed',
              },
            });
          });
      })();
    },
};

// ----------------
// REDUCER - For a given state and action, returns the new state.
// To support time travel, this must not mutate the old state.

const defaultState: QuestionSearchState = {};

export const reducer: Reducer<QuestionSearchState> = (state: QuestionSearchState, anyAction: AnyAction) => {
  // Currently all actions have payload so compiler doesn't like matching AnyAction with KnownAction
  const action = anyAction as KnownAction;
  switch (action.type) {
    case 'QUESTION_SEARCH_CLEAR':
      return defaultState;
    case 'QUESTION_SEARCH_REQUEST':
      return {
        loading: true,
        query: action.payload.query,
        searchResults: state.searchResults,
      };
    case 'QUESTION_SEARCH_SUCCESS':
      return {
        query: action.payload.query,
        searchResults: action.payload.searchResults,
      };
    case 'QUESTION_SEARCH_FAILURE':
      return {
        query: action.payload.query,
        error: action.payload.error,
      };

    default:
      // The following line guarantees that every action in the KnownAction union has been covered by a case above
      const exhaustiveCheck: never = action;
  }

  // For unrecognized actions (or in cases where actions have no effect), must return the existing state
  //  (or default initial state if none was supplied)
  return state || defaultState;
};
