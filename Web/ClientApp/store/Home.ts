﻿import { Reducer } from 'redux';
import { AppThunkAction } from '.';
import { LoadingProps } from '../components/shared/Loading';
import { QuestionsListModel, TopicsListModel } from '../server-models';
import { getJson } from '../utils';
import { QuestionListItemModel } from './../server-models';
import { NewQuestionFormReceivedAction } from './NewQuestion';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface HomeState {
    loadingQuestionList: LoadingProps<QuestionsListModel>;
    loadingTopicsList: LoadingProps<TopicsListModel>;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

interface GetQuestionListRequestedAction { type: 'GET_QUESTION_LIST_REQUESTED'; }
interface GetQuestionListSuccessAction { type: 'GET_QUESTION_LIST_SUCCESS'; payload: QuestionsListModel; }
interface GetQuestionListFailedAction { type: 'GET_QUESTION_LIST_FAILED'; payload: { error: string; }; }
interface GetTopicsListRequestedAction { type: 'GET_TOPICS_LIST_REQUESTED'; }
interface GetTopicsListSuccessAction { type: 'GET_TOPICS_LIST_SUCCESS'; payload: TopicsListModel; }
interface GetTopicsListFailedAction { type: 'GET_TOPICS_LIST_FAILED'; payload: { error: string; }; }

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction =
    GetQuestionListRequestedAction
    | GetQuestionListSuccessAction
    | GetQuestionListFailedAction
    | NewQuestionFormReceivedAction
    | GetTopicsListRequestedAction
    | GetTopicsListSuccessAction
    | GetTopicsListFailedAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    loadMoreQuestionItems: (beforeTimestamp?: number): AppThunkAction<KnownAction> => (dispatch, getState) => {
        return (async () => {
            if (beforeTimestamp && beforeTimestamp <= 0) {
                return;
            }
            dispatch({ type: 'GET_QUESTION_LIST_REQUESTED' });

            const url = '/api/questions' + (beforeTimestamp ? `?beforeTimestamp=${beforeTimestamp}` : '');
            getJson<QuestionsListModel>(url,
                getState().login.loggedInUser)
                .then((questionListResponse: QuestionsListModel) => {
                    dispatch({ type: 'GET_QUESTION_LIST_SUCCESS', payload: questionListResponse });
                })
                .catch((reason) => {
                    dispatch({
                        type: 'GET_QUESTION_LIST_FAILED',
                        payload: {
                            error: reason || 'Get Question list failed',
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

const defaultState: HomeState = { loadingQuestionList: {}, loadingTopicsList: {} };

export const reducer: Reducer<HomeState> = (state: HomeState, action: KnownAction) => {
    switch (action.type) {
        case 'GET_QUESTION_LIST_REQUESTED':
            return {
                loadingQuestionList: { ...state.loadingQuestionList, loading: true },
                loadingTopicsList: state.loadingTopicsList,
            };
        case 'GET_QUESTION_LIST_SUCCESS':
            if (state.loadingQuestionList.loadedModel) {
                // Slice for immutability
                const questionsNext = state.loadingQuestionList.loadedModel.questions.slice();
                for (const question of action.payload.questions) {
                    questionsNext.push(question);
                }
                return {
                    loadingQuestionList: {
                        loadedModel: { ...action.payload, questions: questionsNext },
                    },
                    loadingTopicsList: state.loadingTopicsList,
                };
            }
            return {
                loadingQuestionList: { loadedModel: action.payload },
                loadingTopicsList: state.loadingTopicsList,
            };
        case 'GET_QUESTION_LIST_FAILED':
            return {
                loadingQuestionList: { ...state.loadingQuestionList, error: action.payload.error },
                loadingTopicsList: state.loadingTopicsList,
            };
        case 'NEW_QUESTION_FORM_RECEIVED': {
            if (!state.loadingQuestionList.loadedModel) {
                // We could be posting a question from the topics page
                return state;
            }
            const questionListModel = state.loadingQuestionList.loadedModel;
            // Slice for immutability
            const questionItemsNext = questionListModel.questions.slice();
            const newQuestionItem: QuestionListItemModel = {
                id: action.payload.questionListItem.id,
                slug: action.payload.questionListItem.slug,
                text: action.payload.questionListItem.text,
                answersCount: action.payload.questionListItem.answersCount,
                topics: action.payload.questionListItem.topics,
            };
            questionItemsNext.unshift(newQuestionItem);
            const questionListNext = { ...questionListModel, questions: questionItemsNext };
            return {
                loadingQuestionList: { loadedModel: questionListNext },
                loadingTopicsList: state.loadingTopicsList,
            };
        }
        case 'GET_TOPICS_LIST_REQUESTED':
            return {
                loadingQuestionList: state.loadingQuestionList,
                loadingTopicsList: { loading: true },
            };
        case 'GET_TOPICS_LIST_SUCCESS':
            return {
                loadingQuestionList: state.loadingQuestionList,
                loadingTopicsList: { loadedModel: action.payload },
            };
        case 'GET_TOPICS_LIST_FAILED':
            return {
                loadingQuestionList: state.loadingQuestionList,
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
