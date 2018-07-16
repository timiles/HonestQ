import * as React from 'react';
import { connect } from 'react-redux';
import { CommentFormModel } from '../../server-models';
import { ApplicationState } from '../../store';
import * as NewCommentStore from '../../store/NewComment';
import Modal from '../shared/Modal';
import CommentForm from './CommentForm';

type Props = NewCommentStore.NewCommentState
    & typeof NewCommentStore.actionCreators
    & { topicSlug: string, statementId: number, stance: string };

interface State {
    isModalOpen: boolean;
}

class NewComment extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = { isModalOpen: false };

        this.handleOpen = this.handleOpen.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    public componentWillReceiveProps(nextProps: Props) {
        // This will close the modal when a comment has been successfully submitted
        if (!nextProps.commentForm!.submitted) {
            this.setState({ isModalOpen: false });
        }
    }

    public render() {
        const { commentForm, stance } = this.props;
        const { isModalOpen } = this.state;

        if (stance === 'ProveIt') {
            return (
                <CommentForm {...commentForm} isSourceOnly={true} submit={this.handleSubmit} />
            );
        }

        return (
            <>
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={this.handleOpen}
                >
                    Add a comment
                </button>
                <Modal title="Add a comment" isOpen={isModalOpen} onRequestClose={this.handleClose}>
                    <CommentForm
                        {...commentForm}
                        isModal={true}
                        onCloseModalRequested={this.handleClose}
                        submit={this.handleSubmit}
                    />
                </Modal>
            </>
        );
    }

    private handleOpen() {
        this.setState({ isModalOpen: true });
    }

    private handleClose() {
        this.setState({ isModalOpen: false });
    }

    private handleSubmit(form: CommentFormModel): void {
        this.props.submit(this.props.topicSlug, this.props.statementId, form);
    }
}

export default connect(
    (state: ApplicationState, ownProps: any) => (state.newComment),
    NewCommentStore.actionCreators,
)(NewComment);
