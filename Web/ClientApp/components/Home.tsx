import * as React from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { LoggedInUserModel, QuestionListItemModel, TopicListItemModel } from '../server-models';
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

    public componentWillMount() {
        // PRIVATE BETA
        if (!this.props.loggedInUser) {
            return;
        }
        if (!this.props.loadingQuestionsList.loadedModel) {
            this.props.getQuestionsList();
        }
        if (!this.props.loadingTopicsList.loadedModel) {
            this.props.getTopicsList();
        }
    }

    public render() {
        const questionsModel = this.props.loadingQuestionsList.loadedModel;
        const topicsModel = this.props.loadingTopicsList.loadedModel;
        return (
            <div className="col-md-12">
                <h1>Recent questions</h1>
                <Loading {...this.props.loadingQuestionsList} />
                {questionsModel &&
                    <ul className="topics-list">
                        {questionsModel.questions.map((x: QuestionListItemModel, i: number) =>
                            <li key={`question_${i}`} className="mr-2 mb-2">
                                <Link
                                    to={`/questions/${x.id}/${x.slug}`}
                                    className="btn btn-lg btn-outline-secondary question-list-item"
                                >
                                    <Emoji value={EmojiValue.Question} />
                                    <span className="ml-1 question">{x.text}</span>
                                    <small className="ml-1">
                                        <span className="badge badge-info">{x.answersCount}</span>
                                        <span className="sr-only">answers</span>
                                    </small>
                                </Link>
                            </li>)}
                        <li>
                            <NewQuestion />
                        </li>
                    </ul>
                }
                <h2>Or browse by topic</h2>
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
        );
    }
}

export default connect(
    // PRIVATE BETA: was just ` => (state.home)`
    (state: ApplicationState, ownProps: any): any => ({ ...state.home, loggedInUser: state.login.loggedInUser }),
    HomeStore.actionCreators,
)(Home);
