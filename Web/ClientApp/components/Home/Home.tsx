import * as React from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { LoggedInUserModel, QuestionListItemModel, TopicListItemModel, TopicValueModel } from '../../server-models';
import { ApplicationState } from '../../store';
import * as HomeStore from '../../store/Home';
import { isUserInRole } from '../../utils';
import { LoggedInUserContext } from '../LoggedInUserContext';
import NewQuestion from '../QuestionForm/NewQuestion';
import Emoji, { EmojiValue } from '../shared/Emoji';
import Loading from '../shared/Loading';
import Modal from '../shared/Modal';
import Intro from './Intro';

type HomeProps = HomeStore.HomeState
    & typeof HomeStore.actionCreators
    & RouteComponentProps<{}>
    & { loggedInUser: LoggedInUserModel };

interface State {
    isIntroModalOpen: boolean;
}

class Home extends React.Component<HomeProps, State> {

    constructor(props: HomeProps) {
        super(props);

        this.state = { isIntroModalOpen: false };

        this.handleOpenIntro = this.handleOpenIntro.bind(this);
        this.handleCloseIntro = this.handleCloseIntro.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
    }

    public componentWillMount() {
        if (!this.props.loadingQuestionList.loadedModel) {
            this.props.loadMoreQuestionItems();
        }
        if (!this.props.loadingTopicsList.loadedModel) {
            this.props.getTopicsList();
        }
    }

    public componentDidMount() {
        window.addEventListener('scroll', this.handleScroll);
    }

    public componentDidUpdate(prevProps: HomeProps) {
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
        const topicsModel = this.props.loadingTopicsList.loadedModel;
        const { isIntroModalOpen } = this.state;

        return (
            <LoggedInUserContext.Provider value={this.props.loggedInUser}>
                {!this.props.loggedInUser &&
                    <div className="row">
                        <div className="col-md-12">
                            <div className="alert alert-success mt-3" role="alert">
                                <b>Welcome to HonestQ!</b> If you're new here, we suggest that you start by reading {}
                                <button
                                    type="button"
                                    className="btn btn-link btn-link-inline"
                                    onClick={this.handleOpenIntro}
                                >
                                    a quick intro
                                </button>.
                            </div>
                            <Modal
                                title="What is HonestQ?"
                                isOpen={isIntroModalOpen}
                                onRequestClose={this.handleCloseIntro}
                            >
                                <div className="modal-body"><Intro /></div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-success"
                                        onClick={this.handleCloseIntro}
                                    >
                                        Got it!
                                    </button>
                                </div>
                            </Modal>
                        </div>
                    </div>
                }
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
                    <div className="col-md-3 d-none d-lg-block">
                        <h2>Topics</h2>
                        <Loading {...this.props.loadingTopicsList} />
                        {topicsModel &&
                            <ul className="list-inline">
                                {topicsModel.topics.map((x: TopicListItemModel, i: number) =>
                                    <li key={i} className="mr-1 mb-1 list-inline-item">
                                        <Link
                                            to={`/topics/${x.slug}`}
                                            className="btn btn-sm btn-outline-secondary topic-list-item"
                                        >
                                            {x.name}
                                        </Link>
                                    </li>)}
                                <LoggedInUserContext.Consumer>
                                    {(user) => isUserInRole(user, 'Admin') &&
                                        <li className="list-inline-item">
                                            <Link to="/newtopic" className="btn btn-sm btn-primary">
                                                Suggest a new Topic
                                        </Link>
                                        </li>}
                                </LoggedInUserContext.Consumer>
                            </ul>
                        }
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

    private handleOpenIntro() {
        this.setState({ isIntroModalOpen: true });
    }

    private handleCloseIntro() {
        this.setState({ isIntroModalOpen: false });
    }
}

export default connect(
    (state: ApplicationState, ownProps: any): any => ({ ...state.home, loggedInUser: state.login.loggedInUser }),
    HomeStore.actionCreators,
)(Home);
