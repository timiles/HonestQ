import * as React from 'react';
import { connect } from 'react-redux';
import { LoggedInUserContext } from '../../LoggedInUserContext';
import { QuestionFormModel, TopicValueModel } from '../../server-models';
import { ApplicationState } from '../../store';
import * as NewQuestionStore from '../../store/NewQuestion';
import { isUserInRole } from '../../utils';
import Modal from '../shared/Modal';
import QuestionForm from './QuestionForm';

type Props = NewQuestionStore.NewQuestionState
    & typeof NewQuestionStore.actionCreators
    & { topicValue: TopicValueModel };

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

    public componentWillReceiveProps(nextProps: Props) {
        // This will close the modal when a Question has been successfully submitted
        if (!nextProps.questionForm!.submitted) {
            this.setState({ isModalOpen: false });
        }
    }

    public render() {
        const { questionForm, topicValue } = this.props;
        const { isModalOpen } = this.state;
        const initialTopicValues = !topicValue ? [] : [{ ...topicValue }];

        return (
            <>
                <button
                    type="button"
                    className="btn btn-lg btn-primary btn-block"
                    onClick={this.handleOpen}
                >
                    Add a question
                </button>
                <LoggedInUserContext.Consumer>
                    {(user) => isUserInRole(user, 'Admin') &&
                        <Modal title="Add a question" isOpen={isModalOpen} onRequestClose={this.handleClose}>
                            <QuestionForm
                                {...questionForm}
                                initialTopicValues={initialTopicValues}
                                isModal={true}
                                onCloseModalRequested={this.handleClose}
                                submit={this.handleSubmit}
                            />
                        </Modal>
                        ||
                        <Modal title="Coming soon..." isOpen={isModalOpen} onRequestClose={this.handleClose}>
                            <div className="modal-body">
                                <h3>We're not quite ready to accept new questions yet.</h3>
                                <p>HonestQ is still in its early stages. We will be adding new questions slowly,
                                    to ensure that we're building a quality system.</p>
                                <p>
                                    If you would like to submit your own honest question, please {}
                                    <a
                                        href="https://twitter.com/intent/tweet?text=.@HonestQ_com%20%23HonestQ"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        tweet @HonestQ_com
                                    </a>, or email <b>ask@HonestQ.com</b>.
                                    </p>
                                <p>Thanks!</p>
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
                        </Modal>
                    }
                </LoggedInUserContext.Consumer>
            </>
        );
    }

    private handleOpen() {
        this.setState({ isModalOpen: true });
    }

    private handleClose() {
        this.setState({ isModalOpen: false });
    }

    private handleSubmit(form: QuestionFormModel): void {
        this.props.submit(form);
    }
}

export default connect(
    (state: ApplicationState, ownProps: any) => (state.newQuestion),
    NewQuestionStore.actionCreators,
)(NewQuestion);
