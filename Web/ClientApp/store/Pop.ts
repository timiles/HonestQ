import { AnyAction, Reducer } from 'redux';
import { AppThunkAction } from '.';
import { PopProps } from '../components/Pop/Pop';
import { CommentModel, PopModel } from '../server-models';
import { getJson } from '../utils';
import { NewCommentFormReceivedAction } from './NewComment';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface ContainerState {
    pop: PopProps;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

interface GetPopRequestedAction {
    type: 'GET_POP_REQUESTED';
    payload: { questionId: number; };
}
interface GetPopSuccessAction {
    type: 'GET_POP_SUCCESS';
    payload: { questionId: number; pop: PopModel; };
}
interface GetPopFailedAction {
    type: 'GET_POP_FAILED';
    payload: { questionId: number; error: string; };
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction =
    | GetPopRequestedAction
    | GetPopSuccessAction
    | GetPopFailedAction
    | NewCommentFormReceivedAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    getPop: (questionId: number): AppThunkAction<KnownAction> =>
        (dispatch, getState) => {
            return (async () => {
                dispatch({ type: 'GET_POP_REQUESTED', payload: { questionId } });

                getJson<PopModel>(`/api/pops/${questionId}`,
                    getState().login.loggedInUser)
                    .then((popResponse: PopModel) => {
                        dispatch({
                            type: 'GET_POP_SUCCESS',
                            payload: { questionId, pop: popResponse },
                        });
                    })
                    .catch((reason) => {
                        dispatch({
                            type: 'GET_POP_FAILED',
                            payload: {
                                questionId,
                                error: reason || 'Get pop failed',
                            },
                        });
                    });
            })();
        },
};

// ----------------
// REDUCER - For a given state and action, returns the new state.
// To support time travel, this must not mutate the old state.

const defaultState: ContainerState = { pop: {} };

export const reducer: Reducer<ContainerState> = (state: ContainerState, anyAction: AnyAction) => {
    // Currently all actions have payload so compiler doesn't like matching AnyAction with KnownAction
    const action = anyAction as KnownAction;
    switch (action.type) {
        case 'GET_POP_REQUESTED':
            return {
                pop: {
                    loading: true,
                    questionId: action.payload.questionId,
                },
            };
        case 'GET_POP_SUCCESS':
            return {
                pop: {
                    questionId: action.payload.questionId,
                    model: action.payload.pop,
                },
            };
        case 'GET_POP_FAILED':
            return {
                pop: {
                    questionId: action.payload.questionId,
                    error: action.payload.error,
                },
            };
        case 'NEW_COMMENT_FORM_RECEIVED': {
            const popModel = state.pop!.model!;
            // Slice for immutability
            const commentsNext = popModel.comments.slice();
            if (action.payload.comment.parentCommentId) {
                appendNewComment(commentsNext, action.payload.comment);
            } else {
                commentsNext.push(action.payload.comment);
            }
            const popNext = { ...popModel, comments: commentsNext };
            return {
                pop: {
                    questionId: state.pop!.questionId,
                    model: popNext,
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
