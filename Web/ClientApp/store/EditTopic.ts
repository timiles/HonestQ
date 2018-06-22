import { Reducer } from 'redux';
import { FormProps } from '../components/shared/FormProps';
import { LoadingProps } from '../components/shared/Loading';
import { getJson, putJson } from '../utils';
import { AppThunkAction } from './';
import { EditTopicFormModel, TopicModel } from './../server-models';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface EditTopicState {
    topicModel: LoadingProps<TopicModel>;
    editTopicForm: FormProps<EditTopicFormModel>;
    previouslySubmittedTopicFormModel?: EditTopicFormModel;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

interface GetTopicRequestedAction { type: 'GET_TOPIC_REQUESTED'; payload: { topicSlug: string; }; }
interface GetTopicSuccessAction {
    type: 'GET_TOPIC_SUCCESS';
    payload: { topic: TopicModel; topicSlug: string; };
}
interface GetTopicFailedAction { type: 'GET_TOPIC_FAILED'; payload: { topicSlug: string; error: string; }; }
interface TopicFormSubmittedAction { type: 'TOPIC_FORM_SUBMITTED'; }
interface TopicFormReceivedAction { type: 'TOPIC_FORM_RECEIVED'; payload: { topic: EditTopicFormModel; }; }
interface TopicFormFailedAction { type: 'TOPIC_FORM_FAILED'; payload: { error: string | null; }; }

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction = GetTopicRequestedAction
    | GetTopicSuccessAction
    | GetTopicFailedAction
    | TopicFormSubmittedAction
    | TopicFormReceivedAction
    | TopicFormFailedAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    getTopic: (topicSlug: string): AppThunkAction<KnownAction> => (dispatch, getState) => {
        return (async () => {
            dispatch({ type: 'GET_TOPIC_REQUESTED', payload: { topicSlug } });

            getJson<TopicModel>(`/api/topics/${topicSlug}`, getState().login.loggedInUser)
                .then((topicResponse: TopicModel) => {
                    dispatch({
                        type: 'GET_TOPIC_SUCCESS',
                        payload: { topic: topicResponse, topicSlug },
                    });
                })
                .catch((reason) => {
                    dispatch({
                        type: 'GET_TOPIC_FAILED', payload: {
                            topicSlug,
                            error: reason || 'Get topic failed',
                        },
                    });
                });
        })();
    },
    submit: (slug: string, topicForm: EditTopicFormModel): AppThunkAction<KnownAction> => (dispatch, getState) => {
        return (async () => {
            dispatch({ type: 'TOPIC_FORM_SUBMITTED' });

            if (!topicForm.name || !topicForm.slug) {
                // Don't set an error message, the validation properties will display instead
                dispatch({ type: 'TOPIC_FORM_FAILED', payload: { error: null } });
                return;
            }

            putJson(`/api/topics/${slug}`, topicForm, getState().login.loggedInUser!)
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

const defaultState: EditTopicState = { topicModel: {}, editTopicForm: {} };

export const reducer: Reducer<EditTopicState> = (state: EditTopicState, action: KnownAction) => {
    switch (action.type) {
        case 'GET_TOPIC_REQUESTED':
            return {
                topicModel: {
                    id: action.payload.topicSlug,
                    loading: true,
                },
                editTopicForm: state.editTopicForm,
            };
        case 'GET_TOPIC_SUCCESS':
            return {
                topicModel: {
                    id: action.payload.topicSlug,
                    model: action.payload.topic,
                },
                editTopicForm: state.editTopicForm,
            };
        case 'GET_TOPIC_FAILED':
            return {
                topicModel: {
                    id: action.payload.topicSlug,
                    error: action.payload.error,
                },
                editTopicForm: state.editTopicForm,
            };
        case 'TOPIC_FORM_SUBMITTED':
            return {
                topicModel: state.topicModel,
                editTopicForm: {
                    submitting: true,
                    submitted: true,
                },
            };
        case 'TOPIC_FORM_RECEIVED':
            return {
                topicModel: state.topicModel,
                editTopicForm: {
                    submitting: false,
                    submitted: false,
                },
                previouslySubmittedTopicFormModel: action.payload.topic,
                // TODO: if Topic was Approved, update pending list on AdminHome
            };
        case 'TOPIC_FORM_FAILED':
            return {
                topicModel: state.topicModel,
                editTopicForm: {
                    submitting: false,
                    submitted: true,
                    error: action.payload.error,
                },
            };

        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    // For unrecognized actions (or in cases where actions have no effect), must return the existing state
    //  (or default initial state if none was supplied)
    return state || defaultState;
};
