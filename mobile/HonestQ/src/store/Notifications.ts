import { Reducer } from 'redux';
import { AppThunkAction } from '.';
import { NotificationsListModel } from '../server-models';
import { getJson, postJson } from '../utils/http-utils';
import { LogOutSuccessAction } from './LogOut';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface ListState {
  notificationsList?: NotificationsListModel;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

interface GetNotificationsListRequestAction { type: 'GET_NOTIFICATIONS_LIST_REQUEST'; }
interface GetNotificationsListSuccessAction { type: 'GET_NOTIFICATIONS_LIST_SUCCESS'; payload: NotificationsListModel; }
interface GetNotificationsListFailureAction { type: 'GET_NOTIFICATIONS_LIST_FAILURE'; payload: { error: string; }; }

export interface MarkNotificationAsSeenSuccessAction {
  type: 'MARK_NOTIFICATION_AS_SEEN_SUCCESS';
  payload: { id: number };
}
export interface MarkAllNotificationsAsSeenSuccessAction {
  type: 'MARK_ALL_NOTIFICATIONS_AS_SEEN_SUCCESS';
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction =
  | GetNotificationsListRequestAction
  | GetNotificationsListSuccessAction
  | GetNotificationsListFailureAction
  | MarkNotificationAsSeenSuccessAction
  | MarkAllNotificationsAsSeenSuccessAction
  | LogOutSuccessAction
  ;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
  loadMoreNotifications: (beforeId?: number): AppThunkAction<KnownAction> => (dispatch, getState) => {
    return (async () => {
      if (beforeId && beforeId <= 0) {
        return;
      }
      dispatch({ type: 'GET_NOTIFICATIONS_LIST_REQUEST' });

      const url = '/api/notifications' + (beforeId ? `?beforeId=${beforeId}` : '');
      getJson<NotificationsListModel>(url, getState().auth.loggedInUser)
        .then((notificationListResponse: NotificationsListModel) => {
          dispatch({ type: 'GET_NOTIFICATIONS_LIST_SUCCESS', payload: notificationListResponse });
        })
        .catch((reason) => {
          dispatch({
            type: 'GET_NOTIFICATIONS_LIST_FAILURE',
            payload: {
              error: reason || 'Get Notification list failed',
            },
          });
        });
    })();
  },
  markAsSeen: (notificationId: number): AppThunkAction<KnownAction> => (dispatch, getState) => {
    return (async () => {
      const url = `/api/notifications/${notificationId}/seen`;
      postJson(url, null, getState().auth.loggedInUser)
        .then(() => {
          dispatch({
            type: 'MARK_NOTIFICATION_AS_SEEN_SUCCESS',
            payload: { id: notificationId },
          });
        })
        .catch((reason) => {
          // TODO: Toast?
        });
    })();
  },
  markAllAsSeen: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
    return (async () => {
      const url = '/api/notifications/all/seen';
      postJson(url, null, getState().auth.loggedInUser)
        .then(() => {
          dispatch({
            type: 'MARK_ALL_NOTIFICATIONS_AS_SEEN_SUCCESS',
          });
        })
        .catch((reason) => {
          // TODO: Toast?
        });
    })();
  },
};

// ----------------
// REDUCER - For a given state and action, returns the new state.
// To support time travel, this must not mutate the old state.

const defaultState: ListState = {};

export const reducer: Reducer<ListState> = (state: ListState, action: KnownAction) => {
  switch (action.type) {
    case 'GET_NOTIFICATIONS_LIST_REQUEST':
    case 'GET_NOTIFICATIONS_LIST_FAILURE':
      return state;
    case 'GET_NOTIFICATIONS_LIST_SUCCESS': {
      if (state.notificationsList) {
        // Slice for immutability
        const notificationsNext = state.notificationsList.notifications.slice();
        for (const notification of action.payload.notifications) {
          notificationsNext.push(notification);
        }
        return {
          notificationsList: { ...action.payload, notifications: notificationsNext },
        };
      }
      return {
        notificationsList: action.payload,
      };
    }
    case 'MARK_NOTIFICATION_AS_SEEN_SUCCESS': {
      if (!state.notificationsList) {
        // Shouldn't be possible?
        return state;
      }
      // Slice for immutability
      const notificationsNext = state.notificationsList.notifications.slice();
      const notification = notificationsNext.filter((x) => (x.id === action.payload.id))[0];
      if (notification) {
        notification.seen = true;
      }
      return {
        notificationsList: { ...state.notificationsList, notifications: notificationsNext },
      };
    }
    case 'MARK_ALL_NOTIFICATIONS_AS_SEEN_SUCCESS': {
      if (!state.notificationsList) {
        // Shouldn't be possible?
        return state;
      }
      // Slice for immutability
      const notificationsNext = state.notificationsList.notifications.slice();
      notificationsNext.forEach((x) => { x.seen = true; });
      return {
        notificationsList: { ...state.notificationsList, notifications: notificationsNext },
      };
    }
    case 'LOGOUT_SUCCESS':
      return defaultState;

    default:
      // The following line guarantees that every action in the KnownAction union has been covered by a case above
      const exhaustiveCheck: never = action;
  }

  // For unrecognized actions (or in cases where actions have no effect), must return the existing state
  //  (or default initial state if none was supplied)
  return state || defaultState;
};
