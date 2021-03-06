import { Middleware } from 'redux';
import { NewQuestionFormAwaitingApprovalAction } from '../store/NewQuestion';
import { NewTagFormSuccessAction } from '../store/NewTag';
import { UpdateWatchAnswerSuccessAction, UpdateWatchQuestionSuccessAction } from '../store/Question';
import { SignUpFormSuccessAction } from '../store/SignUp';
import { UpdateWatchTagSuccessAction } from '../store/Tag';
import { PopupOptions, showPopup } from '../utils/popup-utils';

type KnownAction =
  SignUpFormSuccessAction
  | NewTagFormSuccessAction
  | NewQuestionFormAwaitingApprovalAction
  | UpdateWatchTagSuccessAction
  | UpdateWatchQuestionSuccessAction
  | UpdateWatchAnswerSuccessAction
  ;

export const PopupMiddleware: Middleware = (store) => (next) => (action: KnownAction) => {

  const options = getPopupOptions(action);
  if (options) {
    showPopup(options);
  }

  next(action);
};

function getPopupOptions(action: KnownAction): PopupOptions {

  switch (action.type) {

    case 'SIGNUP_FORM_SUCCESS':
      return {
        title: 'Success',
        message: `Welcome to HonestQ, ${action.payload.username}!`,
      };

    case 'NEW_TAG_FORM_SUCCESS':
      return {
        title: 'Success',
        message: `Your tag "${action.payload.tag.name}" has been created and is awaiting approval!`,
        durationMilliseconds: 3000,
      };

    case 'NEW_QUESTION_FORM_AWAITING_APPROVAL':
      return {
        title: 'Success',
        message: 'Your question has been created and is awaiting approval!',
        durationMilliseconds: 3000,
      };

    case 'UPDATE_WATCH_TAG_SUCCESS':
      return (action.payload.response.watching) ?
        {
          title: 'Watching',
          message: 'You will receive a notification for each new question on this tag.',
        } :
        null;

    case 'UPDATE_WATCH_QUESTION_SUCCESS':
      return (action.payload.watching) ?
        {
          title: 'Watching',
          message: 'You will receive a notification for each new answer to this question.',
        } :
        null;

    case 'UPDATE_WATCH_ANSWER_SUCCESS':
      return (action.payload.watching) ?
        {
          title: 'Watching',
          message: 'You will receive a notification for each new comment on this answer.',
        } :
        null;

    default:
      // The following line guarantees that every action in the KnownAction union has been covered by a case above
      const exhaustiveCheck: never = action;
  }

  return null;
}
