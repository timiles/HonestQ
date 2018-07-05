import { Reducer } from 'redux';
import { LoadingProps } from '../components/shared/Loading';
import { getJson, putJson } from '../utils';
import { AppThunkAction } from './';
import { StatementFormModel, StatementModel } from './../server-models';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface EditStatementState {
    statementModel: LoadingProps<StatementModel>;
    successfullySaved?: boolean;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

interface GetStatementRequestedAction {
    type: 'GET_STATEMENT_REQUESTED'; payload: {
        topicSlug: string;
        statementId: number;
    };
}
interface GetStatementSuccessAction {
    type: 'GET_STATEMENT_SUCCESS';
    payload: {
        statement: StatementModel;
        topicSlug: string;
        statementId: number;
    };
}
interface GetStatementFailedAction {
    type: 'GET_STATEMENT_FAILED'; payload: {
        topicSlug: string;
        statementId: number;
        error: string;
    };
}
interface EditStatementFormSubmittedAction { type: 'EDIT_STATEMENT_FORM_SUBMITTED'; }
interface EditStatementFormReceivedAction {
    type: 'EDIT_STATEMENT_FORM_RECEIVED'; payload: {
        statementId: number;
        statement: StatementModel;
    };
}
interface EditStatementFormFailedAction { type: 'EDIT_STATEMENT_FORM_FAILED'; payload: { error: string | null; }; }

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction = GetStatementRequestedAction
    | GetStatementSuccessAction
    | GetStatementFailedAction
    | EditStatementFormSubmittedAction
    | EditStatementFormReceivedAction
    | EditStatementFormFailedAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    getStatement: (topicSlug: string, statementId: number): AppThunkAction<KnownAction> => (dispatch, getState) => {
        return (async () => {
            dispatch({ type: 'GET_STATEMENT_REQUESTED', payload: { topicSlug, statementId } });

            getJson<StatementModel>(`/api/topics/${topicSlug}/statements/${statementId}`, getState().login.loggedInUser)
                .then((statementResponse: StatementModel) => {
                    dispatch({
                        type: 'GET_STATEMENT_SUCCESS',
                        payload: { statement: statementResponse, topicSlug, statementId },
                    });
                })
                .catch((reason) => {
                    dispatch({
                        type: 'GET_STATEMENT_FAILED', payload: {
                            topicSlug,
                            statementId,
                            error: reason || 'Get topic failed',
                        },
                    });
                });
        })();
    },
    submit: (topicSlug: string, statementId: number, statementForm: StatementFormModel):
        AppThunkAction<KnownAction> => (dispatch, getState) => {
            return (async () => {
                dispatch({ type: 'EDIT_STATEMENT_FORM_SUBMITTED' });

                if (!statementForm.text || !statementForm.stance) {
                    // Don't set an error message, the validation properties will display instead
                    dispatch({ type: 'EDIT_STATEMENT_FORM_FAILED', payload: { error: null } });
                    return;
                }

                putJson<StatementModel>(
                    `/api/topics/${topicSlug}/statements/${statementId}`, statementForm, getState().login.loggedInUser!)
                    .then((statementResponse: StatementModel) => {
                        dispatch({
                            type: 'EDIT_STATEMENT_FORM_RECEIVED', payload: {
                                statementId,
                                statement: statementResponse,
                            },
                        });
                    })
                    .catch((reason: string) => {
                        dispatch({ type: 'EDIT_STATEMENT_FORM_FAILED', payload: { error: reason } });
                    });
            })();
        },
};

// ----------------
// REDUCER - For a given state and action, returns the new state.
// To support time travel, this must not mutate the old state.

const defaultState: EditStatementState = { statementModel: {} };

export const reducer: Reducer<EditStatementState> = (state: EditStatementState, action: KnownAction) => {
    switch (action.type) {
        case 'GET_STATEMENT_REQUESTED':
            return {
                statementModel: {
                    id: action.payload.statementId.toString(),
                    loading: true,
                },
                editStatementForm: {},
            };
        case 'GET_STATEMENT_SUCCESS':
            return {
                statementModel: {
                    id: action.payload.statementId.toString(),
                    loadedModel: action.payload.statement,
                },
            };
        case 'GET_STATEMENT_FAILED':
            return {
                statementModel: {
                    id: action.payload.statementId.toString(),
                    error: action.payload.error,
                },
            };
        case 'EDIT_STATEMENT_FORM_SUBMITTED':
            return {
                statementModel: state.statementModel,
                editStatementForm: {
                    submitting: true,
                    submitted: true,
                },
            };
        case 'EDIT_STATEMENT_FORM_RECEIVED':
            return {
                statementModel: {
                    id: action.payload.statementId.toString(),
                    loadedModel: action.payload.statement,
                },
                editStatementForm: {
                    submitting: false,
                    submitted: false,
                },
                successfullySaved: true,
            };
        case 'EDIT_STATEMENT_FORM_FAILED':
            return {
                statementModel: state.statementModel,
                editStatementForm: {
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
