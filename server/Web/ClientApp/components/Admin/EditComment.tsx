import React from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { CommentFormModel } from '../../server-models';
import { ApplicationState } from '../../store';
import { ActionStatus, getActionStatus } from '../../store/ActionStatuses';
import * as EditCommentStore from '../../store/EditComment';
import { buildAnswerUrl } from '../../utils/route-utils';
import CommentForm from '../Comment/CommentForm';
import ActionStatusDisplay from '../shared/ActionStatusDisplay';

type EditCommentProps = EditCommentStore.EditCommentState
  & typeof EditCommentStore.actionCreators
  & RouteComponentProps<{ tagSlug: string, questionId: string, answerId: string, commentId: string }>
  & {
    getCommentStatus: ActionStatus,
  };

class EditComment extends React.Component<EditCommentProps, {}> {

  private readonly questionId: number;
  private readonly answerId: number;
  private readonly commentId: number;

  constructor(props: EditCommentProps) {
    super(props);

    this.questionId = Number(props.match.params.questionId);
    this.answerId = Number(props.match.params.answerId);
    this.commentId = Number(props.match.params.commentId);

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  public componentDidMount() {
    if (this.shouldGetComment()) {
      this.props.getComment(this.questionId, this.answerId, this.commentId);
    }
  }

  public componentWillUnmount() {
    this.props.resetForm();
  }

  public render() {
    const { savedSuccessfully } = this.props;
    const { initialState } = this.props.editCommentForm;
    const successUrl = (savedSuccessfully) ? buildAnswerUrl(this.questionId, 'todo', this.answerId, 'todo') : null;

    return (
      <div className="container">
        <div className="row">
          <div className="col-lg-6 offset-lg-3">
            <h2>Edit Comment</h2>
            {successUrl && (
              <div className="alert alert-success" role="alert">
                Comment updated, check it out: <Link to={successUrl}>{successUrl}</Link>
              </div>
            )}
            <ActionStatusDisplay {...this.props.getCommentStatus} />
            {initialState && (
              <CommentForm
                initialState={initialState}
                agreementRating={initialState.agreementRating}
                submit={this.handleSubmit}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  private shouldGetComment(): boolean {
    return (!this.props.editCommentForm.initialState);
  }

  private handleSubmit(form: CommentFormModel): void {
    this.props.submit(this.questionId, this.answerId, this.commentId, form);
  }
}

export default connect(
  (state: ApplicationState, ownProps: any) => ({
    ...state.editComment,
    getCommentStatus: getActionStatus(state, 'GET_COMMENT'),
  }),
  EditCommentStore.actionCreators,
)(EditComment);
