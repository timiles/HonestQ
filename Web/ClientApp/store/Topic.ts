import { Reducer } from 'redux';
import { StatementFormModel, StatementListItemModel, TopicModel } from '../server-models';
import { getJson, postJson } from '../utils';
import { AppThunkAction } from './';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface TopicState {
    loading: boolean;
    urlFragment?: string;
    topic?: TopicModel;
    submittingStatement?: boolean;
    submittedStatement?: boolean;
    error?: string | null;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

interface GetTopicRequestedAction { type: 'GET_TOPIC_REQUESTED'; }
interface GetTopicSuccessAction { type: 'GET_TOPIC_SUCCESS'; payload: { topic: TopicModel; urlFragment: string; }; }
interface GetTopicFailedAction { type: 'GET_TOPIC_FAILED'; payload: { error: string; }; }
interface StatementFormSubmittedAction { type: 'STATEMENT_FORM_SUBMITTED'; }
interface StatementFormReceivedAction {
    type: 'STATEMENT_FORM_RECEIVED';
    payload: { statementListItem: StatementListItemModel; };
}
interface StatementFormFailedAction { type: 'STATEMENT_FORM_FAILED'; payload: { error: string | null; }; }

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction = GetTopicRequestedAction
    | GetTopicSuccessAction
    | GetTopicFailedAction
    | StatementFormSubmittedAction
    | StatementFormReceivedAction
    | StatementFormFailedAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    getTopic: (topicUrlFragment: string): AppThunkAction<KnownAction> => (dispatch, getState) => {
        return (async () => {
            dispatch({ type: 'GET_TOPIC_REQUESTED' });

            getJson<TopicModel>(`/api/topics/${topicUrlFragment}`)
                .then((topicResponse: TopicModel) => {
                    dispatch({
                        type: 'GET_TOPIC_SUCCESS',
                        payload: { topic: topicResponse, urlFragment: topicUrlFragment },
                    });
                })
                .catch((reason) => {
                    dispatch({ type: 'GET_TOPIC_FAILED', payload: { error: reason || 'Get topic failed' } });
                });
        })();
    },
    submit: (topicUrlFragment: string, statementForm: StatementFormModel):
        AppThunkAction<KnownAction> => (dispatch, getState) => {
            return (async () => {
                dispatch({ type: 'STATEMENT_FORM_SUBMITTED' });

                if (!statementForm.text) {
                    // Don't set an error message, the validation properties will display instead
                    dispatch({ type: 'STATEMENT_FORM_FAILED', payload: { error: null } });
                    return;
                }

                postJson<StatementListItemModel>(
                    `/api/topics/${topicUrlFragment}/statements`, statementForm, getState().login.loggedInUser!)
                    .then((responseModel: StatementListItemModel) => {
                        dispatch({ type: 'STATEMENT_FORM_RECEIVED', payload: { statementListItem: responseModel } });
                    })
                    .catch((reason: string) => {
                        dispatch({
                            type: 'STATEMENT_FORM_FAILED',
                            payload: { error: reason || 'Posting statement failed' },
                        });
                    });
            })();
        },
};

// ----------------
// REDUCER - For a given state and action, returns the new state.
// To support time travel, this must not mutate the old state.

const defaultState: TopicState = { loading: false };

export const reducer: Reducer<TopicState> = (state: TopicState, action: KnownAction) => {
    switch (action.type) {
        case 'GET_TOPIC_REQUESTED':
            return { loading: true };
        case 'GET_TOPIC_SUCCESS':
            return { loading: false, topic: action.payload.topic, urlFragment: action.payload.urlFragment };
        case 'GET_TOPIC_FAILED':
            return { loading: false, error: action.payload.error };
        case 'STATEMENT_FORM_SUBMITTED':
            return {
                loading: false,
                submittingStatement: true,
                submittedStatement: true,
                topic: state.topic,
                urlFragment: state.urlFragment,
            };
        case 'STATEMENT_FORM_RECEIVED': {
            // Slice for immutability
            const newStatements = state.topic!.statements.slice();
            newStatements.push(action.payload.statementListItem);
            const newTopic = { ...state.topic!, statements: newStatements };
            return {
                loading: false,
                submittingStatement: false,
                submittedStatement: false,
                topic: newTopic,
                urlFragment: state.urlFragment,
            };
        }
        case 'STATEMENT_FORM_FAILED':
            return {
                loading: false,
                submittingStatement: false,
                submittedStatement: true,
                error: action.payload.error,
                topic: state.topic,
                urlFragment: state.urlFragment,
            };

        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    // For unrecognized actions (or in cases where actions have no effect), must return the existing state
    //  (or default initial state if none was supplied)
    return state || defaultState;
};
