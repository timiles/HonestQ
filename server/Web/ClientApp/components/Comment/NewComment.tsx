import React from 'react';
import { connect } from 'react-redux';
import { CommentFormModel } from '../../server-models';
import { ApplicationState } from '../../store';
import * as NewCommentStore from '../../store/NewComment';
import CommentForm from './CommentForm';

interface OwnProps {
  questionId: number;
  answerId: number;
  parentCommentId?: number;
  agreementRating: string;
  onCancel?: () => void;
}
type Props = NewCommentStore.NewCommentState
  & typeof NewCommentStore.actionCreators
  & OwnProps;

class NewComment extends React.Component<Props> {

  constructor(props: Props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  public componentDidUpdate(prevProps: Props) {
    const { onCancel } = this.props;
    if (onCancel && prevProps.commentForm!.submitted && !this.props.commentForm!.submitted) {
      // Close when a Comment has been successfully submitted
      onCancel();
    }
  }

  public render() {
    const { commentForm, parentCommentId, agreementRating, onCancel } = this.props;

    return (
      <CommentForm
        {...commentForm}
        agreementRating={agreementRating}
        parentCommentId={parentCommentId}
        onCancel={onCancel}
        submit={this.handleSubmit}
      />
    );
  }

  private handleSubmit(form: CommentFormModel): void {
    this.props.submit(this.props.questionId, this.props.answerId, form);
  }
}

export default connect(
  (state: ApplicationState, ownProps: OwnProps) => (state.newComment),
  NewCommentStore.actionCreators,
)(NewComment);
