import { Reducer } from 'redux';
import { StatementProps } from '../components/Topic/Statement';
import { TopicProps } from '../components/Topic/Topic';
import { FormProps } from '../components/shared/FormProps';
// tslint:disable-next-line:max-line-length
import { CommentFormModel, CommentListItemModel, StatementFormModel, StatementListItemModel, StatementModel, TopicModel } from '../server-models';
import { getJson, postJson } from '../utils';
import { AppThunkAction } from './';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface ContainerState {
    topic?: TopicProps;
    statementForm?: FormProps<StatementFormModel>;
    statement?: StatementProps;
    commentForm?: FormProps<CommentFormModel>;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

interface GetTopicRequestedAction { type: 'GET_TOPIC_REQUESTED'; payload: { topicUrlFragment: string; }; }
interface GetTopicSuccessAction {
    type: 'GET_TOPIC_SUCCESS';
    payload: { topic: TopicModel; topicUrlFragment: string; };
}
interface GetTopicFailedAction { type: 'GET_TOPIC_FAILED'; payload: { error: string; }; }
interface StatementFormSubmittedAction { type: 'STATEMENT_FORM_SUBMITTED'; }
interface StatementFormReceivedAction {
    type: 'STATEMENT_FORM_RECEIVED';
    payload: { statementListItem: StatementListItemModel; };
}
interface StatementFormFailedAction { type: 'STATEMENT_FORM_FAILED'; payload: { error?: string; }; }

interface GetStatementRequestedAction {
    type: 'GET_STATEMENT_REQUESTED';
    payload: { statementId: number; };
}
interface GetStatementSuccessAction {
    type: 'GET_STATEMENT_SUCCESS';
    payload: {
        statement: StatementModel;
        topicUrlFragment: string;
        statementId: number;
    };
}
interface GetStatementFailedAction { type: 'GET_STATEMENT_FAILED'; payload: { error: string; }; }
interface CommentFormSubmittedAction { type: 'COMMENT_FORM_SUBMITTED'; }
interface CommentFormReceivedAction {
    type: 'COMMENT_FORM_RECEIVED';
    payload: { commentListItem: CommentListItemModel; };
}
interface CommentFormFailedAction { type: 'COMMENT_FORM_FAILED'; payload: { error?: string; }; }

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction = GetTopicRequestedAction
    | GetTopicSuccessAction
    | GetTopicFailedAction
    | StatementFormSubmittedAction
    | StatementFormReceivedAction
    | StatementFormFailedAction
    | GetStatementRequestedAction
    | GetStatementSuccessAction
    | GetStatementFailedAction
    | CommentFormSubmittedAction
    | CommentFormReceivedAction
    | CommentFormFailedAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    getTopic: (topicUrlFragment: string): AppThunkAction<KnownAction> => (dispatch, getState) => {
        return (async () => {
            dispatch({ type: 'GET_TOPIC_REQUESTED', payload: { topicUrlFragment } });

            getJson<TopicModel>(`/api/topics/${topicUrlFragment}`)
                .then((topicResponse: TopicModel) => {
                    dispatch({
                        type: 'GET_TOPIC_SUCCESS',
                        payload: { topic: topicResponse, topicUrlFragment },
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
                    dispatch({ type: 'STATEMENT_FORM_FAILED', payload: {} });
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
    getStatement: (topicUrlFragment: string, statementId: number): AppThunkAction<KnownAction> =>
        (dispatch, getState) => {
            return (async () => {
                dispatch({ type: 'GET_STATEMENT_REQUESTED', payload: { statementId } });

                getJson<StatementModel>(`/api/topics/${topicUrlFragment}/statements/${statementId}`)
                    .then((statementResponse: StatementModel) => {
                        dispatch({
                            type: 'GET_STATEMENT_SUCCESS',
                            payload: { statement: statementResponse, topicUrlFragment, statementId },
                        });
                    })
                    .catch((reason) => {
                        dispatch({
                            type: 'GET_STATEMENT_FAILED',
                            payload: { error: reason || 'Get statement failed' },
                        });
                    });
            })();
        },
    submitComment: (topicUrlFragment: string, statementId: number, commentForm: CommentFormModel):
        AppThunkAction<KnownAction> => (dispatch, getState) => {
            return (async () => {
                dispatch({ type: 'COMMENT_FORM_SUBMITTED' });

                if (!commentForm.text) {
                    // Don't set an error message, the validation properties will display instead
                    dispatch({ type: 'COMMENT_FORM_FAILED', payload: {} });
                    return;
                }

                postJson<CommentListItemModel>(
                    `/api/topics/${topicUrlFragment}/statements/${statementId}/comments`,
                    commentForm, getState().login.loggedInUser!)
                    .then((responseModel: CommentListItemModel) => {
                        dispatch({ type: 'COMMENT_FORM_RECEIVED', payload: { commentListItem: responseModel } });
                    })
                    .catch((reason: string) => {
                        dispatch({
                            type: 'COMMENT_FORM_FAILED',
                            payload: { error: reason || 'Posting comment failed' },
                        });
                    });
            })();
        },
};

// ----------------
// REDUCER - For a given state and action, returns the new state.
// To support time travel, this must not mutate the old state.

const defaultState: ContainerState = {};

export const reducer: Reducer<ContainerState> = (state: ContainerState, action: KnownAction) => {
    switch (action.type) {
        case 'GET_TOPIC_REQUESTED':
            return {
                topic: {
                    loading: true,
                    urlFragment: action.payload.topicUrlFragment,
                },
            };
        case 'GET_TOPIC_SUCCESS':
            return {
                topic: {
                    urlFragment: action.payload.topicUrlFragment,
                    model: action.payload.topic,
                },
                statementForm: {},
            };
        case 'GET_TOPIC_FAILED':
            return {
                topic: { error: action.payload.error },
            };
        case 'STATEMENT_FORM_SUBMITTED':
            return {
                topic: state.topic,
                statementForm: {
                    submitting: true,
                    submitted: true,
                },
                statement: state.statement,
                commentForm: state.commentForm,
            };
        case 'STATEMENT_FORM_RECEIVED': {
            const topicModel = state.topic!.model!;
            // Slice for immutability
            const statementsNext = topicModel.statements.slice();
            statementsNext.push(action.payload.statementListItem);
            const topicNext = { ...topicModel, statements: statementsNext };
            return {
                topic: {
                    urlFragment: state.topic!.urlFragment,
                    model: topicNext,
                },
                statementForm: {},
            };
        }
        case 'STATEMENT_FORM_FAILED':
            return {
                topic: state.topic,
                statementForm: {
                    submitted: true,
                    error: action.payload.error,
                },
                statement: state.statement,
                commentForm: state.commentForm,
            };
        case 'GET_STATEMENT_REQUESTED':
            return {
                topic: state.topic,
                statementForm: state.statementForm,
                statement: {
                    loading: true,
                    statementId: action.payload.statementId,
                },
            };
        case 'GET_STATEMENT_SUCCESS':
            return {
                topic: state.topic,
                statementForm: state.statementForm,
                statement: {
                    statementId: action.payload.statementId,
                    model: action.payload.statement,
                },
                commentForm: {},
            };
        case 'GET_STATEMENT_FAILED':
            return {
                topic: state.topic,
                statementForm: state.statementForm,
                statement: { error: action.payload.error },
            };
        case 'COMMENT_FORM_SUBMITTED':
            return {
                ...state,
                commentForm: {
                    submitting: true,
                    submitted: true,
                },
            };
        case 'COMMENT_FORM_RECEIVED': {
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
                commentForm: {},
            };
        }
        case 'COMMENT_FORM_FAILED':
            return {
                ...state,
                commentForm: {
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
