import { AnyAction, Reducer } from 'redux';
import { AppThunkAction } from '.';
import { TagProps } from '../components/Tag/Tag';
import { TagModel, WatchResponseModel } from '../server-models';
import { fetchJson, getJson } from '../utils/http-utils';
import { NewQuestionFormReceivedAction } from './NewQuestion';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface ContainerState {
    tag: TagProps;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

interface GetTagRequestAction {
    type: 'GET_TAG_REQUEST';
    payload: { tagSlug: string; };
}
interface GetTagSuccessAction {
    type: 'GET_TAG_SUCCESS';
    payload: { tag: TagModel; tagSlug: string; };
}
interface GetTagFailureAction {
    type: 'GET_TAG_FAILURE';
    payload: { tagSlug: string; error: string; };
}
interface UpdateWatchTagSuccessAction {
    type: 'UPDATE_WATCH_TAG_SUCCESS';
    payload: {
        tagSlug: string;
        response: WatchResponseModel;
    };
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction =
    | GetTagRequestAction
    | GetTagSuccessAction
    | GetTagFailureAction
    | NewQuestionFormReceivedAction
    | UpdateWatchTagSuccessAction
    ;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    getTag: (tagSlug: string): AppThunkAction<KnownAction> => (dispatch, getState) => {
        return (async () => {
            dispatch({ type: 'GET_TAG_REQUEST', payload: { tagSlug } });

            getJson<TagModel>(`/api/tags/${tagSlug}`, getState().login.loggedInUser)
                .then((tagResponse: TagModel) => {
                    dispatch({
                        type: 'GET_TAG_SUCCESS',
                        payload: { tag: tagResponse, tagSlug },
                    });
                })
                .catch((reason) => {
                    dispatch({
                        type: 'GET_TAG_FAILURE',
                        payload: {
                            tagSlug,
                            error: reason || 'Get tag failed',
                        },
                    });
                });
        })();
    },
    updateWatch: (on: boolean, tagSlug: string):
        AppThunkAction<KnownAction> =>
        (dispatch, getState) => {
            return (async () => {

                const url = `/api/tags/${tagSlug}/watch`;

                const method = on ? 'POST' : 'DELETE';
                fetchJson<WatchResponseModel>(method, url, null, getState().login.loggedInUser)
                    .then((watchResponse) => {
                        dispatch({
                            type: 'UPDATE_WATCH_TAG_SUCCESS',
                            payload: { tagSlug, response: watchResponse },
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

const defaultState: ContainerState = { tag: {} };

export const reducer: Reducer<ContainerState> = (state: ContainerState, anyAction: AnyAction) => {
    // Currently all actions have payload so compiler doesn't like matching AnyAction with KnownAction
    const action = anyAction as KnownAction;
    switch (action.type) {
        case 'GET_TAG_REQUEST':
            return {
                ...state,
                tag: {
                    loading: true,
                    slug: action.payload.tagSlug,
                },
            };
        case 'GET_TAG_SUCCESS':
            return {
                // NOTE: Question is possibly already set if GET_QUESTION_REQUEST returned before GET_TAG_REQUEST
                ...state,
                tag: {
                    slug: action.payload.tagSlug,
                    model: action.payload.tag,
                },
            };
        case 'GET_TAG_FAILURE':
            return {
                ...state,
                tag: {
                    slug: action.payload.tagSlug,
                    error: action.payload.error,
                },
            };
        case 'NEW_QUESTION_FORM_RECEIVED': {
            if (!state.tag.model) {
                // We could be posting a Question from the home page
                return state;
            }
            const tagModel = state.tag.model;
            // Slice for immutability
            const questionsNext = tagModel.questions.slice();
            questionsNext.push(action.payload.questionListItem);
            const tagNext = { ...tagModel, questions: questionsNext };
            return {
                ...state,
                tag: {
                    slug: state.tag.slug,
                    model: tagNext,
                },
            };
        }
        case 'UPDATE_WATCH_TAG_SUCCESS': {
            const { response } = action.payload;
            const tagNext = {
                ...state.tag.model!,
                watching: response.watching,
            };
            return {
                ...state,
                tag: {
                    slug: state.tag.slug,
                    model: tagNext,
                },
            };
        }

        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    // For unrecognized actions (or in cases where actions have no effect), must return the existing state
    //  (or default initial state if none was supplied)
    return state || defaultState;
};
