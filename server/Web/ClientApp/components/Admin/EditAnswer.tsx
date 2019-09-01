import React from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { AnswerFormModel } from '../../server-models';
import { ApplicationState } from '../../store';
import { ActionStatus, getActionStatus } from '../../store/ActionStatuses';
import * as EditAnswerStore from '../../store/EditAnswer';
import { buildAnswerUrl } from '../../utils/route-utils';
import AnswerForm from '../Question/AnswerForm';
import ActionStatusDisplay from '../shared/ActionStatusDisplay';

type EditAnswerProps = EditAnswerStore.EditAnswerState
  & typeof EditAnswerStore.actionCreators
  & RouteComponentProps<{ tagSlug: string, questionId: string, answerId: string }>
  & {
    getAnswerStatus: ActionStatus,
  };

class EditAnswer extends React.Component<EditAnswerProps, {}> {

  private readonly questionId: number;
  private readonly answerId: number;

  constructor(props: EditAnswerProps) {
    super(props);

    this.questionId = Number(props.match.params.questionId);
    this.answerId = Number(props.match.params.answerId);

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  public componentDidMount() {
    if (this.shouldGetAnswer()) {
      this.props.getAnswer(this.questionId, this.answerId);
    }
  }

  public componentWillUnmount() {
    this.props.resetForm();
  }

  public render() {
    const { savedSuccessfully } = this.props;
    const { initialState } = this.props.editAnswerForm;
    const successUrl = (savedSuccessfully) ? buildAnswerUrl(this.questionId, 'todo', this.answerId, 'todo') : null;

    return (
      <div className="container">
        <div className="row">
          <div className="col-lg-6 offset-lg-3">
            <h2>Edit Answer</h2>
            {successUrl && (
              <div className="alert alert-success" role="alert">
                Answer updated, check it out: <Link to={successUrl}>{successUrl}</Link>
              </div>
            )}
            <ActionStatusDisplay {...this.props.getAnswerStatus} />
            {initialState && (
              <AnswerForm
                initialState={initialState}
                submit={this.handleSubmit}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  private shouldGetAnswer(): boolean {
    return (!this.props.editAnswerForm.initialState);
  }

  private handleSubmit(form: AnswerFormModel): void {
    this.props.submit(this.questionId, this.answerId, form);
  }
}

export default connect(
  (state: ApplicationState, ownProps: any) => ({
    ...state.editAnswer,
    getAnswerStatus: getActionStatus(state, 'GET_ANSWER'),
  }),
  EditAnswerStore.actionCreators,
)(EditAnswer);
