import { AnyAction, Reducer } from 'redux';
import { AppThunkAction } from '.';
import { TagAutocompleteResultsModel, TagValueModel } from '../server-models';
import { getJson } from '../utils/http-utils';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface TagAutocompleteState {
  loading: boolean;
  query: string;
  suggestions: TagValueModel[] | null;
  error: string | null;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

interface AutocompleteTagsClearAction {
  type: 'AUTOCOMPLETE_TAGS_CLEAR';
}
interface AutocompleteTagsRequestAction {
  type: 'AUTOCOMPLETE_TAGS_REQUEST';
  payload: { query: string; };
}
interface AutocompleteTagsSuccessAction {
  type: 'AUTOCOMPLETE_TAGS_SUCCESS';
  payload: { tags: TagValueModel[]; query: string; };
}
interface AutocompleteTagsFailureAction {
  type: 'AUTOCOMPLETE_TAGS_FAILURE';
  payload: { query: string; error: string; };
}
interface AutocompleteTagsResetAction {
  type: 'AUTOCOMPLETE_TAGS_RESET';
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction = AutocompleteTagsClearAction
  | AutocompleteTagsRequestAction
  | AutocompleteTagsSuccessAction
  | AutocompleteTagsFailureAction
  | AutocompleteTagsResetAction
  ;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
  autocompleteTags: (query: string): AppThunkAction<KnownAction> => (dispatch, getState) => {
    return (async () => {
      if (!query) {
        dispatch({ type: 'AUTOCOMPLETE_TAGS_CLEAR' });
        return;
      }
      dispatch({ type: 'AUTOCOMPLETE_TAGS_REQUEST', payload: { query } });

      const queryUrl = `/api/tags/autocomplete?q=${encodeURIComponent(query)}`;
      getJson<TagAutocompleteResultsModel>(queryUrl, getState().auth.loggedInUser)
        .then((response: TagAutocompleteResultsModel) => {
          dispatch({
            type: 'AUTOCOMPLETE_TAGS_SUCCESS',
            payload: { tags: response.values, query },
          });
        })
        .catch((reason) => {
          dispatch({
            type: 'AUTOCOMPLETE_TAGS_FAILURE',
            payload: {
              query,
              error: reason || 'Autocomplete tags failed',
            },
          });
        });
    })();
  },
  reset: (): AppThunkAction<KnownAction> => (dispatch) => {
    return (async () => { dispatch({ type: 'AUTOCOMPLETE_TAGS_RESET' }); })();
  },
};

// ----------------
// REDUCER - For a given state and action, returns the new state.
// To support time travel, this must not mutate the old state.

const defaultState: TagAutocompleteState = { loading: false, query: '', suggestions: null, error: null };

export const reducer: Reducer<TagAutocompleteState> = (state: TagAutocompleteState, anyAction: AnyAction) => {
  // Currently all actions have payload so compiler doesn't like matching AnyAction with KnownAction
  const action = anyAction as KnownAction;
  switch (action.type) {
    case 'AUTOCOMPLETE_TAGS_CLEAR':
      return {
        loading: false,
        query: '',
        suggestions: null,
        error: null,
      };
    case 'AUTOCOMPLETE_TAGS_REQUEST':
      return {
        loading: true,
        query: action.payload.query,
        suggestions: state.suggestions,
        error: null,
      };
    case 'AUTOCOMPLETE_TAGS_SUCCESS':
      return {
        loading: false,
        query: action.payload.query,
        suggestions: action.payload.tags,
        error: null,
      };
    case 'AUTOCOMPLETE_TAGS_FAILURE':
      return {
        loading: false,
        query: action.payload.query,
        suggestions: [],
        error: action.payload.error,
      };
    case 'AUTOCOMPLETE_TAGS_RESET':
      return defaultState;

    default:
      // The following line guarantees that every action in the KnownAction union has been covered by a case above
      const exhaustiveCheck: never = action;
  }

  // For unrecognized actions (or in cases where actions have no effect), must return the existing state
  //  (or default initial state if none was supplied)
  return state || defaultState;
};
