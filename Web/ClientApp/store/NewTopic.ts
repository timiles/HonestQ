import { Reducer } from 'redux';
import { AppThunkAction } from '.';
import { TopicFormModel } from '../server-models';
import { postJson } from '../utils/http-utils';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface NewTopicState {
    previouslySubmittedTopicFormModel?: TopicFormModel;
    submitting?: boolean;
    submitted?: boolean;
    error?: string | null;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

interface TopicFormSubmittedAction { type: 'TOPIC_FORM_SUBMITTED'; }
interface TopicFormReceivedAction { type: 'TOPIC_FORM_RECEIVED'; payload: { topic: TopicFormModel; }; }
interface TopicFormFailedAction { type: 'TOPIC_FORM_FAILED'; payload: { error: string | null; }; }

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction = TopicFormSubmittedAction
    | TopicFormReceivedAction
    | TopicFormFailedAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    submit: (topicForm: TopicFormModel): AppThunkAction<KnownAction> => (dispatch, getState) => {
        return (async () => {
            dispatch({ type: 'TOPIC_FORM_SUBMITTED' });

            if (!topicForm.name) {
                // Don't set an error message, the validation properties will display instead
                dispatch({ type: 'TOPIC_FORM_FAILED', payload: { error: null } });
                return;
            }

            postJson('/api/topics', topicForm, getState().login.loggedInUser!)
                .then(() => {
                    dispatch({ type: 'TOPIC_FORM_RECEIVED', payload: { topic: topicForm } });
                })
                .catch((reason: string) => {
                    dispatch({ type: 'TOPIC_FORM_FAILED', payload: { error: reason } });
                });
        })();
    },
};

// ----------------
// REDUCER - For a given state and action, returns the new state.
// To support time travel, this must not mutate the old state.

const defaultState: NewTopicState = {};

export const reducer: Reducer<NewTopicState> = (state: NewTopicState, action: KnownAction) => {
    switch (action.type) {
        case 'TOPIC_FORM_SUBMITTED':
            return { submitting: true, submitted: true };
        case 'TOPIC_FORM_RECEIVED':
            return { submitting: false, submitted: false, previouslySubmittedTopicFormModel: action.payload.topic };
        case 'TOPIC_FORM_FAILED':
            return { submitting: false, submitted: true, error: action.payload.error };

        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    // For unrecognized actions (or in cases where actions have no effect), must return the existing state
    //  (or default initial state if none was supplied)
    return state || defaultState;
};
