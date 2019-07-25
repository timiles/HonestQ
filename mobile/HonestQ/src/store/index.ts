import * as Auth from './Auth';
import * as LogIn from './LogIn';
import * as LogOut from './LogOut';
import * as NewAnswer from './NewAnswer';
import * as NewComment from './NewComment';
import * as NewQuestion from './NewQuestion';
import * as NewTag from './NewTag';
import * as Notifications from './Notifications';
import * as Question from './Question';
import * as SignUp from './SignUp';
import * as Tag from './Tag';
import * as Tags from './Tags';
import * as ThemeSetting from './ThemeSetting';

// The top-level state object
export interface ApplicationState {
  auth: Auth.AuthState;
  logIn: LogIn.LogInState;
  logOut: LogOut.LogOutState;
  newAnswer: NewAnswer.NewAnswerState;
  newComment: NewComment.NewCommentState;
  newQuestion: NewQuestion.NewQuestionState;
  newTag: NewTag.NewTagState;
  notifications: Notifications.ListState;
  question: Question.QuestionState;
  signUp: SignUp.SignUpState;
  tag: Tag.TagState;
  tags: Tags.ListState;
  themeSetting: ThemeSetting.ThemeSettingState;
}

// Whenever an action is dispatched, Redux will update each top-level application state property using
// the reducer with the matching name. It's important that the names match exactly, and that the reducer
// acts on the corresponding ApplicationState property type.
export const reducers = {
  auth: Auth.reducer,
  logIn: LogIn.reducer,
  logOut: LogOut.reducer,
  newAnswer: NewAnswer.reducer,
  newComment: NewComment.reducer,
  newQuestion: NewQuestion.reducer,
  newTag: NewTag.reducer,
  notifications: Notifications.reducer,
  question: Question.reducer,
  signUp: SignUp.reducer,
  tag: Tag.reducer,
  tags: Tags.reducer,
  themeSetting: ThemeSetting.reducer,
};

// This type can be used as a hint on action creators so that its 'dispatch' and 'getState' params are
// correctly typed to match your store.
export type AppThunkAction<TAction> =
  (dispatch: (action: TAction) => void, getState: () => ApplicationState) => void;
