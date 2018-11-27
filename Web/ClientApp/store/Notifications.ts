import { Reducer } from 'redux';
import { AppThunkAction } from '.';
import { LoadingProps } from '../components/shared/Loading';
import { NotificationsListModel } from '../server-models';
import { getJson } from '../utils/http-utils';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface ListState {
    loadingNotificationList: LoadingProps<NotificationsListModel>;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

interface GetNotificationListRequestedAction { type: 'GET_NOTIFICATION_LIST_REQUESTED'; }
interface GetNotificationListSuccessAction { type: 'GET_NOTIFICATION_LIST_SUCCESS'; payload: NotificationsListModel; }
interface GetNotificationListFailedAction { type: 'GET_NOTIFICATION_LIST_FAILED'; payload: { error: string; }; }

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction =
    | GetNotificationListRequestedAction
    | GetNotificationListSuccessAction
    | GetNotificationListFailedAction
    ;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    loadMoreNotificationItems: (beforeId?: number): AppThunkAction<KnownAction> => (dispatch, getState) => {
        return (async () => {
            if (beforeId && beforeId <= 0) {
                return;
            }
            dispatch({ type: 'GET_NOTIFICATION_LIST_REQUESTED' });

            const url = '/api/notifications' + (beforeId ? `?beforeId=${beforeId}` : '');
            getJson<NotificationsListModel>(url, getState().login.loggedInUser)
                .then((notificationListResponse: NotificationsListModel) => {
                    dispatch({ type: 'GET_NOTIFICATION_LIST_SUCCESS', payload: notificationListResponse });
                })
                .catch((reason) => {
                    dispatch({
                        type: 'GET_NOTIFICATION_LIST_FAILED',
                        payload: {
                            error: reason || 'Get Notification list failed',
                        },
                    });
                });
        })();
    },
};

// ----------------
// REDUCER - For a given state and action, returns the new state.
// To support time travel, this must not mutate the old state.

const defaultState: ListState = { loadingNotificationList: {} };

export const reducer: Reducer<ListState> = (state: ListState, action: KnownAction) => {
    switch (action.type) {
        case 'GET_NOTIFICATION_LIST_REQUESTED':
            return {
                loadingNotificationList: { ...state.loadingNotificationList, loading: true },
            };
        case 'GET_NOTIFICATION_LIST_SUCCESS':
            if (state.loadingNotificationList.loadedModel) {
                // Slice for immutability
                const notificationsNext = state.loadingNotificationList.loadedModel.notifications.slice();
                for (const notification of action.payload.notifications) {
                    notificationsNext.push(notification);
                }
                return {
                    loadingNotificationList: {
                        loadedModel: { ...action.payload, notifications: notificationsNext },
                    },
                };
            }
            return {
                loadingNotificationList: { loadedModel: action.payload },
            };
        case 'GET_NOTIFICATION_LIST_FAILED':
            return {
                loadingNotificationList: { ...state.loadingNotificationList, error: action.payload.error },
            };

        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    // For unrecognized actions (or in cases where actions have no effect), must return the existing state
    //  (or default initial state if none was supplied)
    return state || defaultState;
};
