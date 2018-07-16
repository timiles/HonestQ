import * as AdminHome from './AdminHome';
import * as EditStatement from './EditStatement';
import * as EditTopic from './EditTopic';
import * as Home from './Home';
import * as Intro from './Intro';
import * as Login from './Login';
import * as NewStatement from './NewStatement';
import * as NewTopic from './NewTopic';
import * as Register from './Register';
import * as Topic from './Topic';

// The top-level state object
export interface ApplicationState {
    adminHome: AdminHome.AdminHomeState;
    editStatement: EditStatement.EditStatementState;
    editTopic: EditTopic.EditTopicState;
    home: Home.HomeState;
    intro: Intro.IntroState;
    login: Login.LoginState;
    newStatement: NewStatement.NewStatementState;
    newTopic: NewTopic.NewTopicState;
    register: Register.RegisterState;
    topic: Topic.ContainerState;
}

// Whenever an action is dispatched, Redux will update each top-level application state property using
// the reducer with the matching name. It's important that the names match exactly, and that the reducer
// acts on the corresponding ApplicationState property type.
export const reducers = {
    adminHome: AdminHome.reducer,
    editStatement: EditStatement.reducer,
    editTopic: EditTopic.reducer,
    home: Home.reducer,
    intro: Intro.reducer,
    login: Login.reducer,
    newStatement: NewStatement.reducer,
    newTopic: NewTopic.reducer,
    register: Register.reducer,
    topic: Topic.reducer,
};

// This type can be used as a hint on action creators so that its 'dispatch' and 'getState' params are
// correctly typed to match your store.
export type AppThunkAction<TAction> =
    (dispatch: (action: TAction) => void, getState: () => ApplicationState) => void;
