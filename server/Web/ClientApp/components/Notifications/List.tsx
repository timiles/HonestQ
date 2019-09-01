import { EventEmitter } from 'events';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { NotificationModel } from '../../server-models';
import { ApplicationState } from '../../store';
import { ActionStatus, getActionStatus } from '../../store/ActionStatuses';
import * as NotificationsStore from '../../store/Notifications';
import ActionStatusDisplay from '../shared/ActionStatusDisplay';
import CircleIcon, { CircleIconValue } from '../shared/CircleIcon';
import DateTimeTooltip from '../shared/DateTimeTooltip';
import QuotationMarks from '../shared/QuotationMarks';
import Icon, { IconValue } from '../shared/SvgIcons/Icon';
import WatchControlDemo from '../shared/WatchControlDemo';

interface OwnProps {
  windowScrollEventEmitter: EventEmitter;
  onAllNotificationsLoaded: () => void;
}
type Props = NotificationsStore.ListState
  & typeof NotificationsStore.actionCreators
  & OwnProps
  & {
    getNotificationsListStatus: ActionStatus,
  };

class NotificationList extends React.Component<Props> {

  constructor(props: Props) {
    super(props);

    this.props.windowScrollEventEmitter.addListener('scrolledToBottom', () => {
      // Prevent triggering multiple times
      if (!this.props.getNotificationsListStatus.loading && !this.props.getNotificationsListStatus.error &&
        this.props.notificationsList && this.props.notificationsList.lastId > 0) {
        this.props.loadMoreNotifications(this.props.notificationsList.lastId);
      }
    });

    this.handleMarkAsSeen = this.handleMarkAsSeen.bind(this);
    this.handleMarkAllAsSeen = this.handleMarkAllAsSeen.bind(this);

    if (!this.props.notificationsList) {
      this.props.loadMoreNotifications();
    }
  }

  public componentDidUpdate(prevProps: Props) {
    if (this.props.notificationsList &&
      this.props.notificationsList.lastId === 0 &&
      prevProps.notificationsList &&
      prevProps.notificationsList.lastId > 0) {
      // Reached the end of the list! Eat your heart out Twitter.
      this.props.onAllNotificationsLoaded();
    }
  }

  public render() {
    const { notificationsList } = this.props;
    const unseenCount = notificationsList ? notificationsList.notifications.filter((x) => !x.seen).length : 0;

    return (
      <>
        <h1>
          <span className="mr-2">Recent notifications</span>
          {unseenCount > 0 &&
            <small>
              <button
                className="mb-1 btn btn-sm btn-success"
                type="button"
                onClick={this.handleMarkAllAsSeen}
              >
                Mark all as seen
              </button>
            </small>
          }
        </h1>
        {notificationsList &&
          <>
            {notificationsList.notifications.length > 0 ?
              <ul className="list-unstyled">
                {notificationsList.notifications.map((x: NotificationModel, i: number) =>
                  <li key={i} className="mb-2">
                    {this.renderNotification(x)}
                  </li>)}
                {notificationsList.lastId === 0 && notificationsList.notifications.length > 40 &&
                  <li>
                    That's all, folks!
                  </li>
                }
              </ul>
              :
              <div>
                <p>
                  <i>No notifications yet.</i>
                </p>
                <p>
                  Around the site you will see a Watch button, like this:
                </p>
                <p className="text-center">
                  <WatchControlDemo />
                </p>
                <p>
                  Try watching some Tags, Questions or Answers to be notified of new posts under each.
                </p>
              </div>
            }
          </>
        }
        <ActionStatusDisplay {...this.props.getNotificationsListStatus} />
      </>
    );
  }

