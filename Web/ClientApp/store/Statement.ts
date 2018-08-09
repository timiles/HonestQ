import { AnyAction, Reducer } from 'redux';
import { AppThunkAction } from '.';
import { StatementProps } from '../components/Statement/Statement';
import { CommentModel, StatementModel } from '../server-models';
import { getJson } from '../utils';
import { NewCommentFormReceivedAction } from './NewComment';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface ContainerState {
    statement: StatementProps;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

interface GetStatementRequestedAction {
    type: 'GET_STATEMENT_REQUESTED';
    payload: { statementId: number; };
}
interface GetStatementSuccessAction {
    type: 'GET_STATEMENT_SUCCESS';
    payload: { statementId: number; statement: StatementModel; };
}
interface GetStatementFailedAction {
    type: 'GET_STATEMENT_FAILED';
    payload: { statementId: number; error: string; };
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction =
    | GetStatementRequestedAction
    | GetStatementSuccessAction
    | GetStatementFailedAction
    | NewCommentFormReceivedAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    getStatement: (statementId: number): AppThunkAction<KnownAction> =>
        (dispatch, getState) => {
            return (async () => {
                dispatch({ type: 'GET_STATEMENT_REQUESTED', payload: { statementId } });

                getJson<StatementModel>(`/api/statements/${statementId}`,
                    getState().login.loggedInUser)
                    .then((statementResponse: StatementModel) => {
                        dispatch({
                            type: 'GET_STATEMENT_SUCCESS',
                            payload: { statementId, statement: statementResponse },
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

const defaultState: ContainerState = { statement: {} };

export const reducer: Reducer<ContainerState> = (state: ContainerState, anyAction: AnyAction) => {
    // Currently all actions have payload so compiler doesn't like matching AnyAction with KnownAction
    const action = anyAction as KnownAction;
    switch (action.type) {
        case 'GET_STATEMENT_REQUESTED':
            return {
                statement: {
                    loading: true,
                    statementId: action.payload.statementId,
                },
            };
        case 'GET_STATEMENT_SUCCESS':
            return {
                statement: {
                    statementId: action.payload.statementId,
                    model: action.payload.statement,
                },
            };
        case 'GET_STATEMENT_FAILED':
            return {
                statement: {
                    statementId: action.payload.statementId,
                    error: action.payload.error,
                },
            };
        case 'NEW_COMMENT_FORM_RECEIVED': {
            const statementModel = state.statement!.model!;
            // Slice for immutability
            const commentsNext = statementModel.comments.slice();
            if (action.payload.comment.parentCommentId) {
                appendNewComment(commentsNext, action.payload.comment);
            } else {
                commentsNext.push(action.payload.comment);
            }
            const statementNext = { ...statementModel, comments: commentsNext };
            return {
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

function appendNewComment(comments: CommentModel[], newComments: CommentModel): boolean {
    for (const comment of comments) {
        if (comment.id === newComments.parentCommentId) {
            comment.comments.push(newComments);
            return true;
        }
        if (appendNewComment(comment.comments, newComments)) {
            return true;
        }
    }
    return false;
}
