import { Reducer } from 'redux';
import { AppThunkAction } from '.';
import { FormProps } from '../components/shared/FormProps';
import { LoadingProps } from '../components/shared/Loading';
import { AdminTagModel, EditTagFormModel } from '../server-models';
import { getJson, putJson } from '../utils/http-utils';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface EditTagState {
    tagModel: LoadingProps<AdminTagModel>;
    editTagForm: FormProps<EditTagFormModel>;
    successfullySaved?: boolean;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

interface GetAdminTagRequestedAction { type: 'GET_ADMIN_TAG_REQUESTED'; payload: { tagSlug: string; }; }
interface GetAdminTagSuccessAction {
    type: 'GET_ADMIN_TAG_SUCCESS';
    payload: { tag: AdminTagModel; tagSlug: string; };
}
interface GetAdminTagFailedAction { type: 'GET_ADMIN_TAG_FAILED'; payload: { tagSlug: string; error: string; }; }
interface EditTagFormSubmittedAction { type: 'EDIT_TAG_FORM_SUBMITTED'; }
interface EditTagFormReceivedAction { type: 'EDIT_TAG_FORM_RECEIVED'; payload: { tag: AdminTagModel; }; }
interface EditTagFormFailedAction { type: 'EDIT_TAG_FORM_FAILED'; payload: { error: string | null; }; }

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction = GetAdminTagRequestedAction
    | GetAdminTagSuccessAction
    | GetAdminTagFailedAction
    | EditTagFormSubmittedAction
    | EditTagFormReceivedAction
    | EditTagFormFailedAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    getTag: (tagSlug: string): AppThunkAction<KnownAction> => (dispatch, getState) => {
        return (async () => {
            dispatch({ type: 'GET_ADMIN_TAG_REQUESTED', payload: { tagSlug } });

            getJson<AdminTagModel>(`/api/tags/${tagSlug}`, getState().login.loggedInUser)
                .then((tagResponse: AdminTagModel) => {
                    dispatch({
                        type: 'GET_ADMIN_TAG_SUCCESS',
                        payload: { tag: tagResponse, tagSlug },
                    });
                })
                .catch((reason) => {
                    dispatch({
                        type: 'GET_ADMIN_TAG_FAILED', payload: {
                            tagSlug,
                            error: reason || 'Get tag failed',
                        },
                    });
                });
        })();
    },
    submit: (slug: string, tagForm: EditTagFormModel): AppThunkAction<KnownAction> => (dispatch, getState) => {
        return (async () => {
            dispatch({ type: 'EDIT_TAG_FORM_SUBMITTED' });

            if (!tagForm.name || !tagForm.slug || (tagForm.description && tagForm.description.length > 280)) {
                // Don't set an error message, the validation properties will display instead
                dispatch({ type: 'EDIT_TAG_FORM_FAILED', payload: { error: null } });
                return;
            }

            putJson<AdminTagModel>(`/api/tags/${slug}`, tagForm, getState().login.loggedInUser!)
                .then((tagResponse: AdminTagModel) => {
                    dispatch({ type: 'EDIT_TAG_FORM_RECEIVED', payload: { tag: tagResponse } });
                })
                .catch((reason: string) => {
                    dispatch({ type: 'EDIT_TAG_FORM_FAILED', payload: { error: reason } });
                });
        })();
    },
};

// ----------------
// REDUCER - For a given state and action, returns the new state.
// To support time travel, this must not mutate the old state.

const defaultState: EditTagState = { tagModel: {}, editTagForm: {} };

export const reducer: Reducer<EditTagState> = (state: EditTagState, action: KnownAction) => {
    switch (action.type) {
        case 'GET_ADMIN_TAG_REQUESTED':
            return {
                tagModel: {
                    id: action.payload.tagSlug,
                    loading: true,
                },
                editTagForm: {},
            };
        case 'GET_ADMIN_TAG_SUCCESS':
            return {
                tagModel: {
                    id: action.payload.tagSlug,
                    loadedModel: action.payload.tag,
                },
                editTagForm: state.editTagForm,
            };
        case 'GET_ADMIN_TAG_FAILED':
            return {
                tagModel: {
                    id: action.payload.tagSlug,
                    error: action.payload.error,
                },
                editTagForm: state.editTagForm,
            };
        case 'EDIT_TAG_FORM_SUBMITTED':
            return {
                tagModel: state.tagModel,
                editTagForm: {
                    submitting: true,
                    submitted: true,
                },
            };
        case 'EDIT_TAG_FORM_RECEIVED':
            return {
                tagModel: {
                    id: action.payload.tag.slug,
                    loadedModel: action.payload.tag,
                },
                editTagForm: {
                    submitting: false,
                    submitted: false,
                },
                successfullySaved: true,
                // TODO: if Tag was Approved, update pending list on AdminHome
            };
        case 'EDIT_TAG_FORM_FAILED':
            return {
                tagModel: state.tagModel,
                editTagForm: {
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
