import { addTask, fetch } from 'domain-task';
import { Reducer } from 'redux';
import { GetTopicModel } from '../server-models';
import * as Utils from '../utils';
import { AppThunkAction } from './';

// tslint:disable:interface-name

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface TopicState {
    loading: boolean;
    urlFragment?: string;
    topic?: GetTopicModel;
    error?: string;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

interface GetTopicRequestedAction { type: 'GET_TOPIC_REQUESTED'; }
interface GetTopicSuccessAction { type: 'GET_TOPIC_SUCCESS'; payload: { topic: GetTopicModel; urlFragment: string; }; }
interface GetTopicFailedAction { type: 'GET_TOPIC_FAILED'; payload: { error: string; }; }

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction = GetTopicRequestedAction
    | GetTopicSuccessAction
    | GetTopicFailedAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    getTopic: (topicUrlFragment: string): AppThunkAction<KnownAction> => (dispatch, getState) => {
        return (async () => {
            dispatch({ type: 'GET_TOPIC_REQUESTED' });

            const requestOptions: RequestInit = {
                headers: { 'Content-Type': 'application/json' },
                method: 'GET',
            };

            const fetchTask = fetch(`/api/topics/${topicUrlFragment}`, requestOptions)
                .then((response) => Utils.handleResponse<GetTopicModel>(response), Utils.handleError)
                .then((topicResponse) => {
                    dispatch({
                        type: 'GET_TOPIC_SUCCESS',
                        payload: { topic: topicResponse, urlFragment: topicUrlFragment },
                    });
                })
                .catch((reason) => {
                    dispatch({ type: 'GET_TOPIC_FAILED', payload: { error: reason || 'Get topic failed' } });
                });

            addTask(fetchTask);
        })();
    },
};

// ----------------
// REDUCER - For a given state and action, returns the new state.
// To support time travel, this must not mutate the old state.

const defaultState: TopicState = { loading: false };

export const reducer: Reducer<TopicState> = (state: TopicState, action: KnownAction) => {
    switch (action.type) {
        case 'GET_TOPIC_REQUESTED':
            return { loading: true };
        case 'GET_TOPIC_SUCCESS':
            return { loading: false, topic: action.payload.topic, urlFragment: action.payload.urlFragment };
        case 'GET_TOPIC_FAILED':
            return { loading: false, error: action.payload.error };

        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    // For unrecognized actions (or in cases where actions have no effect), must return the existing state
    //  (or default initial state if none was supplied)
    return state || defaultState;
};
