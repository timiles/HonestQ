import * as React from 'react';
import { connect } from 'react-redux';
import { CommentFormModel } from '../../server-models';
import { ApplicationState } from '../../store';
import * as NewCommentStore from '../../store/NewComment';
import ButtonOrLogIn from '../shared/ButtonOrLogIn';
import Modal from '../shared/Modal';
import Icon, { IconValue } from '../shared/SvgIcons/Icon';
import CommentForm from './CommentForm';

interface OwnProps {
    questionId: number;
    answerId: number;
    replyingToText: string;
    parentCommentId?: number;
}
type Props = NewCommentStore.NewCommentState
    & typeof NewCommentStore.actionCreators
    & OwnProps;

interface State {
    isModalOpen: boolean;
    agreementRating?: string;
}

class NewComment extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = { isModalOpen: false };

        this.handleOpenAgree = this.handleOpenAgree.bind(this);
        this.handleOpenDisagree = this.handleOpenDisagree.bind(this);
        this.handleOpenNeutral = this.handleOpenNeutral.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    public componentDidUpdate(prevProps: Props) {
        if (prevProps.commentForm!.submitted && !this.props.commentForm!.submitted) {
            // Close the modal when a Comment has been successfully submitted
            this.setState({ isModalOpen: false });
        }
    }

    public render() {
        const { commentForm, replyingToText, parentCommentId } = this.props;
        const { isModalOpen, agreementRating } = this.state;
        const headerText = parentCommentId ? 'Reply' : 'Add a new comment';
        const btnClass = parentCommentId ? 'btn btn-outline-secondary' : 'btn btn-lg btn-primary shadow-lg';

        return (
            <>
                <ButtonOrLogIn
                    type="button"
                    className={`${btnClass} mr-2`}
                    onClick={this.handleOpenAgree}
                >
                    <Icon value={IconValue.Agree} />
                    Agree
                </ButtonOrLogIn>
                <ButtonOrLogIn
                    type="button"
                    className={`${btnClass} mr-2`}
                    onClick={this.handleOpenDisagree}
                >
                    <Icon value={IconValue.Disagree} />
                    Disagree
                </ButtonOrLogIn>
                <ButtonOrLogIn
                    type="button"
                    className={btnClass}
                    onClick={this.handleOpenNeutral}
                >
                    <Icon value={IconValue.Neutral} />
                    Neutral
                </ButtonOrLogIn>
                <Modal title={headerText} isOpen={isModalOpen} onRequestClose={this.handleClose}>
                    <CommentForm
                        {...commentForm}
                        agreementRating={agreementRating}
                        replyingToText={replyingToText}
                        parentCommentId={parentCommentId}
                        isModal={true}
                        onCloseModalRequested={this.handleClose}
                        submit={this.handleSubmit}
                    />
                </Modal>
            </>
        );
    }

    private handleOpenAgree() {
        this.setState({ agreementRating: 'Agree', isModalOpen: true });
    }

    private handleOpenDisagree() {
        this.setState({ agreementRating: 'Disagree', isModalOpen: true });
    }

    private handleOpenNeutral() {
        this.setState({ agreementRating: 'Neutral', isModalOpen: true });
    }

    private handleClose() {
        this.setState({ isModalOpen: false });
    }

    private handleSubmit(form: CommentFormModel): void {
        this.props.submit(this.props.questionId, this.props.answerId, form);
    }
}

export default connect(
    (state: ApplicationState, ownProps: OwnProps) => (state.newComment),
    NewCommentStore.actionCreators,
)(NewComment);
