import * as React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { LoggedInUserModel } from '../../server-models';
import { ApplicationState } from '../../store';
import * as TopicStore from '../../store/Topic';
import { LoggedInUserContext } from '../LoggedInUserContext';
import NewQuestion from '../QuestionForm/NewQuestion';
import TopicsList from '../Topics/List';
import Topic from './Topic';

type ContainerProps = TopicStore.ContainerState
    & typeof TopicStore.actionCreators
    & { loggedInUser: LoggedInUserModel | undefined }
    & RouteComponentProps<{ topicSlug: string }>;

class Container extends React.Component<ContainerProps, {}> {

    public componentWillMount() {
        // This will also run on server side render
        this.setUp(this.props);
    }

    public componentWillReceiveProps(nextProps: ContainerProps) {
        this.setUp(nextProps);
    }

    public render() {
        const { topic } = this.props;

        // REVIEW: Is there a better way to handle this?
        if (!topic) {
            return false;
        }

        const numberOfQuestionsInTopic = topic.model ? topic.model!.questions.length : 0;

        return (
            <LoggedInUserContext.Provider value={this.props.loggedInUser}>
                {this.renderHelmetTags()}

                <div className="row">
                    <div className="col-lg-3">
                        <TopicsList />
                    </div>
                    <div className="col-lg-6">
                        <div className="row">
                            <div className="col-md-12">
                                <Topic {...topic} />
                                {topic.model && numberOfQuestionsInTopic === 0 &&
                                    <>
                                        <h2>Start the conversation</h2>
                                        <NewQuestion topicValue={topic.model} />
                                    </>}
                            </div>
                        </div>
                    </div>
                </div>
            </LoggedInUserContext.Provider>
        );
    }

    private renderHelmetTags() {
        const { topic } = this.props;

        if (!topic.model) {
            return (
                <Helmet>
                    <title>⏳ 𝘓𝘰𝘢𝘥𝘪𝘯𝘨...</title>
                </Helmet>
            );
        }

        const pageTitle = `Topic: ${topic.model.name}`;
        const canonicalUrl = `https://www.honestq.com/topics/${topic.model.slug}`;

        const ogTitle = `Questions tagged ${topic.model.name}`;
        const numberOfQuestions =
            `${topic.model.questions.length} question${topic.model.questions.length > 1 ? 's' : ''}`;
        const ogDescription = `View ${numberOfQuestions} about ${topic.model.name}, ask your own, and join the debate.`;

        return (
            <Helmet>
                <title>{pageTitle}</title>
                <link rel="canonical" href={canonicalUrl} />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:title" content={ogTitle} />
                <meta property="og:description" content={ogDescription} />
                <meta property="og:image" content="https://www.honestq.com/android-chrome-256x256.png" />
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:site" content="@HonestQ_com" />
            </Helmet>
        );
    }

    private setUp(props: ContainerProps): void {
        if (!props.topic || (props.topic.slug !== props.match.params.topicSlug)) {
            props.getTopic(props.match.params.topicSlug);
        }
    }
}

export default connect(
    (state: ApplicationState, ownProps: any) => ({ ...state.topic, loggedInUser: state.login.loggedInUser }),
    TopicStore.actionCreators,
)(Container);
