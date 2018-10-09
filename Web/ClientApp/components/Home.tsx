import * as React from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { ActivityListItemModel, LoggedInUserModel, TopicListItemModel, TopicValueModel } from '../server-models';
import { ApplicationState } from '../store';
import * as HomeStore from '../store/Home';
import Emoji, { EmojiValue } from './shared/Emoji';
import Loading from './shared/Loading';
import NewQuestion from './Topic/NewQuestion';

type HomeProps = HomeStore.HomeState
    & typeof HomeStore.actionCreators
    & RouteComponentProps<{}>
    // PRIVATE BETA
    & { loggedInUser: LoggedInUserModel };

class Home extends React.Component<HomeProps, {}> {

    constructor(props: HomeProps) {
        super(props);

        this.handleScroll = this.handleScroll.bind(this);
    }

    public componentWillMount() {
        // PRIVATE BETA
        if (!this.props.loggedInUser) {
            return;
        }
        if (!this.props.loadingActivityList.loadedModel) {
            this.props.getActivityList();
        }
        if (!this.props.loadingTopicsList.loadedModel) {
            this.props.getTopicsList();
        }
    }

    public componentDidMount() {
        window.addEventListener('scroll', this.handleScroll);
    }

    public componentDidUpdate(prevProps: HomeProps) {
        if (this.props.loadingActivityList.loadedModel &&
            this.props.loadingActivityList.loadedModel.lastTimestamp === 0 &&
            prevProps.loadingActivityList.loadedModel &&
            prevProps.loadingActivityList.loadedModel.lastTimestamp > 0) {
            // Reached the end of the list! Eat your heart out Twitter.
            window.removeEventListener('scroll', this.handleScroll);
        }
    }

    public componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
    }

    public render() {
        const activityList = this.props.loadingActivityList.loadedModel;
        const topicsModel = this.props.loadingTopicsList.loadedModel;
        return (
            <>
                <div className="col-md-12 col-lg-6 offset-lg-3">
                    <h1>Recent activity</h1>
                    {activityList &&
                        <ul className="list-unstyled">
                            <li className="mb-2">
                                <NewQuestion />
                            </li>
                            {activityList.activityItems.map((x: ActivityListItemModel, i: number) =>
                                <li key={`activity_${i}`} className="mb-2">
                                    {this.renderActivityItem(x)}
                                </li>)}
                            {activityList.lastTimestamp === 0 &&
                                <li>
                                    That's all, folks!
                                </li>
                            }
                        </ul>
                    }
                    <Loading {...this.props.loadingActivityList} />
                </div>
                <div className="col-md-3 d-none d-lg-block">
                    <h2>Topics</h2>
                    <Loading {...this.props.loadingTopicsList} />
                    {topicsModel &&
                        <ul className="topics-list">
                            {topicsModel.topics.map((x: TopicListItemModel, i: number) =>
                                <li key={`topic_${i}`} className="mr-1 mb-1">
                                    <Link
                                        to={`/topics/${x.slug}`}
                                        className="btn btn-sm btn-outline-secondary topic-list-item"
                                    >
                                        {x.name}
                                    </Link>
                                </li>)}
                            <li>
                                <Link to="/newtopic" className="btn btn-sm btn-primary">
                                    Suggest a new Topic
                                </Link>
                            </li>
                        </ul>
                    }
                </div>
            </>
        );
    }

    private renderActivityItem(activity: ActivityListItemModel) {
        const questionUrl = `/questions/${activity.questionId}/${activity.questionSlug}`;
        const answerUrl = `${questionUrl}/${activity.answerId}/${activity.answerSlug}`;
        const commentUrl = answerUrl; // TODO

        switch (activity.type) {
            case 'Question': {
                return (
                    <>
                        <div>
                            <small>
                                New question
                                {activity.topics.length > 0 &&
                                    <>&#32;in:&#32;
                                        <ul className="list-comma-separated">
                                            {activity.topics.map((x: TopicValueModel, i: number) =>
                                                <li key={`topic_${i}`}>
                                                    <Link to={`/topics/${x.slug}`}>
                                                        <b>{x.name}</b>
                                                    </Link>
                                                </li>)}
                                        </ul>
                                    </>
                                }
                            </small>
                        </div>
                        <Link to={questionUrl} className="btn btn-lg btn-outline-secondary post-list-item">
                            <Emoji value={EmojiValue.Question} />
                            <span className="ml-1 question">{activity.questionText}</span>
                            <small className="ml-1">
                                <span className="badge badge-info">{activity.childCount}</span>
                                <span className="sr-only">answers</span>
                            </small>
                        </Link>
                    </>
                );
            }
            case 'Answer': {
                return (
                    <>
                        <div>
                            <small>
                                New answer to:&#32;
                                <Link to={questionUrl}>
                                    <b>{activity.questionText}</b>
                                </Link>
                            </small>
                        </div>
                        <Link to={answerUrl} className="btn btn-lg btn-outline-secondary post-list-item">
                            <Emoji value={EmojiValue.Answer} />
                            <span className="ml-1 answer">{activity.answerText}</span>
                            <small className="ml-1">
                                <span className="badge badge-info">{activity.childCount}</span>
                                <span className="sr-only">comments</span>
                            </small>
                        </Link>
                    </>
                );
            }
            case 'Comment': {
                const emojiValue = EmojiValue[activity.agreementRating as keyof typeof EmojiValue];
                return (
                    <>
                        <div>
                            <small>
                                New comment on:&#32;
                                <Link to={questionUrl}>
                                    <b>{activity.questionText}</b>
                                </Link>
                                &#32;»&#32;
                                <Link to={answerUrl} className="answer">
                                    <b>{activity.answerText}</b>
                                </Link>
                            </small>
                        </div>
                        <Link
                            to={commentUrl}
                            className="btn btn-lg btn-outline-secondary post-list-item"
                        >
                            {emojiValue && <Emoji value={emojiValue} />}
                            <span className="ml-1 comment">{activity.commentText}</span>
                            <small className="ml-1">
                                <span className="badge badge-info">{activity.childCount}</span>
                                <span className="sr-only">answers</span>
                            </small>
                        </Link>
                    </>
                );
            }
            default: return null;
        }
    }

    private handleScroll(event: UIEvent) {
        // Tested in Chrome, Edge, Firefox
        const scrollHeight = document.documentElement.scrollHeight;
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop; // Fallback for Edge
        const clientHeight = document.documentElement.clientHeight;

        // Trigger 100px before we hit the bottom - this also helps mobile Chrome, which seems to be ~60px short??
        if (scrollHeight - scrollTop - clientHeight < 100) {
            // Prevent triggering multiple times
            if (!this.props.loadingActivityList.loading &&
                this.props.loadingActivityList.loadedModel!.lastTimestamp > 0) {
                this.props.loadMoreActivityItems(this.props.loadingActivityList.loadedModel!.lastTimestamp);
            }
        }
    }
}

export default connect(
    // PRIVATE BETA: was just ` => (state.home)`
    (state: ApplicationState, ownProps: any): any => ({ ...state.home, loggedInUser: state.login.loggedInUser }),
    HomeStore.actionCreators,
)(Home);
