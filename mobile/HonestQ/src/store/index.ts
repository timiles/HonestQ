import * as Auth from './Auth';
import * as LogIn from './LogIn';
import * as LogOut from './LogOut';
import * as NewAnswer from './NewAnswer';
import * as NewComment from './NewComment';
import * as NewQuestion from './NewQuestion';
import * as NewTag from './NewTag';
import * as Notifications from './Notifications';
import * as NotificationsCount from './NotificationsCount';
import * as Question from './Question';
import * as Questions from './Questions';
import * as SignUp from './SignUp';
import * as Tag from './Tag';
import * as TagAutocomplete from './TagAutocomplete';
import * as Tags from './Tags';
import * as ThemeSetting from './ThemeSetting';
import * as WatchingAnswers from './WatchingAnswers';
import * as WatchingQuestions from './WatchingQuestions';

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
  notificationsCount: NotificationsCount.NotificationsCountState;
  question: Question.QuestionState;
  questions: Questions.ListState;
  signUp: SignUp.SignUpState;
  tag: Tag.TagState;
  tagAutocomplete: TagAutocomplete.TagAutocompleteState;
  tags: Tags.ListState;
  themeSetting: ThemeSetting.ThemeSettingState;
  watchingsAnswers: WatchingAnswers.State;
  watchingsQuestions: WatchingQuestions.State;
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
  notificationsCount: NotificationsCount.reducer,
  question: Question.reducer,
  questions: Questions.reducer,
  signUp: SignUp.reducer,
  tag: Tag.reducer,
  tagAutocomplete: TagAutocomplete.reducer,
  tags: Tags.reducer,
  themeSetting: ThemeSetting.reducer,
  watchingsAnswers: WatchingAnswers.reducer,
  watchingsQuestions: WatchingQuestions.reducer,
};

// This type can be used as a hint on action creators so that its 'dispatch' and 'getState' params are
// correctly typed to match your store.
export type AppThunkAction<TAction> =
  (dispatch: (action: TAction) => void, getState: () => ApplicationState) => void;
