import { Reducer } from 'redux';
import { AppThunkAction } from '.';
import { LoadingProps } from '../components/shared/Loading';
import { ActivityListModel, TopicsListModel } from '../server-models';
import { getJson } from '../utils';
import { ActivityListItemModel } from './../server-models';
import { NewQuestionFormReceivedAction } from './NewQuestion';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface HomeState {
    loadingActivityList: LoadingProps<ActivityListModel>;
    loadingTopicsList: LoadingProps<TopicsListModel>;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

interface GetActivityListRequestedAction { type: 'GET_ACTIVITY_LIST_REQUESTED'; }
interface GetActivityListSuccessAction { type: 'GET_ACTIVITY_LIST_SUCCESS'; payload: ActivityListModel; }
interface GetActivityListFailedAction { type: 'GET_ACTIVITY_LIST_FAILED'; payload: { error: string; }; }
interface GetTopicsListRequestedAction { type: 'GET_TOPICS_LIST_REQUESTED'; }
interface GetTopicsListSuccessAction { type: 'GET_TOPICS_LIST_SUCCESS'; payload: TopicsListModel; }
interface GetTopicsListFailedAction { type: 'GET_TOPICS_LIST_FAILED'; payload: { error: string; }; }

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction =
    GetActivityListRequestedAction
    | GetActivityListSuccessAction
    | GetActivityListFailedAction
    | NewQuestionFormReceivedAction
    | GetTopicsListRequestedAction
    | GetTopicsListSuccessAction
    | GetTopicsListFailedAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    getActivityList: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        return (async () => {
            dispatch({ type: 'GET_ACTIVITY_LIST_REQUESTED' });

            getJson<ActivityListModel>('/api/activity', getState().login.loggedInUser)
                .then((activityListResponse: ActivityListModel) => {
                    dispatch({ type: 'GET_ACTIVITY_LIST_SUCCESS', payload: activityListResponse });
                })
                .catch((reason) => {
                    dispatch({
                        type: 'GET_ACTIVITY_LIST_FAILED',
                        payload: {
                            error: reason || 'Get Activity list failed',
                        },
                    });
                });
        })();
    },
    loadMoreActivityItems: (beforeTimestamp: number): AppThunkAction<KnownAction> => (dispatch, getState) => {
        return (async () => {
            dispatch({ type: 'GET_ACTIVITY_LIST_REQUESTED' });

            getJson<ActivityListModel>(`/api/activity?beforeTimestamp=${beforeTimestamp}`,
                getState().login.loggedInUser)
                .then((activityListResponse: ActivityListModel) => {
                    dispatch({ type: 'GET_ACTIVITY_LIST_SUCCESS', payload: activityListResponse });
                })
                .catch((reason) => {
                    dispatch({
                        type: 'GET_ACTIVITY_LIST_FAILED',
                        payload: {
                            error: reason || 'Get Activity list failed',
                        },
                    });
                });
        })();
    },
    getTopicsList: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        return (async () => {
            dispatch({ type: 'GET_TOPICS_LIST_REQUESTED' });

            getJson<TopicsListModel>('/api/topics', getState().login.loggedInUser)
                .then((topicsListResponse: TopicsListModel) => {
                    dispatch({ type: 'GET_TOPICS_LIST_SUCCESS', payload: topicsListResponse });
                })
                .catch((reason) => {
                    dispatch({
                        type: 'GET_TOPICS_LIST_FAILED',
                        payload: {
                            error: reason || 'Get topics list failed',
                        },
                    });
                });
        })();
    },
};

// ----------------
// REDUCER - For a given state and action, returns the new state.
// To support time travel, this must not mutate the old state.

const defaultState: HomeState = { loadingActivityList: {}, loadingTopicsList: {} };

export const reducer: Reducer<HomeState> = (state: HomeState, action: KnownAction) => {
    switch (action.type) {
        case 'GET_ACTIVITY_LIST_REQUESTED':
            return {
                loadingActivityList: { ...state.loadingActivityList, loading: true },
                loadingTopicsList: state.loadingTopicsList,
            };
        case 'GET_ACTIVITY_LIST_SUCCESS':
            if (state.loadingActivityList.loadedModel) {
                // Slice for immutability
                const activityItemsNext = state.loadingActivityList.loadedModel.activityItems.slice();
                for (const activityItem of action.payload.activityItems) {
                    activityItemsNext.push(activityItem);
                }
                return {
                    loadingActivityList: {
                        loadedModel: { ...action.payload, activityItems: activityItemsNext },
                    },
                    loadingTopicsList: state.loadingTopicsList,
                };
            }
            return {
                loadingActivityList: { loadedModel: action.payload },
                loadingTopicsList: state.loadingTopicsList,
            };
        case 'GET_ACTIVITY_LIST_FAILED':
            return {
                loadingActivityList: { ...state.loadingActivityList, error: action.payload.error },
                loadingTopicsList: state.loadingTopicsList,
            };
        case 'NEW_QUESTION_FORM_RECEIVED': {
            if (!state.loadingActivityList.loadedModel) {
                // We could be posting a question from the topics page
                return state;
            }
            const activityListModel = state.loadingActivityList.loadedModel;
            // Slice for immutability
            const activityItemsNext = activityListModel.activityItems.slice();
            const newActivityItem: ActivityListItemModel = {
                type: 'Question',
                questionId: action.payload.questionListItem.id,
                questionSlug: action.payload.questionListItem.slug,
                questionText: action.payload.questionListItem.text,
                childCount: action.payload.questionListItem.answersCount,
            };
            activityItemsNext.unshift(newActivityItem);
            const activityListNext = { ...activityListModel, activityItems: activityItemsNext };
            return {
                loadingActivityList: { loadedModel: activityListNext },
                loadingTopicsList: state.loadingTopicsList,
            };
        }
        case 'GET_TOPICS_LIST_REQUESTED':
            return {
                loadingActivityList: state.loadingActivityList,
                loadingTopicsList: { loading: true },
            };
        case 'GET_TOPICS_LIST_SUCCESS':
            return {
                loadingActivityList: state.loadingActivityList,
                loadingTopicsList: { loadedModel: action.payload },
            };
        case 'GET_TOPICS_LIST_FAILED':
            return {
                loadingActivityList: state.loadingActivityList,
                loadingTopicsList: { error: action.payload.error },
            };

        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    // For unrecognized actions (or in cases where actions have no effect), must return the existing state
    //  (or default initial state if none was supplied)
    return state || defaultState;
};
