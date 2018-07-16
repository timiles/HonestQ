import * as React from 'react';
import { connect } from 'react-redux';
import { StatementFormModel } from '../../server-models';
import { ApplicationState } from '../../store';
import * as NewStatementStore from '../../store/NewStatement';
import StatementForm from './StatementForm';

type Props = NewStatementStore.NewStatementState
    & typeof NewStatementStore.actionCreators
    & { topicSlug: string };

class NewStatement extends React.Component<Props, {}> {

    constructor(props: Props) {
        super(props);

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    public render() {
        const { statementForm } = this.props;

        return (
            <StatementForm {...statementForm} submit={this.handleSubmit} />
        );
    }

    private handleSubmit(form: StatementFormModel): void {
        this.props.submit(this.props.topicSlug, form);
    }
}

export default connect(
    (state: ApplicationState, ownProps: any) => (state.newStatement),
    NewStatementStore.actionCreators,
)(NewStatement);
