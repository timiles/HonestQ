import * as React from 'react';
import { connect } from 'react-redux';
import { CommentFormModel } from '../../server-models';
import { ApplicationState } from '../../store';
import * as NewCommentStore from '../../store/NewComment';
import CommentForm from './CommentForm';

type Props = NewCommentStore.NewCommentState
    & typeof NewCommentStore.actionCreators
    & { topicSlug: string, statementId: number, stance: string };

class NewComment extends React.Component<Props, {}> {

    constructor(props: Props) {
        super(props);

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    public render() {
        const { commentForm, stance } = this.props;

        return (
            <CommentForm {...commentForm} stance={stance} submit={this.handleSubmit} />
        );
    }

    private handleSubmit(form: CommentFormModel): void {
        this.props.submit(this.props.topicSlug, this.props.statementId, form);
    }
}

export default connect(
    (state: ApplicationState, ownProps: any) => (state.newComment),
    NewCommentStore.actionCreators,
)(NewComment);
