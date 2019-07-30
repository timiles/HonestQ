import { Reducer } from 'redux';
import { AppThunkAction } from '.';
import ThemeService, { Theme } from '../ThemeService';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface ThemeSettingState {
  theme: Theme;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

export interface SetThemeSuccessAction {
  type: 'SET_THEME_SUCCESS';
  payload: { theme: Theme; };
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction = SetThemeSuccessAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
  setTheme: (theme: Theme): AppThunkAction<KnownAction> =>
    (dispatch, getState) => {
      return (async () => {
        ThemeService.setTheme(theme);
        dispatch({ type: 'SET_THEME_SUCCESS', payload: { theme } });
      })();
    },
};

// ----------------
// REDUCER - For a given state and action, returns the new state.
// To support time travel, this must not mutate the old state.

const defaultState: ThemeSettingState = { theme: ThemeService.getTheme() };

export const reducer: Reducer<ThemeSettingState> = (state: ThemeSettingState, action: KnownAction) => {
  switch (action.type) {
    case 'SET_THEME_SUCCESS':
      return {
        theme: action.payload.theme,
      };
  }

  // For unrecognized actions (or in cases where actions have no effect), must return the existing state
  //  (or default initial state if none was supplied)
  return state || defaultState;
};
