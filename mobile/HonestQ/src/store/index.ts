import * as Auth from './Auth';
import * as Login from './LogInn';
import * as NewAnswer from './NewAnswer';
import * as NewComment from './NewComment';
import * as NewQuestion from './NewQuestion';
import * as NewTag from './NewTag';
import * as Question from './Question';
import * as SignUp from './SignUp';
import * as Tag from './Tag';
import * as Tags from './Tags';

// The top-level state object
export interface ApplicationState {
  auth: Auth.AuthState;
  login: Login.LoginState;
  newAnswer: NewAnswer.NewAnswerState;
  newComment: NewComment.NewCommentState;
  newQuestion: NewQuestion.NewQuestionState;
  newTag: NewTag.NewTagState;
  question: Question.QuestionState;
  signUp: SignUp.SignUpState;
  tag: Tag.TagState;
  tags: Tags.ListState;
}

// Whenever an action is dispatched, Redux will update each top-level application state property using
// the reducer with the matching name. It's important that the names match exactly, and that the reducer
// acts on the corresponding ApplicationState property type.
export const reducers = {
  auth: Auth.reducer,
  login: Login.reducer,
  newAnswer: NewAnswer.reducer,
  newComment: NewComment.reducer,
  newQuestion: NewQuestion.reducer,
  newTag: NewTag.reducer,
  question: Question.reducer,
  signUp: SignUp.reducer,
  tag: Tag.reducer,
  tags: Tags.reducer,
};

// This type can be used as a hint on action creators so that its 'dispatch' and 'getState' params are
// correctly typed to match your store.
export type AppThunkAction<TAction> =
  (dispatch: (action: TAction) => void, getState: () => ApplicationState) => void;
