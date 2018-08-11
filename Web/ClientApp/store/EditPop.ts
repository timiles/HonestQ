import { Reducer } from 'redux';
import { AppThunkAction } from '.';
import { LoadingProps } from '../components/shared/Loading';
import { PopFormModel, PopModel } from '../server-models';
import { getJson, putJson } from '../utils';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface EditPopState {
    popModel: LoadingProps<PopModel>;
    successfullySaved?: boolean;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

interface GetPopRequestedAction {
    type: 'GET_POP_REQUESTED';
    payload: { popId: number; };
}
interface GetPopSuccessAction {
    type: 'GET_POP_SUCCESS';
    payload: { pop: PopModel; popId: number; };
}
interface GetPopFailedAction {
    type: 'GET_POP_FAILED';
    payload: { popId: number; error: string; };
}
interface EditPopFormSubmittedAction {
    type: 'EDIT_POP_FORM_SUBMITTED';
}
interface EditPopFormReceivedAction {
    type: 'EDIT_POP_FORM_RECEIVED';
    payload: { popId: number; pop: PopModel; };
}
interface EditPopFormFailedAction {
    type: 'EDIT_POP_FORM_FAILED';
    payload: { error: string | null; };
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction = GetPopRequestedAction
    | GetPopSuccessAction
    | GetPopFailedAction
    | EditPopFormSubmittedAction
    | EditPopFormReceivedAction
    | EditPopFormFailedAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    getPop: (popId: number): AppThunkAction<KnownAction> => (dispatch, getState) => {
        return (async () => {
            dispatch({ type: 'GET_POP_REQUESTED', payload: { popId } });

            getJson<PopModel>(`/api/pops/${popId}`, getState().login.loggedInUser)
                .then((popResponse: PopModel) => {
                    dispatch({
                        type: 'GET_POP_SUCCESS',
                        payload: { pop: popResponse, popId },
                    });
                })
                .catch((reason) => {
                    dispatch({
                        type: 'GET_POP_FAILED', payload: {
                            popId,
                            error: reason || 'Get topic failed',
                        },
                    });
                });
        })();
    },
    submit: (popId: number, popForm: PopFormModel):
        AppThunkAction<KnownAction> => (dispatch, getState) => {
            return (async () => {
                dispatch({ type: 'EDIT_POP_FORM_SUBMITTED' });

                if (!popForm.text || !popForm.type) {
                    // Don't set an error message, the validation properties will display instead
                    dispatch({ type: 'EDIT_POP_FORM_FAILED', payload: { error: null } });
                    return;
                }

                putJson<PopModel>(
                    `/api/pops/${popId}`, popForm, getState().login.loggedInUser!)
                    .then((popResponse: PopModel) => {
                        dispatch({
                            type: 'EDIT_POP_FORM_RECEIVED', payload: {
                                popId,
                                pop: popResponse,
                            },
                        });
                    })
                    .catch((reason: string) => {
                        dispatch({ type: 'EDIT_POP_FORM_FAILED', payload: { error: reason } });
                    });
            })();
        },
};

// ----------------
// REDUCER - For a given state and action, returns the new state.
// To support time travel, this must not mutate the old state.

const defaultState: EditPopState = { popModel: {} };

export const reducer: Reducer<EditPopState> = (state: EditPopState, action: KnownAction) => {
    switch (action.type) {
        case 'GET_POP_REQUESTED':
            return {
                popModel: {
                    id: action.payload.popId.toString(),
                    loading: true,
                },
                editPopForm: {},
            };
        case 'GET_POP_SUCCESS':
            return {
                popModel: {
                    id: action.payload.popId.toString(),
                    loadedModel: action.payload.pop,
                },
            };
        case 'GET_POP_FAILED':
            return {
                popModel: {
                    id: action.payload.popId.toString(),
                    error: action.payload.error,
                },
            };
        case 'EDIT_POP_FORM_SUBMITTED':
            return {
                popModel: state.popModel,
                editPopForm: {
                    submitting: true,
                    submitted: true,
                },
            };
        case 'EDIT_POP_FORM_RECEIVED':
            return {
                popModel: {
                    id: action.payload.popId.toString(),
                    loadedModel: action.payload.pop,
                },
                editPopForm: {
                    submitting: false,
                    submitted: false,
                },
                successfullySaved: true,
            };
        case 'EDIT_POP_FORM_FAILED':
            return {
                popModel: state.popModel,
                editPopForm: {
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
