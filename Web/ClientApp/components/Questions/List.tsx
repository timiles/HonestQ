import * as React from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { LoggedInUserModel, QuestionListItemModel, TopicValueModel } from '../../server-models';
import { ApplicationState } from '../../store';
import * as QuestionsStore from '../../store/Questions';
import { LoggedInUserContext } from '../LoggedInUserContext';
import NewQuestion from '../QuestionForm/NewQuestion';
import Emoji, { EmojiValue } from '../shared/Emoji';
import Loading from '../shared/Loading';

type Props = QuestionsStore.ListState
    & typeof QuestionsStore.actionCreators
    & RouteComponentProps<{}>
    & { loggedInUser: LoggedInUserModel };

class QuestionList extends React.Component<Props> {

    constructor(props: Props) {
        super(props);

        this.handleScroll = this.handleScroll.bind(this);
    }

    public componentWillMount() {
        if (!this.props.loadingQuestionList.loadedModel) {
            this.props.loadMoreQuestionItems();
        }
    }

    public componentDidMount() {
        window.addEventListener('scroll', this.handleScroll);
    }

    public componentDidUpdate(prevProps: Props) {
        if (this.props.loadingQuestionList.loadedModel &&
            this.props.loadingQuestionList.loadedModel.lastTimestamp === 0 &&
            prevProps.loadingQuestionList.loadedModel &&
            prevProps.loadingQuestionList.loadedModel.lastTimestamp > 0) {
            // Reached the end of the list! Eat your heart out Twitter.
            window.removeEventListener('scroll', this.handleScroll);
        }
    }

    public componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
    }

    public render() {
        const questionList = this.props.loadingQuestionList.loadedModel;

        return (
            <LoggedInUserContext.Provider value={this.props.loggedInUser}>
                <div className="row">
                    <div className="col-md-12 col-lg-6 offset-lg-3">
                        <h1>Recent questions</h1>
                        {questionList &&
                            <ul className="list-unstyled">
                                <li className="mb-2">
                                    <NewQuestion />
                                </li>
                                {questionList.questions.map((x: QuestionListItemModel, i: number) =>
                                    <li key={i} className="mb-2">
                                        {this.renderQuestion(x)}
                                    </li>)}
                                {questionList.lastTimestamp === 0 && questionList.questions.length > 40 &&
                                    <li>
                                        That's all, folks!
                                </li>
                                }
                            </ul>
                        }
                        <Loading {...this.props.loadingQuestionList} />
                    </div>
                </div>
            </LoggedInUserContext.Provider>
        );
    }

    private renderQuestion(question: QuestionListItemModel) {
        return (
            <>
                <div>
                    <small>
                        New question
                        {question.topics.length > 0 &&
                            <>{} in: {}
                                <ul className="list-inline list-comma-separated">
                                    {question.topics.map((x: TopicValueModel, i: number) =>
                                        <li key={i} className="list-inline-item">
                                            <Link to={`/topics/${x.slug}`}>
                                                <b>{x.name}</b>
                                            </Link>
                                        </li>)}
                                </ul>
                            </>
                        }
                    </small>
                </div>
                <Link
                    to={`/questions/${question.id}/${question.slug}`}
                    className="btn btn-lg btn-outline-secondary post-list-item"
                >
                    <Emoji value={EmojiValue.Question} />
                    <span className="ml-1 question">{question.text}</span>
                    <small className="ml-1">
                        <span className="badge badge-info">{question.answersCount}</span>
                        <span className="sr-only">answers</span>
                    </small>
                </Link>
            </>
        );
    }

    private handleScroll(event: UIEvent) {
        if (!document.documentElement) {
            return;
        }

        // Tested in Chrome, Edge, Firefox
        const scrollHeight = document.documentElement.scrollHeight;
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop; // Fallback for Edge
        const clientHeight = document.documentElement.clientHeight;

        // Trigger 100px before we hit the bottom - this also helps mobile Chrome, which seems to be ~60px short??
        if (scrollHeight - scrollTop - clientHeight < 100) {
            // Prevent triggering multiple times
            if (!this.props.loadingQuestionList.loading &&
                this.props.loadingQuestionList.loadedModel!.lastTimestamp > 0) {
                this.props.loadMoreQuestionItems(this.props.loadingQuestionList.loadedModel!.lastTimestamp);
            }
        }
    }
}

export default connect(
    (state: ApplicationState, ownProps: any): any => ({ ...state.questions, loggedInUser: state.login.loggedInUser }),
    QuestionsStore.actionCreators,
)(QuestionList);
