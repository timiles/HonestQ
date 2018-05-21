import * as Home from './Home';
import * as Login from './Login';
import * as Register from './Register';
import * as Topic from './Topic';

// The top-level state object
// tslint:disable-next-line:interface-name
export interface ApplicationState {
    home: Home.HomeState;
    login: Login.LoginState;
    register: Register.RegisterState;
    topic: Topic.TopicState;
}

// Whenever an action is dispatched, Redux will update each top-level application state property using
// the reducer with the matching name. It's important that the names match exactly, and that the reducer
// acts on the corresponding ApplicationState property type.
export const reducers = {
    home: Home.reducer,
    login: Login.reducer,
    register: Register.reducer,
    topic: Topic.reducer,
};

// This type can be used as a hint on action creators so that its 'dispatch' and 'getState' params are
// correctly typed to match your store.
export type AppThunkAction<TAction> =
    (dispatch: (action: TAction) => void, getState: () => ApplicationState) => void;
