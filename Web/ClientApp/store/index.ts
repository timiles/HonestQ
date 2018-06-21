import * as AdminHome from './AdminHome';
import * as Home from './Home';
import * as Intro from './Intro';
import * as Login from './Login';
import * as NewTopic from './NewTopic';
import * as Register from './Register';
import * as Topic from './Topic';

// The top-level state object
export interface ApplicationState {
    adminHome: AdminHome.AdminHomeState;
    home: Home.HomeState;
    intro: Intro.IntroState;
    login: Login.LoginState;
    newTopic: NewTopic.NewTopicState;
    register: Register.RegisterState;
    topic: Topic.ContainerState;
}

// Whenever an action is dispatched, Redux will update each top-level application state property using
// the reducer with the matching name. It's important that the names match exactly, and that the reducer
// acts on the corresponding ApplicationState property type.
export const reducers = {
    adminHome: AdminHome.reducer,
    home: Home.reducer,
    intro: Intro.reducer,
    login: Login.reducer,
    newTopic: NewTopic.reducer,
    register: Register.reducer,
    topic: Topic.reducer,
};

// This type can be used as a hint on action creators so that its 'dispatch' and 'getState' params are
// correctly typed to match your store.
export type AppThunkAction<TAction> =
    (dispatch: (action: TAction) => void, getState: () => ApplicationState) => void;
