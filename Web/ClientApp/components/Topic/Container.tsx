import * as React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { LoggedInUserModel } from '../../server-models';
import { ApplicationState } from '../../store';
import * as TopicStore from '../../store/Topic';
import { LoggedInUserContext } from '../LoggedInUserContext';
import BackToTopic from './BackToTopic';
import NewComment from './NewComment';
import NewStatement from './NewStatement';
import Statement from './Statement';
import Topic from './Topic';

type ContainerProps = TopicStore.ContainerState
    & typeof TopicStore.actionCreators
    & { loggedInUser: LoggedInUserModel | undefined }
    // Important: statementId cannot be number as would still be a string in the underlying JavaScript?
    & RouteComponentProps<{ topicSlug: string, statementId?: string }>;

class Container extends React.Component<ContainerProps, {}> {

    constructor(props: ContainerProps) {
        super(props);
    }

    public componentWillMount() {
        // This will also run on server side render
        if (this.shouldGetTopic()) {
            this.props.getTopic(this.props.match.params.topicSlug);
        }
        if (this.shouldGetStatement()) {
            this.props.getStatement(this.props.match.params.topicSlug, Number(this.props.match.params.statementId));
        }
    }

    public componentDidUpdate(prevProps: ContainerProps) {
        // This is run every time the route changes
        if (this.shouldGetStatement()) {
            this.props.getStatement(this.props.match.params.topicSlug, Number(this.props.match.params.statementId));
        }
    }

    public render() {
        const { topic, statement } = this.props;

        // REVIEW: Is there a better way to handle this?
        if (!topic) {
            return false;
        }

        const numberOfStatementsInTopic = topic.model ? topic.model!.statements.length : 0;

        const slideDurationMilliseconds = 500;

        return (
            <LoggedInUserContext.Provider value={this.props.loggedInUser}>
                {this.renderHelmetTags()}

                <div className="col-lg-6 offset-lg-3">
                    <div className="row">
                        <TransitionGroup component={undefined}>
                            {!this.props.match.params.statementId &&
                                <CSSTransition
                                    timeout={slideDurationMilliseconds}
                                    classNames="slide"
                                >
                                    <div className="col-md-12 slide slide-left">
                                        <Topic {...topic} />
                                        {topic.model && numberOfStatementsInTopic === 0 &&
                                            <>
                                                <h2>Start the conversation</h2>
                                                <NewStatement topicSlug={topic.slug} />
                                            </>}
                                    </div>
                                </CSSTransition>
                            }
                            {topic.model &&
                                (Number(this.props.match.params.statementId) > 0) &&
                                statement &&
                                statement.model &&
                                <CSSTransition
                                    timeout={slideDurationMilliseconds}
                                    classNames="slide"
                                >
                                    <div className="col-md-12 slide slide-right">
                                        <BackToTopic slug={topic.slug!} name={topic.model.name} />
                                        <Statement {...statement} topicSlug={topic.slug!}>
                                            <NewComment
                                                topicSlug={topic.slug!}
                                                statementId={statement!.statementId!}
                                                stance={statement!.model!.stance}
                                            />
                                        </Statement>
                                    </div>
                                </CSSTransition>
                            }
                            {topic.model && this.props.match.params.statementId === 'new_statement' &&
                                <CSSTransition
                                    timeout={slideDurationMilliseconds}
                                    classNames="slide"
                                >
                                    <div className="col-md-12 slide slide-right">
                                        <BackToTopic slug={topic.slug!} name={topic.model.name} />
                                        <h2>Add a statement</h2>
                                        <NewStatement topicSlug={topic.slug} />
                                    </div>
                                </CSSTransition>
                            }
                        </TransitionGroup>
                    </div>
                </div>
            </LoggedInUserContext.Provider>
        );
    }

    private renderHelmetTags() {
        const { topic, statement } = this.props;

        const pageTitleParts = ['POBS'];
        const canonicalUrlParts = ['https://pobs.local'];

        if (topic.model) {
            pageTitleParts.push(topic.model.name);
            canonicalUrlParts.push(topic.model.slug);

            if (this.props.match.params.statementId && statement && statement.model) {
                pageTitleParts.push('\u201C' + statement.model.text + '\u201D');
                canonicalUrlParts.push(statement.statementId!.toString());
                canonicalUrlParts.push(statement.model.slug);
            }
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

    private shouldGetStatement(): boolean {
        if (!this.props.match.params.statementId) {
            return false;
        }
        const statementIdAsNumber = Number(this.props.match.params.statementId);
        if (isNaN(statementIdAsNumber)) {
            return false;
        }
        if (!this.props.statement) {
            return true;
        }
        if (this.props.statement.loading) {
            return false;
        }
        return (this.props.statement.statementId !== statementIdAsNumber);
    }
}

export default connect(
    (state: ApplicationState, ownProps: any) => ({ ...state.topic, loggedInUser: state.login.loggedInUser }),
    TopicStore.actionCreators,
)(Container);
