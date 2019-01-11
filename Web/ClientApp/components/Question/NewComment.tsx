import * as React from 'react';
import { connect } from 'react-redux';
import { CommentFormModel } from '../../server-models';
import { ApplicationState } from '../../store';
import * as NewCommentStore from '../../store/NewComment';
import ButtonOrLogIn from '../shared/ButtonOrLogIn';
import Modal from '../shared/Modal';
import CommentForm from './CommentForm';

type Props = NewCommentStore.NewCommentState
    & typeof NewCommentStore.actionCreators
    & { questionId: number, answerId: number, parentCommentId?: number };

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
        const { commentForm, parentCommentId } = this.props;
        const { isModalOpen } = this.state;
        const headerText = parentCommentId ? 'Reply' : 'Add a new comment';
        const btnClass = parentCommentId ? 'btn btn-outline-secondary' : 'btn btn-lg btn-primary btn-block';

        return (
            <>
                <ButtonOrLogIn
                    type="button"
                    className={btnClass}
                    onClick={this.handleOpen}
                >
                    {headerText}
                </ButtonOrLogIn>
                <Modal title={headerText} isOpen={isModalOpen} onRequestClose={this.handleClose}>
                    <CommentForm
                        {...commentForm}
                        parentCommentId={parentCommentId}
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
        this.props.submit(this.props.questionId, this.props.answerId, form);
    }
}

export default connect(
    (state: ApplicationState, ownProps: any) => (state.newComment),
    NewCommentStore.actionCreators,
)(NewComment);
