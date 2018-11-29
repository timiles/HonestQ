import { EventEmitter } from 'events';
import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { NotificationModel } from '../../server-models';
import { ApplicationState } from '../../store';
import * as NotificationsStore from '../../store/Notifications';
import DateTimeTooltip from '../shared/DateTimeTooltip';
import Emoji, { EmojiValue } from '../shared/Emoji';
import Loading from '../shared/Loading';
import WatchControlDemo from '../shared/WatchControlDemo';

type Props = NotificationsStore.ListState
    & typeof NotificationsStore.actionCreators
    & { windowScrollEventEmitter: EventEmitter, onAllNotificationsLoaded: () => void };

class NotificationList extends React.Component<Props> {

    constructor(props: Props) {
        super(props);

        this.props.windowScrollEventEmitter.addListener('scrolledToBottom', () => {
            // Prevent triggering multiple times
            if (!this.props.loadingNotificationList.loading &&
                this.props.loadingNotificationList.loadedModel!.lastId > 0) {
                this.props.loadMoreNotifications(this.props.loadingNotificationList.loadedModel!.lastId);
            }
        });

        this.handleClick = this.handleClick.bind(this);
    }

    public componentWillMount() {
        if (!this.props.loadingNotificationList.loadedModel) {
            this.props.loadMoreNotifications();
        }
    }

    public componentDidUpdate(prevProps: Props) {
        if (this.props.loadingNotificationList.loadedModel &&
            this.props.loadingNotificationList.loadedModel.lastId === 0 &&
            prevProps.loadingNotificationList.loadedModel &&
            prevProps.loadingNotificationList.loadedModel.lastId > 0) {
            // Reached the end of the list! Eat your heart out Twitter.
            this.props.onAllNotificationsLoaded();
        }
    }

    public render() {
        const notificationList = this.props.loadingNotificationList.loadedModel;

        return (
            <>
                <h1>Recent notifications</h1>
                {notificationList && notificationList.notifications.length > 0 ?
                    <ul className="list-unstyled">
                        {notificationList.notifications.map((x: NotificationModel, i: number) =>
                            <li key={i} className="mb-2">
                                {this.renderNotification(x)}
                            </li>)}
                        {notificationList.lastId === 0 && notificationList.notifications.length > 40 &&
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
                            Try watching some Tags, Questions, Answers, or Comments
                            to be notified of new posts under each.
                        </p>
                    </div>
                }
                <Loading {...this.props.loadingNotificationList} />
            </>
        );
    }

    private renderNotification(notification: NotificationModel) {
        const questionUrl = `/questions/${notification.questionId}/${notification.questionSlug}`;
        const answerUrl = `${questionUrl}/${notification.answerId}/${notification.answerSlug}`;
        const seenClassName = notification.seen ? 'btn-outline-secondary' : 'btn-success';

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
                            className={`btn btn-lg post-list-item ${seenClassName}`}
                            data-id={notification.id}
                            onClick={this.handleClick}
                        >
                            <Emoji value={EmojiValue.Question} />
                            <span className="ml-1 question">{notification.questionText}</span>
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
                            className={`btn btn-lg post-list-item ${seenClassName}`}
                            data-id={notification.id}
                            onClick={this.handleClick}
                        >
                            <Emoji value={EmojiValue.Answer} />
                            <span className="ml-1 answer">{notification.answerText}</span>
                        </Link>
                    </>
                );
            }
            case 'Comment': {
                const emojiValue = EmojiValue[notification.agreementRating as keyof typeof EmojiValue];
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
                                    <b>{notification.answerText}</b>
                                </Link>
                                , <DateTimeTooltip dateTime={notification.postedAt} />
                            </small>
                        </div>
                        <Link
                            to={answerUrl}
                            className={`btn btn-lg post-list-item ${seenClassName}`}
                            data-id={notification.id}
                            onClick={this.handleClick}
                        >
                            {emojiValue && <Emoji value={emojiValue} />}
                            <span className="ml-1 comment">{notification.commentText}</span>
                        </Link>
                    </>
                );
            }
            default: return null;
        }
    }

    private handleClick(event: React.MouseEvent<HTMLAnchorElement>): void {
        const notificationId = Number(event.currentTarget.dataset.id);
        if (notificationId) {
            this.props.markAsSeen(notificationId);
        } else {
            // TODO: log?
        }
    }
}

export default connect(
    (state: ApplicationState, ownProps: any): any => (state.notifications),
    NotificationsStore.actionCreators,
)(NotificationList);
