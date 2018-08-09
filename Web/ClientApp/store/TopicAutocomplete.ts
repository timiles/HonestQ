import { AnyAction, Reducer } from 'redux';
import { AppThunkAction } from '.';
import { getJson } from '../utils';
import { TopicAutocompleteResultsModel, TopicValueModel } from './../server-models';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface TopicAutocompleteState {
    loading: boolean;
    query: string;
    suggestions: TopicValueModel[] | null;
    error: string | null;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

interface AutocompleteTopicsClearAction {
    type: 'AUTOCOMPLETE_TOPICS_CLEAR';
}
interface AutocompleteTopicsRequestedAction {
    type: 'AUTOCOMPLETE_TOPICS_REQUESTED';
    payload: { query: string; };
}
interface AutocompleteTopicsSuccessAction {
    type: 'AUTOCOMPLETE_TOPICS_SUCCESS';
    payload: { topics: TopicValueModel[]; query: string; };
}
interface AutocompleteTopicsFailedAction {
    type: 'AUTOCOMPLETE_TOPICS_FAILED';
    payload: { query: string; error: string; };
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction = AutocompleteTopicsClearAction
    | AutocompleteTopicsRequestedAction
    | AutocompleteTopicsSuccessAction
    | AutocompleteTopicsFailedAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    autocompleteTopics: (query: string): AppThunkAction<KnownAction> => (dispatch, getState) => {
        return (async () => {
            if (!query) {
                dispatch({ type: 'AUTOCOMPLETE_TOPICS_CLEAR' });
                return;
            }
            dispatch({ type: 'AUTOCOMPLETE_TOPICS_REQUESTED', payload: { query } });

            getJson<TopicAutocompleteResultsModel>(`/api/topics/autocomplete?q=${query}`, getState().login.loggedInUser)
                .then((response: TopicAutocompleteResultsModel) => {
                    dispatch({
                        type: 'AUTOCOMPLETE_TOPICS_SUCCESS',
                        payload: { topics: response.values, query },
                    });
                })
                .catch((reason) => {
                    dispatch({
                        type: 'AUTOCOMPLETE_TOPICS_FAILED',
                        payload: {
                            query,
                            error: reason || 'Autocomplete topics failed',
                        },
                    });
                });
        })();
    },
};

// ----------------
// REDUCER - For a given state and action, returns the new state.
// To support time travel, this must not mutate the old state.

const defaultState: TopicAutocompleteState = { loading: false, query: '', suggestions: null, error: null };

export const reducer: Reducer<TopicAutocompleteState> = (state: TopicAutocompleteState, anyAction: AnyAction) => {
    // Currently all actions have payload so compiler doesn't like matching AnyAction with KnownAction
    const action = anyAction as KnownAction;
    switch (action.type) {
        case 'AUTOCOMPLETE_TOPICS_CLEAR':
            return {
                loading: false,
                query: '',
                suggestions: null,
                error: null,
            };
        case 'AUTOCOMPLETE_TOPICS_REQUESTED':
            return {
                loading: true,
                query: action.payload.query,
                suggestions: state.suggestions,
                error: null,
            };
        case 'AUTOCOMPLETE_TOPICS_SUCCESS':
            return {
                loading: false,
                query: action.payload.query,
                suggestions: action.payload.topics,
                error: null,
            };
        case 'AUTOCOMPLETE_TOPICS_FAILED':
            return {
                loading: false,
                query: action.payload.query,
                suggestions: [],
                error: action.payload.error,
            };

        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    // For unrecognized actions (or in cases where actions have no effect), must return the existing state
    //  (or default initial state if none was supplied)
    return state || defaultState;
};
