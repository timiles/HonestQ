import * as React from 'react';
import { connect } from 'react-redux';
import { QuestionFormModel, TagValueModel } from '../../server-models';
import { ApplicationState } from '../../store';
import * as NewQuestionStore from '../../store/NewQuestion';
import ButtonOrLogin from '../shared/ButtonOrLogIn';
import Modal from '../shared/Modal';
import QuestionForm from './QuestionForm';

type Props = NewQuestionStore.NewQuestionState
    & typeof NewQuestionStore.actionCreators
    & { tagValue: TagValueModel };

interface State {
    isModalOpen: boolean;
}

class NewQuestion extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = { isModalOpen: false };

        this.handleOpen = this.handleOpen.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    public componentDidUpdate(prevProps: Props) {
        if (prevProps.questionForm!.submitted && !this.props.awaitingApproval && !this.props.questionForm!.submitted) {
            // Close the modal when a Question has been successfully submitted
            this.setState({ isModalOpen: false });
        }
    }

    public render(): JSX.Element {
        const { questionForm, awaitingApproval, tagValue } = this.props;
        const { isModalOpen } = this.state;
        const initialTagValues = !tagValue ? [] : [{ ...tagValue }];

        return (
            <>
                <ButtonOrLogin
                    type="button"
                    className="btn btn-lg btn-primary shadow-lg"
                    onClick={this.handleOpen}
                >
                    Ask a question
                </ButtonOrLogin>
                <Modal title="Ask a question" isOpen={isModalOpen} onRequestClose={this.handleClose}>
                    {!awaitingApproval &&
                        <QuestionForm
                            {...questionForm}
                            initialTagValues={initialTagValues}
                            isModal={true}
                            onCloseModalRequested={this.handleClose}
                            submit={this.handleSubmit}
                        />
                        ||
                        <>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-12">
                                        <h3>Thank you for your question!</h3>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-9">
                                        <p>
                                            HonestQ is still in its early stages.
                                            We will be adding new questions slowly,
                                            to ensure that we're building a quality system.
                                        </p>
                                        <p>
                                            We will notify you by email when your question gets approved.
                                        </p>
                                    </div>
                                    <div className="col-md-3 text-center">
                                        <img
                                            className="img-fluid"
                                            src="/android-chrome-256x256.png"
                                            alt="The HonestQ logo: a white Q in a red circle."
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={this.handleClose}
                                >
                                    You're welcome
                                </button>
                            </div>
                        </>
                    }
                </Modal>
            </>
        );
    }

    private handleOpen() {
        this.setState({ isModalOpen: true });
    }

    private handleClose() {
        this.setState({ isModalOpen: false },
            () => {
                if (this.props.awaitingApproval) {
                    this.props.reset();
                }
            });
    }

    private handleSubmit(form: QuestionFormModel): void {
        this.props.submit(form);
    }
}

export default connect(
    (state: ApplicationState, ownProps: any) => (state.newQuestion),
    NewQuestionStore.actionCreators,
)(NewQuestion);
