import React from 'react';
import { Link } from 'react-router-dom';
import { LoggedInUserContext } from '../../LoggedInUserContext';
import { CommentModel } from '../../server-models';
import { isUserInRole } from '../../utils/auth-utils';
import AgreementRatingLabel from '../shared/AgreementRatingLabel';
import DateTimeTooltip from '../shared/DateTimeTooltip';
import EmbeddedContent from '../shared/EmbeddedContent';
import Source from '../shared/Source';
import UpvoteButton from '../shared/UpvoteButton';
import NewComment from './NewComment';
import NewCommentButtons from './NewCommentButtons';

type Props = CommentModel
  & {
    questionId: number,
    answerId: number,
    onUpvote: (on: boolean, answerId: number, commentId?: number) => void,
  };

interface State {
  replyWithAgreementRating?: string;
}

export default class Comment extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {};

    this.handleNewCommentButtonClick = this.handleNewCommentButtonClick.bind(this);
    this.handleNewCommentClose = this.handleNewCommentClose.bind(this);
  }

  public render(): any {
    const { questionId, answerId } = this.props;
    const { id, text, source, agreementRating, comments, upvotes, upvotedByMe } = this.props;
    const { postedAt, postedBy } = this.props;
    const { replyWithAgreementRating } = this.state;

    return (
      <>
        <div className="card light-dark-bg">
          <div className="card-body">
            <LoggedInUserContext.Consumer>
              {(user) => isUserInRole(user, 'Admin') &&
                <Link
                  to={`/admin/edit/questions/${questionId}/answers/${answerId}/comments/${id}`}
                  className="btn btn-danger float-right"
                >
                  Edit
                </Link>
              }
            </LoggedInUserContext.Consumer>
            <div className="mb-3">
              <AgreementRatingLabel value={agreementRating} />
              <span className="ml-2">
                {postedBy}, {}
              </span>
              <DateTimeTooltip dateTime={postedAt} />
            </div>
            {text &&
              <p className="post">{text}</p>
            }
            <Source value={source} />
            <EmbeddedContent value={source} />
            <div className="float-right btn-container">
              <UpvoteButton
                answerId={answerId}
                commentId={id}
                count={upvotes}
                isUpvotedByLoggedInUser={upvotedByMe}
                onUpvote={this.props.onUpvote}
                hideLabelOnMobile={true}
              />
            </div>
            <div>
              <label className="mr-2">Reply:</label>
              <NewCommentButtons
                className="btn btn-outline-secondary"
                hideLabelOnMobile={true}
                onClick={this.handleNewCommentButtonClick}
              />
            </div>
          </div>
        </div>
        {((comments && comments.length > 0) || replyWithAgreementRating) &&
          <ol className="list-unstyled list-comments-nested">
            {replyWithAgreementRating &&
              <li className="mb-2">
                <NewComment
                  questionId={questionId}
                  answerId={answerId}
                  agreementRating={replyWithAgreementRating}
                  parentCommentId={id}
                  onCancel={this.handleNewCommentClose}
                />
              </li>
            }
            {comments && comments.map((x: CommentModel) =>
              <li key={x.id}>
                <Comment
                  {...x}
                  questionId={questionId}
                  answerId={answerId}
                  onUpvote={this.props.onUpvote}
                />
              </li>)}
          </ol>}
      </>
    );
  }

  private handleNewCommentButtonClick(agreementRating: string) {
    this.setState({ replyWithAgreementRating: agreementRating });
  }

  private handleNewCommentClose() {
    this.setState({ replyWithAgreementRating: undefined });
  }
}
