import * as React from 'react';
import { connect } from 'react-redux';
import { CommentFormModel } from '../../server-models';
import { ApplicationState } from '../../store';
import * as NewCommentStore from '../../store/NewComment';
import Modal from '../shared/Modal';
import CommentForm from './CommentForm';

type Props = NewCommentStore.NewCommentState
    & typeof NewCommentStore.actionCreators
    & { questionId: number, type: string, parentCommentId: number | null };

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
        const { commentForm, type, parentCommentId } = this.props;
        const { isModalOpen } = this.state;
        const headerText =
            parentCommentId ? 'Reply' :
                (type === 'Question') ? 'Add an answer' :
                    'Add a new comment';

        if (type === 'RequestForProof') {
            return (
                <CommentForm
                    {...commentForm}
                    parentCommentId={parentCommentId}
                    type={type}
                    submit={this.handleSubmit}
                />
            );
        }

        return (
            <>
                <button
                    type="button"
                    className="btn btn-link"
                    onClick={this.handleOpen}
                >
                    {headerText}
                </button>
                <Modal title={headerText} isOpen={isModalOpen} onRequestClose={this.handleClose}>
                    <CommentForm
                        {...commentForm}
                        parentCommentId={parentCommentId}
                        type={type}
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
        this.props.submit(this.props.questionId, form);
    }
}

export default connect(
    (state: ApplicationState, ownProps: any) => (state.newComment),
    NewCommentStore.actionCreators,
)(NewComment);
