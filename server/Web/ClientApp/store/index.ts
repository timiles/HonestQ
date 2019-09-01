import * as ActionStatuses from './ActionStatuses';
import * as AdminHome from './AdminHome';
import * as EditAnswer from './EditAnswer';
import * as EditComment from './EditComment';
import * as EditQuestion from './EditQuestion';
import * as EditTag from './EditTag';
import * as Login from './Login';
import * as NewAnswer from './NewAnswer';
import * as NewComment from './NewComment';
import * as NewQuestion from './NewQuestion';
import * as NewTag from './NewTag';
import * as Notifications from './Notifications';
import * as NotificationsCount from './NotificationsCount';
import * as Question from './Question';
import * as Questions from './Questions';
import * as QuestionSearch from './QuestionSearch';
import * as SignUp from './SignUp';
import * as Tag from './Tag';
import * as TagAutocomplete from './TagAutocomplete';
import * as Tags from './Tags';
import * as Toast from './Toast';
import * as VerifyEmail from './VerifyEmail';

// The top-level state object
export interface ApplicationState {
  actionStatuses: ActionStatuses.ActionStatusesState;
  adminHome: AdminHome.AdminHomeState;
  editAnswer: EditAnswer.EditAnswerState;
  editComment: EditComment.EditCommentState;
  editQuestion: EditQuestion.EditQuestionState;
  editTag: EditTag.EditTagState;
  login: Login.LoginState;
  newAnswer: NewAnswer.NewAnswerState;
  newComment: NewComment.NewCommentState;
  newQuestion: NewQuestion.NewQuestionState;
  newTag: NewTag.NewTagState;
  notifications: Notifications.ListState;
  notificationsCount: NotificationsCount.NotificationsCountState;
  question: Question.ContainerState;
  questions: Questions.ListState;
  questionSearch: QuestionSearch.QuestionSearchState;
  signUp: SignUp.SignUpState;
  tag: Tag.ContainerState;
  tagAutocomplete: TagAutocomplete.TagAutocompleteState;
  tags: Tags.ListState;
  toast: Toast.ToastState;
  verifyEmail: VerifyEmail.VerifyEmailState;
}

// Whenever an action is dispatched, Redux will update each top-level application state property using
// the reducer with the matching name. It's important that the names match exactly, and that the reducer
// acts on the corresponding ApplicationState property type.
export const reducers = {
  actionStatuses: ActionStatuses.reducer,
  adminHome: AdminHome.reducer,
  editAnswer: EditAnswer.reducer,
  editComment: EditComment.reducer,
  editQuestion: EditQuestion.reducer,
  editTag: EditTag.reducer,
  login: Login.reducer,
  newAnswer: NewAnswer.reducer,
  newComment: NewComment.reducer,
  newQuestion: NewQuestion.reducer,
  newTag: NewTag.reducer,
  notifications: Notifications.reducer,
  notificationsCount: NotificationsCount.reducer,
  question: Question.reducer,
  questions: Questions.reducer,
  questionSearch: QuestionSearch.reducer,
  signUp: SignUp.reducer,
  tag: Tag.reducer,
  tagAutocomplete: TagAutocomplete.reducer,
  tags: Tags.reducer,
  toast: Toast.reducer,
  verifyEmail: VerifyEmail.reducer,
};

// This type can be used as a hint on action creators so that its 'dispatch' and 'getState' params are
// correctly typed to match your store.
export type AppThunkAction<TAction> =
  (dispatch: (action: TAction) => void, getState: () => ApplicationState) => void;
