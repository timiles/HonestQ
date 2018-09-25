import * as React from 'react';
import { connect } from 'react-redux';
import { AnswerFormModel } from '../../server-models';
import { ApplicationState } from '../../store';
import * as NewAnswerStore from '../../store/NewAnswer';
import Modal from '../shared/Modal';
import AnswerForm from './AnswerForm';

type Props = NewAnswerStore.NewAnswerState
    & typeof NewAnswerStore.actionCreators
    & { questionId: number };

interface State {
    isModalOpen: boolean;
}

class NewAnswer extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = { isModalOpen: false };

        this.handleOpen = this.handleOpen.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    public componentWillReceiveProps(nextProps: Props) {
        // This will close the modal when a answer has been successfully submitted
        if (!nextProps.answerForm!.submitted) {
            this.setState({ isModalOpen: false });
        }
    }

    public render() {
        const { answerForm } = this.props;
        const { isModalOpen } = this.state;
        const headerText = 'Add an answer';

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
                    <AnswerForm
                        {...answerForm}
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

    private handleSubmit(form: AnswerFormModel): void {
        this.props.submit(this.props.questionId, form);
    }
}

export default connect(
    (state: ApplicationState, ownProps: any) => (state.newAnswer),
    NewAnswerStore.actionCreators,
)(NewAnswer);
