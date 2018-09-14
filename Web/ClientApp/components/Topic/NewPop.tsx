import * as React from 'react';
import { connect } from 'react-redux';
import { PopFormModel, TopicValueModel } from '../../server-models';
import { ApplicationState } from '../../store';
import * as NewPopStore from '../../store/NewPop';
import Modal from '../shared/Modal';
import PopForm from './PopForm';

type Props = NewPopStore.NewPopState
    & typeof NewPopStore.actionCreators
    & { popType: string, topicValue: TopicValueModel };

interface State {
    isModalOpen: boolean;
}

class NewPop extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = { isModalOpen: false };

        this.handleOpen = this.handleOpen.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    public componentWillReceiveProps(nextProps: Props) {
        // This will close the modal when a pop has been successfully submitted
        if (!nextProps.popForm!.submitted) {
            this.setState({ isModalOpen: false });
        }
    }

    public render() {
        const { popForm, popType, topicValue } = this.props;
        const { isModalOpen } = this.state;
        const buttonText = (popType === 'Question') ? 'Ask a question' : 'Got something new to say?';
        const modalTitle = (popType === 'Question') ? 'Ask a question' : 'Say something';

        const initialTopicValues = !topicValue ? [] :
            (popType === 'Question') ? [{ ...topicValue }] :
                [{ ...topicValue, stance: 'Neutral' }];

        return (
            <>
                <button
                    type="button"
                    className="btn btn-lg btn-primary btn-new-pop"
                    onClick={this.handleOpen}
                >
                    {buttonText}
                </button>
                <Modal title={modalTitle} isOpen={isModalOpen} onRequestClose={this.handleClose}>
                    <PopForm
                        {...popForm}
                        initialTopicValues={initialTopicValues}
                        isModal={true}
                        onCloseModalRequested={this.handleClose}
                        fixedType={popType}
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

    private handleSubmit(form: PopFormModel): void {
        this.props.submit(form);
    }
}

export default connect(
    (state: ApplicationState, ownProps: any) => (state.newPop),
    NewPopStore.actionCreators,
)(NewPop);
