import * as React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { LoggedInUserModel } from '../../server-models';
import { ApplicationState } from '../../store';
import * as TopicStore from '../../store/Topic';
import { LoggedInUserContext } from '../LoggedInUserContext';
import NewPop from './NewPop';
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

        const numberOfPopsInTopic = topic.model ? topic.model!.pops.length : 0;

        return (
            <LoggedInUserContext.Provider value={this.props.loggedInUser}>
                {this.renderHelmetTags()}

                <div className="col-lg-6 offset-lg-3">
                    <div className="row">
                        <div className="col-md-12">
                            <Topic {...topic} />
                            {topic.model && numberOfPopsInTopic === 0 &&
                                <>
                                    <h2>Start the conversation</h2>
                                    <NewPop topicValue={topic.model} />
                                </>}
                        </div>
                    </div>
                </div>
            </LoggedInUserContext.Provider>
        );
    }

    private renderHelmetTags() {
        const { topic } = this.props;

        const pageTitleParts = ['POBS'];
        const canonicalUrlParts = ['https://pobs.local'];

        if (topic.model) {
            pageTitleParts.push(topic.model.name);
            canonicalUrlParts.push(topic.model.slug);
        }

        const pageTitle = pageTitleParts.join(' » ');
        const canonicalUrl = canonicalUrlParts.join('/');

        return (
            <Helmet>
                <title>{pageTitle}</title>
                <link rel="canonical" href={canonicalUrl} />
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
