import * as React from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { AdminQuestionFormModel } from '../../server-models';
import { ApplicationState } from '../../store';
import { ActionStatus, getActionStatus } from '../../store/ActionStatuses';
import * as EditQuestionStore from '../../store/EditQuestion';
import { buildQuestionUrl } from '../../utils/route-utils';
import AdminQuestionForm from '../QuestionForm/AdminQuestionForm';
import ActionStatusDisplay from '../shared/ActionStatusDisplay';

type EditQuestionProps = EditQuestionStore.EditQuestionState
    & typeof EditQuestionStore.actionCreators
    & RouteComponentProps<{ tagSlug: string, questionId: string }>
    & {
    getQuestionStatus: ActionStatus,
};

class EditQuestion extends React.Component<EditQuestionProps, {}> {

    constructor(props: EditQuestionProps) {
        super(props);

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    public componentDidMount() {
        if (this.shouldGetQuestion()) {
            this.props.getQuestion(Number(this.props.match.params.questionId));
        }
    }

    public componentWillUnmount() {
        this.props.resetForm();
    }

    public render() {
        const { savedSlug } = this.props;
        const { initialState } = this.props.editQuestionForm;
        const successUrl = (savedSlug) ? buildQuestionUrl(this.props.match.params.questionId, savedSlug) : null;

        return (
            <div className="row">
                <div className="col-lg-6 offset-lg-3">
                    <h2>Edit Question</h2>
                    {successUrl && (
                        <div className="alert alert-success" role="alert">
                            Question updated, check it out: <Link to={successUrl}>{successUrl}</Link>
                        </div>
                    )}
                    <ActionStatusDisplay {...this.props.getQuestionStatus} />
                    {initialState && (
                        <AdminQuestionForm
                            initialState={initialState}
                            submit={this.handleSubmit}
                        />
                    )}
                </div>
            </div>
        );
    }

    private shouldGetQuestion(): boolean {
        return (!this.props.editQuestionForm.initialState);
    }

    private handleSubmit(form: AdminQuestionFormModel): void {
        this.props.submit(Number(this.props.match.params.questionId), form);
    }
}

export default connect(
    (state: ApplicationState, ownProps: any) => ({
        ...state.editQuestion,
        getQuestionStatus: getActionStatus(state, 'GET_QUESTION'),
    }),
    EditQuestionStore.actionCreators,
)(EditQuestion);
