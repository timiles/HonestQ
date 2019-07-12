import { Reducer } from 'redux';
import { AppThunkAction } from '.';
import { CommentFormModel, CommentModel } from '../server-models';
import { postJson } from '../utils/http-utils';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface NewCommentState {
  submitting?: boolean;
  submitted?: boolean;
  error?: string | null;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

interface NewCommentFormRequestAction {
  type: 'NEW_COMMENT_FORM_REQUEST';
}
export interface NewCommentFormSuccessAction {
  type: 'NEW_COMMENT_FORM_SUCCESS';
  payload: { answerId: number; comment: CommentModel; };
}
interface NewCommentFormFailureAction {
  type: 'NEW_COMMENT_FORM_FAILURE';
  payload: { error?: string; };
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction = NewCommentFormRequestAction
  | NewCommentFormSuccessAction
  | NewCommentFormFailureAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
  submit: (questionId: number, answerId: number, commentForm: CommentFormModel):
    AppThunkAction<KnownAction> => (dispatch, getState) => {
      return (async () => {
        dispatch({ type: 'NEW_COMMENT_FORM_REQUEST' });

        if (!commentForm.text || commentForm.text.length > 280) {
          // Don't set an error message, the validation properties will display instead
          dispatch({ type: 'NEW_COMMENT_FORM_FAILURE', payload: {} });
          return;
        }

        postJson<CommentModel>(
          `/api/questions/${questionId}/answers/${answerId}/comments`,
          commentForm, getState().auth.loggedInUser!)
          .then((responseModel: CommentModel) => {
            dispatch({
              type: 'NEW_COMMENT_FORM_SUCCESS',
              payload: { answerId, comment: responseModel },
            });
          })
          .catch((reason: string) => {
            dispatch({
              type: 'NEW_COMMENT_FORM_FAILURE',
              payload: { error: reason || 'Posting comment failed' },
            });
          });
      })();
    },
};

// ----------------
// REDUCER - For a given state and action, returns the new state.
// To support time travel, this must not mutate the old state.

const defaultState: NewCommentState = {};

export const reducer: Reducer<NewCommentState> = (state: NewCommentState, action: KnownAction) => {
  switch (action.type) {
    case 'NEW_COMMENT_FORM_REQUEST':
      return {
        submitting: true,
        submitted: true,
      };
    case 'NEW_COMMENT_FORM_SUCCESS':
      return defaultState;
    case 'NEW_COMMENT_FORM_FAILURE':
      return {
        submitted: true,
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
