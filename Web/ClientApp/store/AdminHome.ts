import { Reducer } from 'redux';
import { AppThunkAction } from '.';
import { LoadingProps } from '../components/shared/Loading';
import { QuestionsListModel, TagsListModel } from '../server-models';
import { getJson } from '../utils/http-utils';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface AdminHomeState {
    unapprovedTagsList: LoadingProps<TagsListModel>;
    unapprovedQuestionsList: LoadingProps<QuestionsListModel>;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

interface GetUnapprovedTagsListRequestedAction {
    type: 'GET_UNAPPROVED_TOPICS_LIST_REQUESTED';
}
interface GetUnapprovedTagsListSuccessAction {
    type: 'GET_UNAPPROVED_TOPICS_LIST_SUCCESS';
    payload: TagsListModel;
}
interface GetUnapprovedTagsListFailedAction {
    type: 'GET_UNAPPROVED_TOPICS_LIST_FAILED';
    payload: { error: string; };
}
interface GetUnapprovedQuestionsListRequestedAction {
    type: 'GET_UNAPPROVED_QUESTIONS_LIST_REQUESTED';
}
interface GetUnapprovedQuestionsListSuccessAction {
    type: 'GET_UNAPPROVED_QUESTIONS_LIST_SUCCESS';
    payload: QuestionsListModel;
}
interface GetUnapprovedQuestionsListFailedAction {
    type: 'GET_UNAPPROVED_QUESTIONS_LIST_FAILED';
    payload: { error: string; };
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction =
    | GetUnapprovedTagsListRequestedAction
    | GetUnapprovedTagsListSuccessAction
    | GetUnapprovedTagsListFailedAction
    | GetUnapprovedQuestionsListRequestedAction
    | GetUnapprovedQuestionsListSuccessAction
    | GetUnapprovedQuestionsListFailedAction
    ;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    getUnapprovedTagsList: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        return (async () => {
            dispatch({ type: 'GET_UNAPPROVED_TOPICS_LIST_REQUESTED' });

            getJson<TagsListModel>('/api/tags?isApproved=false', getState().login.loggedInUser)
                .then((tagsListResponse: TagsListModel) => {
                    dispatch({ type: 'GET_UNAPPROVED_TOPICS_LIST_SUCCESS', payload: tagsListResponse });
                })
                .catch((reason) => {
                    dispatch({
                        type: 'GET_UNAPPROVED_TOPICS_LIST_FAILED',
                        payload: {
                            error: reason || 'Get tags list failed',
                        },
                    });
                });
        })();
    },
    getUnapprovedQuestionsList: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        return (async () => {
            dispatch({ type: 'GET_UNAPPROVED_QUESTIONS_LIST_REQUESTED' });

            getJson<QuestionsListModel>('/api/questions?status=AwaitingApproval', getState().login.loggedInUser)
                .then((response) => {
                    dispatch({ type: 'GET_UNAPPROVED_QUESTIONS_LIST_SUCCESS', payload: response });
                })
                .catch((reason) => {
                    dispatch({
                        type: 'GET_UNAPPROVED_QUESTIONS_LIST_FAILED',
                        payload: {
                            error: reason || 'Get questions list failed',
                        },
                    });
                });
        })();
    },
};

// ----------------
// REDUCER - For a given state and action, returns the new state.
// To support time travel, this must not mutate the old state.

const defaultState: AdminHomeState = { unapprovedTagsList: {}, unapprovedQuestionsList: {} };

export const reducer: Reducer<AdminHomeState> = (state: AdminHomeState, action: KnownAction) => {
    switch (action.type) {
        case 'GET_UNAPPROVED_TOPICS_LIST_REQUESTED':
            return {
                unapprovedTagsList: { loading: true },
                unapprovedQuestionsList: state.unapprovedQuestionsList,
            };
        case 'GET_UNAPPROVED_TOPICS_LIST_SUCCESS':
            return {
                unapprovedTagsList: { loadedModel: action.payload },
                unapprovedQuestionsList: state.unapprovedQuestionsList,
            };
        case 'GET_UNAPPROVED_TOPICS_LIST_FAILED':
            return {
                unapprovedTagsList: { error: action.payload.error },
                unapprovedQuestionsList: state.unapprovedQuestionsList,
            };
        case 'GET_UNAPPROVED_QUESTIONS_LIST_REQUESTED':
            return {
                unapprovedTagsList: state.unapprovedTagsList,
                unapprovedQuestionsList: { loading: true },
            };
        case 'GET_UNAPPROVED_QUESTIONS_LIST_SUCCESS':
            return {
                unapprovedTagsList: state.unapprovedTagsList,
                unapprovedQuestionsList: { loadedModel: action.payload },
            };
        case 'GET_UNAPPROVED_QUESTIONS_LIST_FAILED':
            return {
                unapprovedTagsList: state.unapprovedTagsList,
                unapprovedQuestionsList: { error: action.payload.error },
            };

        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    // For unrecognized actions (or in cases where actions have no effect), must return the existing state
    //  (or default initial state if none was supplied)
    return state || defaultState;
};
