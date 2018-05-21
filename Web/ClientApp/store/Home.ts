import { addTask, fetch } from 'domain-task';
import { Reducer } from 'redux';
import { GetTopicsListModel } from '../server-models/GetTopicsListModel';
import * as Utils from '../utils';
import { AppThunkAction } from './';

// tslint:disable:interface-name

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface HomeState {
    loading: boolean;
    topicsList?: GetTopicsListModel;
    error?: string;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

interface GetTopicsListRequestedAction { type: 'GET_TOPICS_LIST_REQUESTED'; }
interface GetTopicsListSuccessAction { type: 'GET_TOPICS_LIST_SUCCESS'; payload: GetTopicsListModel; }
interface GetTopicsListFailedAction { type: 'GET_TOPICS_LIST_FAILED'; payload: { error: string; }; }

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction = GetTopicsListRequestedAction
    | GetTopicsListSuccessAction
    | GetTopicsListFailedAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    getTopicsList: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        return (async () => {
            dispatch({ type: 'GET_TOPICS_LIST_REQUESTED' });

            const requestOptions: RequestInit = {
                headers: { 'Content-Type': 'application/json' },
                method: 'GET',
            };

            const fetchTask = fetch('/api/topics', requestOptions)
                .then((response) => Utils.handleResponse<GetTopicsListModel>(response), Utils.handleError)
                .then((topicsListResponse) => {
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

            addTask(fetchTask);
        })();
    },
};

// ----------------
// REDUCER - For a given state and action, returns the new state.
// To support time travel, this must not mutate the old state.

const defaultState: HomeState = { loading: false };

export const reducer: Reducer<HomeState> = (state: HomeState, action: KnownAction) => {
    switch (action.type) {
        case 'GET_TOPICS_LIST_REQUESTED':
            return { loading: true };
        case 'GET_TOPICS_LIST_SUCCESS':
            return { loading: false, topicsList: action.payload };
        case 'GET_TOPICS_LIST_FAILED':
            return { loading: false, error: action.payload.error };

        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    // For unrecognized actions (or in cases where actions have no effect), must return the existing state
    //  (or default initial state if none was supplied)
    return state || defaultState;
};
