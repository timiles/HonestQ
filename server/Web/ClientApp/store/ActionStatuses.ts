import { AnyAction, Reducer } from 'redux';
import { ApplicationState } from './index';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface ActionStatus {
    loading: boolean;
    error: string;
}

export interface ActionStatusesState {
    [key: string]: ActionStatus;
}

export const getActionStatus = (state: ApplicationState, action: string): ActionStatus => state.actionStatuses[action];

// ----------------
// REDUCER - For a given state and action, returns the new state.
// To support time travel, this must not mutate the old state.

const defaultState: ActionStatusesState = {};

export const reducer: Reducer<ActionStatusesState> = (state: ActionStatusesState, action: AnyAction) => {
    const { type } = action;

    // filter actions for *_REQUEST / *_SUCCESS / *_FAILURE
    const regExpMatches = /(.*)_(REQUEST|SUCCESS|FAILURE)/.exec(type);
    if (!regExpMatches) {
        return state || defaultState;
    }

    const [, requestName, requestState] = regExpMatches;
    return {
        ...state,
        // Store whether a request is happening at the moment or not
        // e.g. will be true when receiving GET_TODOS_REQUEST
        //      and false when receiving GET_TODOS_SUCCESS / GET_TODOS_FAILURE
        [requestName]: {
            loading: requestState === 'REQUEST',
            error: requestState === 'FAILURE' && action.payload ? action.payload.error : null,
        },
    };
};
