import { Reducer } from 'redux';
import { AppThunkAction } from '.';
import { UpdateWatchSuccessAction } from './Question';
import { UpdateWatchTagSuccessAction } from './Tag';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface ToastState {
    toasts: ToastModel[];
}

export interface ToastModel {
    title: string;
    message: string;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

interface ClearToastAction {
    type: 'CLEAR_TOAST';
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction = ClearToastAction
    | UpdateWatchSuccessAction
    | UpdateWatchTagSuccessAction
    ;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    clearToast: (timeoutMilliseconds: number): AppThunkAction<KnownAction> =>
        (dispatch, getState) => {
            return (async () => {
                setTimeout(() => {
                    dispatch({ type: 'CLEAR_TOAST' });
                }, timeoutMilliseconds);
            })();
        },
};

// ----------------
// REDUCER - For a given state and action, returns the new state.
// To support time travel, this must not mutate the old state.

const defaultState: ToastState = { toasts: [] };

export const reducer: Reducer<ToastState> = (state: ToastState, action: KnownAction) => {

    if (action.type === 'CLEAR_TOAST') {
        return {
            toasts: state.toasts.slice(1),
        };
    }

    const switchActionType = (): ToastModel | null => {
        switch (action.type) {
            case 'UPDATE_WATCH_SUCCESS':
                const watchedObject = (action.payload.answerId) ? 'answer' : 'question';

                if (action.payload.response.watching) {
                    const newObject = (action.payload.answerId) ? 'comment on' : 'answer to';

                    return {
                        title: 'Watching',
                        message: `You will receive a notification for each new ${newObject} this ${watchedObject}.`,
                    };
                } else {
                    return {
                        title: 'Not watching',
                        message: `You will no longer receive notifications about this ${watchedObject}.`,
                    };
                }
            case 'UPDATE_WATCH_TAG_SUCCESS':
                if (action.payload.response.watching) {
                    return {
                        title: 'Watching',
                        message: 'You will receive a notification for each new question on this tag.',
                    };
                } else {
                    return {
                        title: 'Not watching',
                        message: 'You will no longer receive notifications about this tag.',
                    };
                }
            default: {
                return null;
            }
        }
    };

    const toast = switchActionType();

    if (!toast) {
        return state || defaultState;
    }

    // Slice for immutability
    const toastsNext = state.toasts.slice();
    toastsNext.push(toast);
    return {
        toasts: toastsNext,
    };
};
