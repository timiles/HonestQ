import { Reducer } from 'redux';
import { AppThunkAction } from '.';
import { LoadingProps } from '../components/shared/Loading';
import { QuestionsListModel, TopicsListModel } from '../server-models';
import { getJson } from '../utils';
import { NewQuestionFormReceivedAction } from './NewQuestion';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface HomeState {
    loadingQuestionsList: LoadingProps<QuestionsListModel>;
    loadingTopicsList: LoadingProps<TopicsListModel>;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

interface GetQuestionsListRequestedAction { type: 'GET_QUESTIONS_LIST_REQUESTED'; }
interface GetQuestionsListSuccessAction { type: 'GET_QUESTIONS_LIST_SUCCESS'; payload: QuestionsListModel; }
interface GetQuestionsListFailedAction { type: 'GET_QUESTIONS_LIST_FAILED'; payload: { error: string; }; }
interface GetTopicsListRequestedAction { type: 'GET_TOPICS_LIST_REQUESTED'; }
interface GetTopicsListSuccessAction { type: 'GET_TOPICS_LIST_SUCCESS'; payload: TopicsListModel; }
interface GetTopicsListFailedAction { type: 'GET_TOPICS_LIST_FAILED'; payload: { error: string; }; }

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction =
    GetQuestionsListRequestedAction
    | GetQuestionsListSuccessAction
    | GetQuestionsListFailedAction
    | NewQuestionFormReceivedAction
    | GetTopicsListRequestedAction
    | GetTopicsListSuccessAction
    | GetTopicsListFailedAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    getQuestionsList: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        return (async () => {
            dispatch({ type: 'GET_QUESTIONS_LIST_REQUESTED' });

            getJson<QuestionsListModel>('/api/questions', getState().login.loggedInUser)
                .then((questionsListResponse: QuestionsListModel) => {
                    dispatch({ type: 'GET_QUESTIONS_LIST_SUCCESS', payload: questionsListResponse });
                })
                .catch((reason) => {
                    dispatch({
                        type: 'GET_QUESTIONS_LIST_FAILED',
                        payload: {
                            error: reason || 'Get Questions list failed',
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

const defaultState: HomeState = { loadingQuestionsList: {}, loadingTopicsList: {} };

export const reducer: Reducer<HomeState> = (state: HomeState, action: KnownAction) => {
    switch (action.type) {
        case 'GET_QUESTIONS_LIST_REQUESTED':
            return { loadingQuestionsList: { loading: true }, loadingTopicsList: state.loadingTopicsList };
        case 'GET_QUESTIONS_LIST_SUCCESS':
            return {
                loadingQuestionsList: { loadedModel: action.payload },
                loadingTopicsList: state.loadingTopicsList,
            };
        case 'GET_QUESTIONS_LIST_FAILED':
            return {
                loadingQuestionsList: { error: action.payload.error },
                loadingTopicsList: state.loadingTopicsList,
            };
        case 'NEW_QUESTION_FORM_RECEIVED': {
            if (!state.loadingQuestionsList.loadedModel) {
                // We could be posting a question from the topics page
                return state;
            }
            const questionsListModel = state.loadingQuestionsList.loadedModel;
            // Slice for immutability
            const questionsNext = questionsListModel.questions.slice();
            questionsNext.push(action.payload.questionListItem);
            const questionsListNext = { ...questionsListModel, questions: questionsNext };
            return {
                loadingQuestionsList: { loadedModel: questionsListNext },
                loadingTopicsList: state.loadingTopicsList,
            };
        }
        case 'GET_TOPICS_LIST_REQUESTED':
            return {
                loadingQuestionsList: state.loadingQuestionsList,
                loadingTopicsList: { loading: true },
            };
        case 'GET_TOPICS_LIST_SUCCESS':
            return {
                loadingQuestionsList: state.loadingQuestionsList,
                loadingTopicsList: { loadedModel: action.payload },
            };
        case 'GET_TOPICS_LIST_FAILED':
            return {
                loadingQuestionsList: state.loadingQuestionsList,
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