  private renderNotification(notification: NotificationModel) {
    const questionUrl = `/questions/${notification.questionId}/${notification.questionSlug}`;
    const answerUrl = `${questionUrl}/${notification.answerId}/${notification.answerSlug}`;

    switch (notification.type) {
      case 'Question': {
        return (
          <>
            <div>
              <small>
                New question
                {notification.tags.length > 0 &&
                  <>{} in: {}
                    <ul className="list-inline list-comma-separated">
                      {notification.tags.map((x, i) =>
                        <li key={i} className="list-inline-item">
                          <Link to={`/tags/${x.slug}`}>
                            <b>{x.name}</b>
                          </Link>
                        </li>)}
                    </ul>
                  </>
                }
                , <DateTimeTooltip dateTime={notification.postedAt} />
              </small>
            </div>
            <Link
              to={questionUrl}
              className="btn btn-lg btn-outline-secondary post-list-item brand-font-color light-dark-bg"
              data-id={notification.id}
              onClick={this.handleMarkAsSeen}
            >
              {!notification.seen &&
                <span className="float-right ml-1">
                  <Icon value={IconValue.Watch} />
                </span>
              }
              <CircleIcon className="float-left mr-3" value={CircleIconValue.Question} />
              <span className="question">{notification.questionText}</span>
            </Link>
          </>
        );
      }
      case 'Answer': {
        return (
          <>
            <div>
              <small>
                New answer to: {}
                <Link to={questionUrl}>
                  <b>{notification.questionText}</b>
                </Link>
                , <DateTimeTooltip dateTime={notification.postedAt} />
              </small>
            </div>
            <Link
              to={answerUrl}
              className="btn btn-lg btn-outline-secondary post-list-item brand-font-color light-dark-bg"
              data-id={notification.id}
              onClick={this.handleMarkAsSeen}
            >
              {!notification.seen &&
                <span className="float-right ml-1">
                  <Icon value={IconValue.Watch} />
                </span>
              }
              <CircleIcon className="float-left mr-3" value={CircleIconValue.Answer} />
              <QuotationMarks width={20}>
                <span className="mx-2 answer">{notification.answerText}</span>
              </QuotationMarks>
            </Link>
          </>
        );
      }
      case 'Comment': {
        const iconValue = IconValue[notification.agreementRating as keyof typeof IconValue];
        return (
          <>
            <div>
              <small>
                New comment on: {}
                <Link to={questionUrl}>
                  <b>{notification.questionText}</b>
                </Link>
                {} » {}
                <Link to={answerUrl} className="answer">
                  <QuotationMarks width={10}>
                    <b>{notification.answerText}</b>
                  </QuotationMarks>
                </Link>
                , <DateTimeTooltip dateTime={notification.postedAt} />
              </small>
            </div>
            <Link
              to={answerUrl}
              className="btn btn-lg btn-outline-secondary post-list-item brand-font-color light-dark-bg"
              data-id={notification.id}
              onClick={this.handleMarkAsSeen}
            >
              {!notification.seen &&
                <span className="float-right ml-1">
                  <Icon value={IconValue.Watch} />
                </span>
              }
              {iconValue >= 0 &&
                <span className="badge badge-pill badge-reaction float-left mr-2">
                  <Icon value={iconValue} />
                </span>}
              <span className="ml-1 comment">{notification.commentText}</span>
            </Link>
          </>
        );
      }
      default: return null;
    }
  }

  private handleMarkAsSeen(event: React.MouseEvent<HTMLAnchorElement>): void {
    const notificationId = Number(event.currentTarget.dataset.id);
    if (notificationId) {
      this.props.markAsSeen(notificationId);
    } else {
      // TODO: log?
    }
  }

  private handleMarkAllAsSeen(event: React.FormEvent<HTMLButtonElement>): void {
    this.props.markAllAsSeen();
  }
}

export default connect(
  (state: ApplicationState, ownProps: OwnProps) => ({
    ...state.notifications,
    getNotificationsListStatus: getActionStatus(state, 'GET_NOTIFICATIONS_LIST'),
  }),
  NotificationsStore.actionCreators,
)(NotificationList);
