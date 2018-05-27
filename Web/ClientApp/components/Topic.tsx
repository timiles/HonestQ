import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { CommentFormModel, StatementFormModel } from '../server-models';
import { ApplicationState } from '../store';
import * as TopicStore from '../store/Topic';
import CommentForm from './Topic/CommentForm';
import Statement from './Topic/Statement';
import StatementForm from './Topic/StatementForm';
import Topic from './Topic/Topic';

type ContainerProps = TopicStore.ContainerState
    & typeof TopicStore.actionCreators
    & RouteComponentProps<{ topicUrlFragment: string, statementId?: number }>;

class Container extends React.Component<ContainerProps, {}> {

    constructor(props: ContainerProps) {
        super(props);
    }

    public componentWillMount() {
        // This will also run on server side render
        if (this.shouldGetTopic()) {
            this.props.getTopic(this.props.match.params.topicUrlFragment);
        }
        if (this.shouldGetStatement()) {
            this.props.getStatement(this.props.match.params.topicUrlFragment, this.props.match.params.statementId!);
        }
    }

    public componentDidUpdate(prevProps: ContainerProps) {
        // This is run every time the route changes
        if (this.shouldGetStatement()) {
            this.props.getStatement(this.props.match.params.topicUrlFragment, this.props.match.params.statementId!);
        }
    }

    public render() {
        const { topic, statementForm, statement, commentForm } = this.props;
        // REVIEW: Is there a better place to do these?
        if (statementForm && !statementForm.submit) {
            statementForm.submit = (form: StatementFormModel) =>
                this.props.submitStatement(topic!.urlFragment!, form);
        }
        if (commentForm && !commentForm.submit) {
            commentForm.submit = (form: CommentFormModel) =>
                this.props.submitComment(topic!.urlFragment!, statement!.statementId!, form);
        }
        return (
            <div>
                <Topic {...topic}>
                    <StatementForm {...statementForm} />
                </Topic>
                <Statement {...statement}>
                    <CommentForm {...commentForm} />
                </Statement>
            </div>
        );
    }

    private shouldGetTopic(): boolean {
        if (!this.props.topic) {
            return true;
        }
        return (this.props.topic.urlFragment !== this.props.match.params.topicUrlFragment);
    }

    private shouldGetStatement(): boolean {
        if (!this.props.topic || !this.props.match.params.statementId) {
            return false;
        }
        if (!this.props.statement) {
            return true;
        }
        return (this.props.statement.statementId !== this.props.match.params.statementId);
    }
}

export default connect(
    (state: ApplicationState, ownProps: any) => (state.topic),
    TopicStore.actionCreators,
)(Container);
