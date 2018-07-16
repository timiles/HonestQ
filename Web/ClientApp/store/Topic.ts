import { AnyAction, Reducer } from 'redux';
import { StatementProps } from '../components/Topic/Statement';
import { TopicProps } from '../components/Topic/Topic';
import { StatementModel, TopicModel } from '../server-models';
import { getJson } from '../utils';
import { AppThunkAction } from './';
import { NewCommentFormReceivedAction } from './NewComment';
import { NewStatementFormReceivedAction } from './NewStatement';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface ContainerState {
    topic: TopicProps;
    statement?: StatementProps;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

interface GetTopicRequestedAction {
    type: 'GET_TOPIC_REQUESTED';
    payload: { topicSlug: string; };
}
interface GetTopicSuccessAction {
    type: 'GET_TOPIC_SUCCESS';
    payload: { topic: TopicModel; topicSlug: string; };
}
interface GetTopicFailedAction {
    type: 'GET_TOPIC_FAILED';
    payload: { topicSlug: string; error: string; };
}

interface GetStatementRequestedAction {
    type: 'GET_STATEMENT_REQUESTED';
    payload: { statementId: number; };
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
    type: 'GET_STATEMENT_FAILED';
    payload: { statementId: number; error: string; };
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction = GetTopicRequestedAction
    | GetTopicSuccessAction
    | GetTopicFailedAction
    | NewStatementFormReceivedAction
    | GetStatementRequestedAction
    | GetStatementSuccessAction
    | GetStatementFailedAction
    | NewCommentFormReceivedAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    getTopic: (topicSlug: string): AppThunkAction<KnownAction> => (dispatch, getState) => {
        return (async () => {
            dispatch({ type: 'GET_TOPIC_REQUESTED', payload: { topicSlug } });

            getJson<TopicModel>(`/api/topics/${topicSlug}`, getState().login.loggedInUser)
                .then((topicResponse: TopicModel) => {
                    dispatch({
                        type: 'GET_TOPIC_SUCCESS',
                        payload: { topic: topicResponse, topicSlug },
                    });
                })
                .catch((reason) => {
                    dispatch({
                        type: 'GET_TOPIC_FAILED',
                        payload: {
                            topicSlug,
                            error: reason || 'Get topic failed',
                        },
                    });
                });
        })();
    },
    getStatement: (topicSlug: string, statementId: number): AppThunkAction<KnownAction> =>
        (dispatch, getState) => {
            return (async () => {
                dispatch({ type: 'GET_STATEMENT_REQUESTED', payload: { statementId } });

                getJson<StatementModel>(`/api/topics/${topicSlug}/statements/${statementId}`,
                    getState().login.loggedInUser)
                    .then((statementResponse: StatementModel) => {
                        dispatch({
                            type: 'GET_STATEMENT_SUCCESS',
                            payload: { statement: statementResponse, topicSlug, statementId },
                        });
                    })
                    .catch((reason) => {
                        dispatch({
                            type: 'GET_STATEMENT_FAILED',
                            payload: {
                                statementId,
                                error: reason || 'Get statement failed',
                            },
                        });
                    });
            })();
        },
};

// ----------------
// REDUCER - For a given state and action, returns the new state.
// To support time travel, this must not mutate the old state.

const defaultState: ContainerState = { topic: {} };

export const reducer: Reducer<ContainerState> = (state: ContainerState, anyAction: AnyAction) => {
    // Currently all actions have payload so compiler doesn't like matching AnyAction with KnownAction
    const action = anyAction as KnownAction;
    switch (action.type) {
        case 'GET_TOPIC_REQUESTED':
            return {
                ...state,
                topic: {
                    loading: true,
                    slug: action.payload.topicSlug,
                },
            };
        case 'GET_TOPIC_SUCCESS':
            return {
                // NOTE: Statement is possibly already set if GET_STATEMENT_REQUEST returned before GET_TOPIC_REQUEST
                ...state,
                topic: {
                    slug: action.payload.topicSlug,
                    model: action.payload.topic,
                },
            };
        case 'GET_TOPIC_FAILED':
            return {
                ...state,
                topic: {
                    slug: action.payload.topicSlug,
                    error: action.payload.error,
                },
            };
        case 'NEW_STATEMENT_FORM_RECEIVED': {
            const topicModel = state.topic.model!;
            // Slice for immutability
            const statementsNext = topicModel.statements.slice();
            statementsNext.push(action.payload.statementListItem);
            const topicNext = { ...topicModel, statements: statementsNext };
            return {
                ...state,
                topic: {
                    slug: state.topic.slug,
                    model: topicNext,
                },
            };
        }
        case 'GET_STATEMENT_REQUESTED':
            return {
                ...state,
                statement: {
                    loading: true,
                    statementId: action.payload.statementId,
                },
            };
        case 'GET_STATEMENT_SUCCESS':
            return {
                ...state,
                statement: {
                    statementId: action.payload.statementId,
                    model: action.payload.statement,
                },
            };
        case 'GET_STATEMENT_FAILED':
            return {
                ...state,
                statement: {
                    statementId: action.payload.statementId,
                    error: action.payload.error,
                },
            };
        case 'NEW_COMMENT_FORM_RECEIVED': {
            const statementModel = state.statement!.model!;
            // Slice for immutability
            const commentsNext = statementModel.comments.slice();
            commentsNext.push(action.payload.commentListItem);
            const statementNext = { ...statementModel, comments: commentsNext };
            return {
                ...state,
                statement: {
                    statementId: state.statement!.statementId,
                    model: statementNext,
                },
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
