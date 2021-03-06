import React from 'react';
import { Link } from 'react-router-dom';
import { LoggedInUserContext } from '../../LoggedInUserContext';
import { AnswerModel, CommentModel } from '../../server-models';
import { isUserInRole } from '../../utils/auth-utils';
import Comment from '../Comment/Comment';
import NewComment from '../Comment/NewComment';
import NewCommentButton from '../Comment/NewCommentButton';
import CircleIcon, { CircleIconValue } from '../shared/CircleIcon';
import QuotationMarks from '../shared/QuotationMarks';
import UpvoteButton from '../shared/UpvoteButton';
import WatchControl from '../shared/WatchControl';

type Props = AnswerModel
  & {
    questionId: number,
    onUpvote: (on: boolean, answerId: number, commentId?: number) => void,
    onWatch: (on: boolean, answerId: number) => void,
  };

interface State {
  showNewComment: boolean;
}

export default class Answer extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = { showNewComment: false };

    this.handleReaction = this.handleReaction.bind(this);
    this.handleWatch = this.handleWatch.bind(this);
    this.handleNewCommentButtonClick = this.handleNewCommentButtonClick.bind(this);
    this.handleNewCommentClose = this.handleNewCommentClose.bind(this);
  }

  public componentDidMount() {
    window.scrollTo(0, 0);
  }

  public render() {
    const { questionId, id, text, comments } = this.props;
    const { upvotes, upvotedByMe, watching } = this.props;
    const { showNewComment } = this.state;

    return (
      <div>
        <div className="card light-dark-bg mt-4">
          <CircleIcon value={CircleIconValue.Answer} />
          <div className="card-body px-sm-5">
            <LoggedInUserContext.Consumer>
              {(user) => isUserInRole(user, 'Admin') &&
                <Link
                  to={`/admin/edit/questions/${questionId}/answers/${id}`}
                  className="btn btn-danger float-right"
                >
                  Edit
                </Link>
              }
            </LoggedInUserContext.Consumer>
            <h5>
              <QuotationMarks width={20}>
                <span className="mx-2 post">{text}</span>
              </QuotationMarks>
            </h5>
            <div>
              <div className="float-right btn-container">
                <WatchControl
                  onWatch={this.handleWatch}
                  watching={watching}
                />
                <UpvoteButton
                  answerId={id}
                  count={upvotes}
                  isUpvotedByLoggedInUser={upvotedByMe}
                  onUpvote={this.handleReaction}
                />
              </div>
            </div>
          </div>
        </div>
        <hr />
        <div className="mb-3 clearfix">
          <div className="float-right">
            <NewCommentButton
              className="btn btn-lg btn-primary shadow-lg"
              onClick={this.handleNewCommentButtonClick}
            />
          </div>
        </div>
        <ol className="list-unstyled mb-3">
          {showNewComment &&
            <li className="mb-2">
              <NewComment
                questionId={questionId}
                answerId={id}
                onCancel={this.handleNewCommentClose}
              />
            </li>
          }
          {comments.map((x: CommentModel) =>
            <li key={x.id} className="mb-2">
              <Comment
                {...x}
                questionId={questionId}
                answerId={id}
                onUpvote={this.handleReaction}
              />
            </li>)}
        </ol>
      </div>
    );
  }

  private handleReaction(on: boolean, answerId: number, commentId?: number): void {
    this.props.onUpvote(on, answerId, commentId);
  }

  private handleWatch(on: boolean): void {
    this.props.onWatch(on, this.props.id);
  }

  private handleNewCommentButtonClick() {
    this.setState({ showNewComment: true });
  }

  private handleNewCommentClose() {
    this.setState({ showNewComment: false });
  }
}
