import * as React from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { QuestionFormModel } from '../../server-models';
import { ApplicationState } from '../../store';
import * as EditQuestionStore from '../../store/EditQuestion';
import { buildQuestionUrl } from '../../utils/route-utils';
import QuestionForm from '../QuestionForm/QuestionForm';
import Loading from '../shared/Loading';

type EditQuestionProps = EditQuestionStore.EditQuestionState
    & typeof EditQuestionStore.actionCreators
    & RouteComponentProps<{ tagSlug: string, questionId: string }>;

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
                    <Loading {...this.props.editQuestionForm} />
                    {initialState && (
                        <QuestionForm
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

    private handleSubmit(form: QuestionFormModel): void {
        this.props.submit(Number(this.props.match.params.questionId), form);
    }
}

export default connect(
    (state: ApplicationState, ownProps: any) => (state.editQuestion),
    EditQuestionStore.actionCreators,
)(EditQuestion);
