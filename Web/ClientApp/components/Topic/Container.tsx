import * as React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { LoggedInUserModel } from '../../server-models';
import { ApplicationState } from '../../store';
import * as TopicStore from '../../store/Topic';
import { LoggedInUserContext } from '../LoggedInUserContext';
import NewQuestion from './NewQuestion';
import Topic from './Topic';

type ContainerProps = TopicStore.ContainerState
    & typeof TopicStore.actionCreators
    & { loggedInUser: LoggedInUserModel | undefined }
    & RouteComponentProps<{ topicSlug: string }>;

class Container extends React.Component<ContainerProps, {}> {

    constructor(props: ContainerProps) {
        super(props);
    }

    public componentWillMount() {
        // This will also run on server side render
        if (this.shouldGetTopic()) {
            this.props.getTopic(this.props.match.params.topicSlug);
        }
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

                <div className="col-lg-6 offset-lg-3">
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

        return (
            <Helmet>
                <title>Topic: {topic.model.name}</title>
                <link rel="canonical" href={`https://honestq.com/topics/${topic.model.slug}`} />
            </Helmet>
        );
    }

    private shouldGetTopic(): boolean {
        if (!this.props.topic) {
            return true;
        }
        return (this.props.topic.slug !== this.props.match.params.topicSlug);
    }
}

export default connect(
    (state: ApplicationState, ownProps: any) => ({ ...state.topic, loggedInUser: state.login.loggedInUser }),
    TopicStore.actionCreators,
)(Container);
