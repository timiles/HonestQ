import * as React from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { StatementFormModel } from '../../server-models';
import { ApplicationState } from '../../store';
import * as EditStatementStore from '../../store/EditStatement';
import Loading from '../shared/Loading';
import StatementForm from '../Topic/StatementForm';

type EditStatementProps = EditStatementStore.EditStatementState
    & typeof EditStatementStore.actionCreators
    & RouteComponentProps<{ topicSlug: string, statementId: number }>;

class EditStatement extends React.Component<EditStatementProps, {}> {

    constructor(props: EditStatementProps) {
        super(props);

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    public componentDidMount() {
        if (this.shouldGetStatement()) {
            this.props.getStatement(this.props.match.params.statementId);
        }
    }

    public render() {
        const { successfullySaved } = this.props;
        const { loadedModel } = this.props.statementModel;
        const successUrl = (successfullySaved && loadedModel)
            ? `/statements/${this.props.match.params.statementId}/${loadedModel.slug}`
            : null;

        let statementFormModel: StatementFormModel | null;
        if (loadedModel) {
            statementFormModel = {
                text: loadedModel.text,
                source: loadedModel.source,
                type: loadedModel.type,
                topicSlugs: loadedModel.topics.map((x) => x.slug),
            };
        }

        return (
            <div className="col-lg-6 offset-lg-3">
                <h2>Edit Statement</h2>
                {successUrl && (
                    <div className="alert alert-success" role="alert">
                        Statement updated, check it out: <Link to={successUrl}>{successUrl}</Link>
                    </div>
                )}
                <Loading {...this.props.statementModel} />
                {loadedModel && (
                    <StatementForm
                        initialState={statementFormModel!}
                        initialTopicValues={loadedModel.topics}
                        hideInfoBox={true}
                        submit={this.handleSubmit}
                    />
                )}
            </div>
        );
    }

    private shouldGetStatement(): boolean {
        if (!this.props.statementModel.loadedModel) {
            return true;
        }
        return (this.props.statementModel.id !== this.props.match.params.statementId.toString());
    }

    private handleSubmit(form: StatementFormModel): void {
        this.props.submit(this.props.match.params.statementId, form);
    }
}

export default connect(
    (state: ApplicationState, ownProps: any) => (state.editStatement),
    EditStatementStore.actionCreators,
)(EditStatement);
