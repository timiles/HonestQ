import { Reducer } from 'redux';
import { AppThunkAction } from '.';
import { TagsListModel } from '../server-models';
import { getJson } from '../utils/http-utils';
import { UpdateWatchTagSuccessAction } from './Tag';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface ListState {
  tagsList?: TagsListModel;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

interface GetTagsListRequestAction { type: 'GET_TAGS_LIST_REQUEST'; }
interface GetTagsListSuccessAction { type: 'GET_TAGS_LIST_SUCCESS'; payload: TagsListModel; }
interface GetTagsListFailureAction { type: 'GET_TAGS_LIST_FAILURE'; payload: { error: string; }; }

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction =
  | GetTagsListRequestAction
  | GetTagsListSuccessAction
  | GetTagsListFailureAction
  | UpdateWatchTagSuccessAction
  ;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
  getTagsList: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
    return (async () => {
      dispatch({ type: 'GET_TAGS_LIST_REQUEST' });

      getJson<TagsListModel>('/api/tags', getState().auth.loggedInUser)
        .then((tagsListResponse: TagsListModel) => {
          dispatch({ type: 'GET_TAGS_LIST_SUCCESS', payload: tagsListResponse });
        })
        .catch((reason) => {
          dispatch({
            type: 'GET_TAGS_LIST_FAILURE',
            payload: {
              error: reason || 'Get tags list failed',
            },
          });
        });
    })();
  },
};

// ----------------
// REDUCER - For a given state and action, returns the new state.
// To support time travel, this must not mutate the old state.

const defaultState: ListState = {};

export const reducer: Reducer<ListState> = (state: ListState, action: KnownAction) => {
  switch (action.type) {
    case 'GET_TAGS_LIST_REQUEST':
    case 'GET_TAGS_LIST_FAILURE':
      return state;
    case 'GET_TAGS_LIST_SUCCESS':
      return {
        tagsList: action.payload,
      };
    case 'UPDATE_WATCH_TAG_SUCCESS': {
      if (!state.tagsList) {
        return state;
      }
      // Slice for immutability
      const tagsNext = state.tagsList.tags.slice();
      const tag = tagsNext.filter((x) => x.slug === action.payload.tagSlug)[0];
      if (tag) {
        tag.watching = action.payload.response.watching;
      }
      return {
        tagsList: { tags: tagsNext },
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
