import { Reducer } from 'redux';
import { AppThunkAction } from '.';
import { AnswerFormModel, AnswerModel, QuestionModel } from '../server-models';
import { getJson, putJson } from '../utils/http-utils';
import { FormProps } from './../components/shared/FormProps';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface EditAnswerState {
  editAnswerForm: FormProps<AnswerFormModel>;
  savedSuccessfully?: boolean;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

interface GetEditAnswerRequestAction {
  type: 'GET_EDIT_ANSWER_REQUEST';
}
interface GetEditAnswerSuccessAction {
  type: 'GET_EDIT_ANSWER_SUCCESS';
  payload: { answerId: number; answer: AnswerModel; };
}
interface GetEditAnswerFailureAction {
  type: 'GET_EDIT_ANSWER_FAILURE';
  payload: { error: string; };
}
interface EditAnswerFormRequestAction {
  type: 'EDIT_ANSWER_FORM_REQUEST';
}
interface EditAnswerFormSuccessAction {
  type: 'EDIT_ANSWER_FORM_SUCCESS';
  payload: { answerId: number; answer: AnswerModel; };
}
interface EditAnswerFormFailureAction {
  type: 'EDIT_ANSWER_FORM_FAILURE';
  payload: { error: string | null; };
}
interface EditAnswerFormResetAction {
  type: 'EDIT_ANSWER_FORM_RESET';
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction =
  | GetEditAnswerRequestAction
  | GetEditAnswerSuccessAction
  | GetEditAnswerFailureAction
  | EditAnswerFormRequestAction
  | EditAnswerFormSuccessAction
  | EditAnswerFormFailureAction
  | EditAnswerFormResetAction
  ;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
  getAnswer: (questionId: number, answerId: number): AppThunkAction<KnownAction> => (dispatch, getState) => {
    return (async () => {
      dispatch({ type: 'GET_EDIT_ANSWER_REQUEST' });

      getJson<QuestionModel>(`/api/questions/${questionId}`, getState().login.loggedInUser)
        .then((questionResponse: QuestionModel) => {
          const answerResponse = questionResponse.answers.filter((x) => x.id === answerId)[0];
          dispatch({
            type: 'GET_EDIT_ANSWER_SUCCESS',
            payload: { answerId, answer: answerResponse },
          });
        })
        .catch((reason) => {
          dispatch({
            type: 'GET_EDIT_ANSWER_FAILURE',
            payload: { error: reason || 'Get answer failed' },
          });
        });
    })();
  },
  submit: (questionId: number, answerId: number, answerForm: AnswerFormModel):
    AppThunkAction<KnownAction> => (dispatch, getState) => {
      return (async () => {
        dispatch({ type: 'EDIT_ANSWER_FORM_REQUEST' });

        if (!answerForm.text || answerForm.text.length > 280) {
          // Don't set an error message, the validation properties will display instead
          dispatch({ type: 'EDIT_ANSWER_FORM_FAILURE', payload: { error: null } });
          return;
        }

        putJson<AnswerModel>(
          `/api/questions/${questionId}/answers/${answerId}`, answerForm, getState().login.loggedInUser!)
          .then((answerResponse: AnswerModel) => {
            dispatch({
              type: 'EDIT_ANSWER_FORM_SUCCESS',
              payload: { answerId, answer: answerResponse },
            });
          })
          .catch((reason: string) => {
            dispatch({ type: 'EDIT_ANSWER_FORM_FAILURE', payload: { error: reason } });
          });
      })();
    },
  resetForm: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
    return (async () => {
      dispatch({ type: 'EDIT_ANSWER_FORM_RESET' });
    })();
  },
};

// ----------------
// REDUCER - For a given state and action, returns the new state.
// To support time travel, this must not mutate the old state.

const defaultState: EditAnswerState = { editAnswerForm: {} };

export const reducer: Reducer<EditAnswerState> = (state: EditAnswerState, action: KnownAction) => {
  switch (action.type) {
    case 'GET_EDIT_ANSWER_REQUEST':
    case 'GET_EDIT_ANSWER_FAILURE':
      return state;
    case 'GET_EDIT_ANSWER_SUCCESS':
      return {
        editAnswerForm: {
          initialState: action.payload.answer,
        },
      };
    case 'EDIT_ANSWER_FORM_REQUEST':
      return {
        editAnswerForm: {
          submitting: true,
          submitted: true,
        },
      };
    case 'EDIT_ANSWER_FORM_SUCCESS':
      return {
        editAnswerForm: {
          submitting: false,
          submitted: false,
        },
        savedSuccessfully: true,
      };
    case 'EDIT_ANSWER_FORM_FAILURE':
      return {
        editAnswerForm: {
          submitting: false,
          submitted: true,
          error: action.payload.error,
        },
      };
    case 'EDIT_ANSWER_FORM_RESET':
      return defaultState;

    default:
      // The following line guarantees that every action in the KnownAction union has been covered by a case above
      const exhaustiveCheck: never = action;
  }

  // For unrecognized actions (or in cases where actions have no effect), must return the existing state
  //  (or default initial state if none was supplied)
  return state || defaultState;
};
