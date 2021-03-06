import { Reducer } from 'redux';
import { AppThunkAction } from '.';
import { AnswerFormModel, AnswerModel } from '../server-models';
import { postJson } from '../utils/http-utils';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface NewAnswerState {
  submitting?: boolean;
  submitted?: boolean;
  error?: string | null;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

interface NewAnswerFormRequestAction {
  type: 'NEW_ANSWER_FORM_REQUEST';
}
export interface NewAnswerFormSuccessAction {
  type: 'NEW_ANSWER_FORM_SUCCESS';
  payload: { questionId: number; answer: AnswerModel; };
}
interface NewAnswerFormFailureAction {
  type: 'NEW_ANSWER_FORM_FAILURE';
  payload: { error?: string; };
}
interface NewAnswerFormResetAction {
  type: 'NEW_ANSWER_FORM_RESET';
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction = NewAnswerFormRequestAction
  | NewAnswerFormSuccessAction
  | NewAnswerFormFailureAction
  | NewAnswerFormResetAction
  ;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
  submit: (questionId: number, answerForm: AnswerFormModel):
    AppThunkAction<KnownAction> => (dispatch, getState) => {
      return (async () => {
        dispatch({ type: 'NEW_ANSWER_FORM_REQUEST' });

        if (!answerForm.text || answerForm.text.length > 280 ||
          (answerForm.commentSource && !answerForm.commentText)) {
          // Don't set an error message, the validation properties will display instead
          dispatch({ type: 'NEW_ANSWER_FORM_FAILURE', payload: {} });
          return;
        }

        postJson<AnswerModel>(
          `/api/questions/${questionId}/answers`,
          answerForm, getState().auth.loggedInUser!)
          .then((responseModel: AnswerModel) => {
            dispatch({
              type: 'NEW_ANSWER_FORM_SUCCESS',
              payload: { questionId, answer: responseModel },
            });
          })
          .catch((reason: string) => {
            dispatch({
              type: 'NEW_ANSWER_FORM_FAILURE',
              payload: { error: reason || 'Posting answer failed' },
            });
          });
      })();
    },
  reset: (): AppThunkAction<KnownAction> => (dispatch) => {
    return (async () => { dispatch({ type: 'NEW_ANSWER_FORM_RESET' }); })();
  },
};

// ----------------
// REDUCER - For a given state and action, returns the new state.
// To support time travel, this must not mutate the old state.

const defaultState: NewAnswerState = {};

export const reducer: Reducer<NewAnswerState> = (state: NewAnswerState, action: KnownAction) => {
  switch (action.type) {
    case 'NEW_ANSWER_FORM_REQUEST':
      return {
        submitting: true,
        submitted: true,
      };
    case 'NEW_ANSWER_FORM_RESET':
    case 'NEW_ANSWER_FORM_SUCCESS':
      return defaultState;
    case 'NEW_ANSWER_FORM_FAILURE':
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
