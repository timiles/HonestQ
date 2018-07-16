import { push } from 'react-router-redux';
import { Reducer } from 'redux';
import { AppThunkAction } from '.';
import { FormProps } from '../components/shared/FormProps';
import { StatementFormModel, StatementListItemModel } from '../server-models';
import { postJson } from '../utils';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface NewStatementState {
    statementForm?: FormProps<StatementFormModel>;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

interface NewStatementFormSubmittedAction {
    type: 'NEW_STATEMENT_FORM_SUBMITTED';
}
export interface NewStatementFormReceivedAction {
    type: 'NEW_STATEMENT_FORM_RECEIVED';
    payload: { statementListItem: StatementListItemModel; };
}
interface NewStatementFormFailedAction {
    type: 'NEW_STATEMENT_FORM_FAILED';
    payload: { error: string | null; };
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction = NewStatementFormSubmittedAction
    | NewStatementFormReceivedAction
    | NewStatementFormFailedAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    submit: (topicSlug: string, statementForm: StatementFormModel):
        AppThunkAction<KnownAction> => (dispatch, getState) => {
            return (async () => {
                dispatch({ type: 'NEW_STATEMENT_FORM_SUBMITTED' });

                if (!statementForm.text || !statementForm.stance) {
                    // Don't set an error message, the validation properties will display instead
                    dispatch({ type: 'NEW_STATEMENT_FORM_FAILED', payload: { error: null } });
                    return;
                }

                postJson<StatementListItemModel>(
                    `/api/topics/${topicSlug}/statements`, statementForm, getState().login.loggedInUser!)
                    .then((statementResponse: StatementListItemModel) => {
                        dispatch({
                            type: 'NEW_STATEMENT_FORM_RECEIVED', payload: {
                                statementListItem: statementResponse,
                            },
                        });
                        setTimeout(() => {
                            // First slide back to Topic
                            dispatch(push(`/${topicSlug}`) as any);

                            setTimeout(() => {
                                // Then slide onto new Statement
                                const statementUrl = `/${topicSlug}/${statementResponse.id}/${statementResponse.slug}`;
                                dispatch(push(statementUrl) as any);
                            }, 700);
                        }, 100);
                    })
                    .catch((reason: string) => {
                        dispatch({ type: 'NEW_STATEMENT_FORM_FAILED', payload: { error: reason } });
                    });
            })();
        },
};

// ----------------
// REDUCER - For a given state and action, returns the new state.
// To support time travel, this must not mutate the old state.

const defaultState: NewStatementState = { statementForm: {} };

export const reducer: Reducer<NewStatementState> = (state: NewStatementState, action: KnownAction) => {
    switch (action.type) {
        case 'NEW_STATEMENT_FORM_SUBMITTED':
            return {
                statementForm: {
                    submitting: true,
                    submitted: true,
                },
            };
        case 'NEW_STATEMENT_FORM_RECEIVED':
            return defaultState;
        case 'NEW_STATEMENT_FORM_FAILED':
            return {
                statementForm: {
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
