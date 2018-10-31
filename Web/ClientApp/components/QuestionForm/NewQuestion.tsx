import * as React from 'react';
import { connect } from 'react-redux';
import { QuestionFormModel, TopicValueModel } from '../../server-models';
import { ApplicationState } from '../../store';
import * as NewQuestionStore from '../../store/NewQuestion';
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
                    className="btn btn-lg btn-primary btn-new-post"
                    onClick={this.handleOpen}
                >
                    Ask a question
                </button>
                <Modal title="Ask a question" isOpen={isModalOpen} onRequestClose={this.handleClose}>
                    <QuestionForm
                        {...questionForm}
                        initialTopicValues={initialTopicValues}
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

    private handleSubmit(form: QuestionFormModel): void {
        this.props.submit(form);
    }
}

export default connect(
    (state: ApplicationState, ownProps: any) => (state.newQuestion),
    NewQuestionStore.actionCreators,
)(NewQuestion);