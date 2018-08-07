import * as React from 'react';
import { connect } from 'react-redux';
import { StatementFormModel } from '../../server-models';
import { ApplicationState } from '../../store';
import * as NewStatementStore from '../../store/NewStatement';
import Modal from '../shared/Modal';
import StatementForm from './StatementForm';

type Props = NewStatementStore.NewStatementState
    & typeof NewStatementStore.actionCreators
    & { topicSlug: string };

interface State {
    isModalOpen: boolean;
}

class NewStatement extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = { isModalOpen: false };

        this.handleOpen = this.handleOpen.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    public componentWillReceiveProps(nextProps: Props) {
        // This will close the modal when a statement has been successfully submitted
        if (!nextProps.statementForm!.submitted) {
            this.setState({ isModalOpen: false });
        }
    }

    public render() {
        const { statementForm, topicSlug } = this.props;
        const { isModalOpen } = this.state;

        return (
            <>
                <button
                    type="button"
                    className="btn btn-lg btn-primary btn-new-statement"
                    onClick={this.handleOpen}
                >
                    Add a statement
                </button>
                <Modal title="Add a statement" isOpen={isModalOpen} onRequestClose={this.handleClose}>
                    <StatementForm
                        {...statementForm}
                        topicSlug={topicSlug}
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

    private handleSubmit(form: StatementFormModel): void {
        this.props.submit(form);
    }
}

export default connect(
    (state: ApplicationState, ownProps: any) => (state.newStatement),
    NewStatementStore.actionCreators,
)(NewStatement);
