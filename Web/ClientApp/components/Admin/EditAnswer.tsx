import * as React from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { AnswerFormModel } from '../../server-models';
import { ApplicationState } from '../../store';
import * as EditAnswerStore from '../../store/EditAnswer';
import AnswerForm from '../Question/AnswerForm';
import Loading from '../shared/Loading';

type EditAnswerProps = EditAnswerStore.EditAnswerState
    & typeof EditAnswerStore.actionCreators
    & RouteComponentProps<{ topicSlug: string, questionId: string, answerId: string }>;

class EditAnswer extends React.Component<EditAnswerProps, {}> {

    constructor(props: EditAnswerProps) {
        super(props);

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    public componentDidMount() {
        if (this.shouldGetAnswer()) {
            this.props.getAnswer(Number(this.props.match.params.questionId), Number(this.props.match.params.answerId));
        }
    }

    public render() {
        const { savedSuccessfully } = this.props;
        const { initialState } = this.props.editAnswerForm;
        const successUrl = (savedSuccessfully) ? `/questions/${this.props.match.params.questionId}/todo` : null;

        return (
            <div className="row">
                <div className="col-lg-6 offset-lg-3">
                    <h2>Edit Answer</h2>
                    {successUrl && (
                        <div className="alert alert-success" role="alert">
                            Answer updated, check it out: <Link to={successUrl}>{successUrl}</Link>
                        </div>
                    )}
                    <Loading {...this.props.editAnswerForm} />
                    {initialState && (
                        <AnswerForm
                            initialState={initialState}
                            submit={this.handleSubmit}
                        />
                    )}
                </div>
            </div>
        );
    }

    private shouldGetAnswer(): boolean {
        return (!this.props.editAnswerForm.initialState);
    }

    private handleSubmit(form: AnswerFormModel): void {
        this.props.submit(Number(this.props.match.params.questionId), Number(this.props.match.params.answerId), form);
    }
}

export default connect(
    (state: ApplicationState, ownProps: any) => (state.editAnswer),
    EditAnswerStore.actionCreators,
)(EditAnswer);
