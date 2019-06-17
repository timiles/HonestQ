import { push } from 'react-router-redux';
import { Reducer } from 'redux';
import { AppThunkAction } from '.';
import { FormProps } from '../components/shared/FormProps';
import { QuestionFormModel, QuestionListItemModel } from '../server-models';
import { postJson } from '../utils/http-utils';
import { buildQuestionUrl } from '../utils/route-utils';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface NewQuestionState {
    questionForm?: FormProps<QuestionFormModel>;
    awaitingApproval?: boolean;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

interface NewQuestionFormRequestAction {
    type: 'NEW_QUESTION_FORM_REQUEST';
}
export interface NewQuestionFormSuccessAction {
    type: 'NEW_QUESTION_FORM_SUCCESS';
    payload: { questionListItem: QuestionListItemModel; };
}
interface NewQuestionFormAwaitingApprovalAction {
    type: 'NEW_QUESTION_FORM_AWAITING_APPROVAL';
}
interface NewQuestionFormResetAction {
    type: 'NEW_QUESTION_FORM_RESET';
}
interface NewQuestionFormFailureAction {
    type: 'NEW_QUESTION_FORM_FAILURE';
    payload: { error: string | null; };
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction =
    | NewQuestionFormRequestAction
    | NewQuestionFormSuccessAction
    | NewQuestionFormAwaitingApprovalAction
    | NewQuestionFormResetAction
    | NewQuestionFormFailureAction
    ;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    submit: (questionForm: QuestionFormModel):
        AppThunkAction<KnownAction> => (dispatch, getState) => {
            return (async () => {
                dispatch({ type: 'NEW_QUESTION_FORM_REQUEST' });

                if (!questionForm.text || questionForm.text.length > 280) {
                    // Don't set an error message, the validation properties will display instead
                    dispatch({ type: 'NEW_QUESTION_FORM_FAILURE', payload: { error: null } });
                    return;
                }

                postJson<QuestionListItemModel>(
                    `/api/questions`, questionForm, getState().login.loggedInUser!)
                    .then((responseModel: QuestionListItemModel) => {
                        if (responseModel) {
                            dispatch({
                                type: 'NEW_QUESTION_FORM_SUCCESS',
                                payload: { questionListItem: responseModel },
                            });
                            setTimeout(() => {
                                // Wait a bit for modal to have closed, then go to new Question
                                dispatch(push(buildQuestionUrl(responseModel.id, responseModel.slug)) as any);
                            }, 700);
                        } else {
                            dispatch({
                                type: 'NEW_QUESTION_FORM_AWAITING_APPROVAL',
                            });
                        }
                    })
                    .catch((reason: string) => {
                        dispatch({
                            type: 'NEW_QUESTION_FORM_FAILURE',
                            payload: { error: reason || 'Posting Question failed' },
                        });
                    });
            })();
        },
    reset: ():
        AppThunkAction<KnownAction> => (dispatch, getState) => {
            return (async () => {
                setTimeout(() => {
                    // Wait a bit for modal to have closed, then reset form
                    dispatch({ type: 'NEW_QUESTION_FORM_RESET' });
                }, 200);
            })();
        },
};

// ----------------
// REDUCER - For a given state and action, returns the new state.
// To support time travel, this must not mutate the old state.

const defaultState: NewQuestionState = { questionForm: {} };

export const reducer: Reducer<NewQuestionState> = (state: NewQuestionState, action: KnownAction) => {
    switch (action.type) {
        case 'NEW_QUESTION_FORM_REQUEST':
            return {
                questionForm: {
                    submitting: true,
                    submitted: true,
                },
            };
        case 'NEW_QUESTION_FORM_SUCCESS':
            return defaultState;
        case 'NEW_QUESTION_FORM_AWAITING_APPROVAL':
            return {
                questionForm: {},
                awaitingApproval: true,
            };
        case 'NEW_QUESTION_FORM_RESET':
            return defaultState;
        case 'NEW_QUESTION_FORM_FAILURE':
            return {
                questionForm: {
                    submitting: false,
                    submitted: true,
                    error: action.payload.error,
                },
            };

        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    // For unrecognized actions (or in cases where actions have no effect), must return the existing state
    //  (or default initial state if none was supplied)
    return state || defaultState;
};
