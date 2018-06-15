import * as React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { CommentFormModel, StatementFormModel } from '../../server-models';
import { ApplicationState } from '../../store';
import * as TopicStore from '../../store/Topic';
import CommentForm from './../Topic/CommentForm';
import Statement from './../Topic/Statement';
import StatementForm from './../Topic/StatementForm';
import BackToTopic from './BackToTopic';
import Topic from './Topic';

type ContainerProps = TopicStore.ContainerState
    & typeof TopicStore.actionCreators
    & RouteComponentProps<{ topicSlug: string, statementId?: number }>;

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
            this.props.getStatement(this.props.match.params.topicSlug, this.props.match.params.statementId!);
        }
    }

    public componentDidUpdate(prevProps: ContainerProps) {
        // This is run every time the route changes
        if (this.shouldGetStatement()) {
            this.props.getStatement(this.props.match.params.topicSlug, this.props.match.params.statementId!);
        }
    }

    public render() {
        const { topic, statementForm, statement, commentForm } = this.props;

        // REVIEW: Is there a better way to handle this?
        if (!topic) {
            return false;
        }

        // REVIEW: Is there a better place to do these?
        if (topic.slug) {
            statementForm.submit = (form: StatementFormModel) =>
                this.props.submitStatement(topic.slug!, form);
        }
        if (commentForm && topic.slug && statement && statement!.statementId) {
            commentForm.submit = (form: CommentFormModel) =>
                this.props.submitComment(topic.slug!, statement.statementId!, form);
        }

        const numberOfStatementsInTopic = topic.model ? topic.model!.statements.length : 0;

        const slideDurationMilliseconds = 500;

        return (
            <>
                {this.renderHelmetTags()}

                <div className="col-md-6">
                    <div className="row">
                        <TransitionGroup component={undefined}>
                            {!this.props.match.params.statementId &&
                                <CSSTransition
                                    timeout={slideDurationMilliseconds}
                                    classNames="slide"
                                >
                                    <div className="slide slide-left vertical-scroll-container">
                                        <Topic {...topic}>
                                            <StatementForm
                                                {...statementForm}
                                                numberOfStatementsInTopic={numberOfStatementsInTopic}
                                            />
                                        </Topic>
                                    </div>
                                </CSSTransition>
                            }
                            {this.props.match.params.statementId && topic.model &&
                                <CSSTransition
                                    timeout={slideDurationMilliseconds}
                                    classNames="slide"
                                >
                                    <div className="slide slide-right vertical-scroll-container">
                                        <BackToTopic slug={topic.slug!} name={topic.model.name} />
                                        <Statement {...statement}>
                                            <CommentForm {...commentForm} />
                                        </Statement>
                                    </div>
                                </CSSTransition>
                            }
                        </TransitionGroup>
                    </div>
                </div>
            </>
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
        if (!this.props.statement) {
            return true;
        }
        if (this.props.statement.loading) {
            return false;
        }
        return (this.props.statement.statementId !== this.props.match.params.statementId);
    }
}

export default connect(
    (state: ApplicationState, ownProps: any) => (state.topic),
    TopicStore.actionCreators,
)(Container);
