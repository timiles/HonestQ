import { Reducer } from 'redux';
import { AppThunkAction } from '.';
import { NotificationsCountModel } from '../server-models';
import { getJson } from '../utils/http-utils';
import { LogOutSuccessAction } from './Login';
import { MarkNotificationAsSeenSuccessAction } from './Notifications';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface NotificationsCountState {
    notificationsCount?: NotificationsCountModel;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

interface GetNotificationsCountRequestAction {
    type: 'GET_NOTIFICATIONS_COUNT_REQUEST';
}
interface GetNotificationsCountSuccessAction {
    type: 'GET_NOTIFICATIONS_COUNT_SUCCESS';
    payload: NotificationsCountModel;
}
interface GetNotificationsCountFailureAction {
    type: 'GET_NOTIFICATIONS_COUNT_FAILURE';
    payload: { error: string; };
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction =
    | GetNotificationsCountRequestAction
    | GetNotificationsCountSuccessAction
    | GetNotificationsCountFailureAction
    | MarkNotificationAsSeenSuccessAction
    | LogOutSuccessAction
    ;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    getNotificationsCount: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        return (async () => {
            dispatch({ type: 'GET_NOTIFICATIONS_COUNT_REQUEST' });

            getJson<NotificationsCountModel>('/api/notifications/count', getState().login.loggedInUser)
                .then((response) => {
                    dispatch({ type: 'GET_NOTIFICATIONS_COUNT_SUCCESS', payload: response });
                })
                .catch((reason) => {
                    dispatch({
                        type: 'GET_NOTIFICATIONS_COUNT_FAILURE',
                        payload: {
                            error: reason || 'Get notifications count failed',
                        },
                    });
                });
        })();
    },
};

// ----------------
// REDUCER - For a given state and action, returns the new state.
// To support time travel, this must not mutate the old state.

const defaultState: NotificationsCountState = {};

export const reducer: Reducer<NotificationsCountState> = (state: NotificationsCountState, action: KnownAction) => {
    switch (action.type) {
        case 'GET_NOTIFICATIONS_COUNT_REQUEST':
        case 'GET_NOTIFICATIONS_COUNT_FAILURE':
            return state;
        case 'GET_NOTIFICATIONS_COUNT_SUCCESS':
            return {
                notificationsCount: action.payload,
            };
        case 'MARK_NOTIFICATION_AS_SEEN_SUCCESS':
            {
                if (!state.notificationsCount) {
                    return state;
                }
                // Just in case of getting out of sync, let's never go below zero.
                const newCount = Math.max(state.notificationsCount.count - 1, 0);
                return {
                    notificationsCount: { count: newCount },
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
