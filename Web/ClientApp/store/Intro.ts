import { Reducer } from 'redux';
import { AppThunkAction } from '.';
import { IntroModel } from '../server-models';
import { getJson } from '../utils';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface IntroState {
    loading: boolean;
    intro?: string;
    error?: string;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

interface GetIntroRequestedAction { type: 'GET_INTRO_REQUESTED'; }
interface GetIntroSuccessAction { type: 'GET_INTRO_SUCCESS'; payload: string; }
interface GetIntroFailedAction { type: 'GET_INTRO_FAILED'; payload: { error: string; }; }

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction =
    GetIntroRequestedAction
    | GetIntroSuccessAction
    | GetIntroFailedAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    getIntro: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        return (async () => {
            dispatch({ type: 'GET_INTRO_REQUESTED' });

            getJson<IntroModel>('/api/intro', getState().login.loggedInUser)
                .then((intro: IntroModel) => {
                    dispatch({ type: 'GET_INTRO_SUCCESS', payload: intro.content });
                })
                .catch((reason) => {
                    dispatch({
                        type: 'GET_INTRO_FAILED',
                        payload: {
                            error: reason || 'Get intro failed',
                        },
                    });
                });
        })();
    },
};

// ----------------
// REDUCER - For a given state and action, returns the new state.
// To support time travel, this must not mutate the old state.

const defaultState: IntroState = { loading: false };

export const reducer: Reducer<IntroState> = (state: IntroState, action: KnownAction) => {
    switch (action.type) {
        case 'GET_INTRO_REQUESTED':
            return { loading: true };
        case 'GET_INTRO_SUCCESS':
            return { loading: false, intro: action.payload };
        case 'GET_INTRO_FAILED':
            return { loading: false, error: action.payload.error };

        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    // For unrecognized actions (or in cases where actions have no effect), must return the existing state
    //  (or default initial state if none was supplied)
    return state || defaultState;
};
