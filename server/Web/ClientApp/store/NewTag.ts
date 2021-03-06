import { Reducer } from 'redux';
import { AppThunkAction } from '.';
import { TagFormModel } from '../server-models';
import { postJson } from '../utils/http-utils';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface NewTagState {
  previouslySubmittedTagFormModel?: TagFormModel;
  submitting?: boolean;
  submitted?: boolean;
  error?: string | null;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

interface TagFormRequestAction { type: 'TAG_FORM_REQUEST'; }
interface TagFormSuccessAction { type: 'TAG_FORM_SUCCESS'; payload: { tag: TagFormModel; }; }
interface TagFormFailureAction { type: 'TAG_FORM_FAILURE'; payload: { error: string | null; }; }

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction = TagFormRequestAction
  | TagFormSuccessAction
  | TagFormFailureAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
  submit: (tagForm: TagFormModel): AppThunkAction<KnownAction> => (dispatch, getState) => {
    return (async () => {
      dispatch({ type: 'TAG_FORM_REQUEST' });

      if (!tagForm.name || (tagForm.description && tagForm.description.length > 280)) {
        // Don't set an error message, the validation properties will display instead
        dispatch({ type: 'TAG_FORM_FAILURE', payload: { error: null } });
        return;
      }

      postJson('/api/tags', tagForm, getState().login.loggedInUser!)
        .then(() => {
          dispatch({ type: 'TAG_FORM_SUCCESS', payload: { tag: tagForm } });
        })
        .catch((reason: string) => {
          dispatch({ type: 'TAG_FORM_FAILURE', payload: { error: reason } });
        });
    })();
  },
};

// ----------------
// REDUCER - For a given state and action, returns the new state.
// To support time travel, this must not mutate the old state.

const defaultState: NewTagState = {};

export const reducer: Reducer<NewTagState> = (state: NewTagState, action: KnownAction) => {
  switch (action.type) {
    case 'TAG_FORM_REQUEST':
      return { submitting: true, submitted: true };
    case 'TAG_FORM_SUCCESS':
      return { submitting: false, submitted: false, previouslySubmittedTagFormModel: action.payload.tag };
    case 'TAG_FORM_FAILURE':
      return { submitting: false, submitted: true, error: action.payload.error };

    default:
      // The following line guarantees that every action in the KnownAction union has been covered by a case above
      const exhaustiveCheck: never = action;
  }

  // For unrecognized actions (or in cases where actions have no effect), must return the existing state
  //  (or default initial state if none was supplied)
  return state || defaultState;
};
