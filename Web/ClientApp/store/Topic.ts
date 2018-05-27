import { Reducer } from 'redux';
import { TopicProps } from '../components/Topic/Topic';
import { FormProps } from '../components/shared/FormProps';
import { StatementFormModel, StatementListItemModel, TopicModel } from '../server-models';
import { getJson, postJson } from '../utils';
import { AppThunkAction } from './';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface ContainerState {
    currentUrlFragment?: string;
    topic: TopicProps;
    statementForm: FormProps<StatementFormModel>;
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
    submitStatement: (topicUrlFragment: string, statementForm: StatementFormModel):
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

const defaultState: ContainerState = { topic: {}, statementForm: {} };

export const reducer: Reducer<ContainerState> = (state: ContainerState, action: KnownAction) => {
    switch (action.type) {
        case 'GET_TOPIC_REQUESTED':
            return {
                topic: { loading: true },
                statementForm: state.statementForm,
            };
        case 'GET_TOPIC_SUCCESS':
            return {
                currentUrlFragment: action.payload.urlFragment,
                topic: { model: action.payload.topic },
                statementForm: state.statementForm,
            };
        case 'GET_TOPIC_FAILED':
            return {
                topic: { error: action.payload.error },
                statementForm: state.statementForm,
            };
        case 'STATEMENT_FORM_SUBMITTED':
            return {
                currentUrlFragment: state.currentUrlFragment,
                topic: state.topic,
                statementForm: {
                    submitting: true,
                    submitted: true,
                },
            };
        case 'STATEMENT_FORM_RECEIVED': {
            const topicModel = state.topic!.model!;
            // Slice for immutability
            const statementsNext = topicModel.statements.slice();
            statementsNext.push(action.payload.statementListItem);
            const topicNext = { ...topicModel, statements: statementsNext };
            return {
                currentUrlFragment: state.currentUrlFragment,
                topic: { model: topicNext },
                statementForm: {},
            };
        }
        case 'STATEMENT_FORM_FAILED':
            return {
                currentUrlFragment: state.currentUrlFragment,
                topic: state.topic,
                statementForm: {
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
