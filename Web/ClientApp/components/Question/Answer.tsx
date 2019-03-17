import * as React from 'react';
import { Link } from 'react-router-dom';
import { LoggedInUserContext } from '../../LoggedInUserContext';
import { AnswerModel, CommentModel } from '../../server-models';
import { isUserInRole } from '../../utils/auth-utils';
import DateTimeTooltip from '../shared/DateTimeTooltip';
import EmbeddedContent from '../shared/EmbeddedContent';
import Source from '../shared/Source';
import WatchControl from '../shared/WatchControl';
import Comment from './Comment';
import NewComment from './NewComment';
import UpvoteButton from './UpvoteButton';

type Props = AnswerModel
    & {
        questionId: number,
        onReaction: (reactionType: string, on: boolean, answerId: number, commentId?: number) => void,
        onWatch: (on: boolean, answerId: number, commentId?: number) => void,
    };

export default class Answer extends React.Component<Props, {}> {

    constructor(props: Props) {
        super(props);

        this.handleReaction = this.handleReaction.bind(this);
        this.handleWatch = this.handleWatch.bind(this);
    }

    public render() {
        const { questionId, id, text, source, postedBy, postedAt, comments } = this.props;
        const { reactionCounts, myReactions, watching } = this.props;

        return (
            <div>
                <div className="card mt-4">
                    <div className="circle-tag circle-tag-A" />
                    <div className="card-body">
                        <blockquote className="blockquote">
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
                            <h4>
                                <span className="ml-1 post">{text}</span>
                            </h4>
                            <footer className="blockquote-footer">
                                {postedBy}, <DateTimeTooltip dateTime={postedAt} />
                            </footer>
                        </blockquote>
                        <Source value={source} />
                        <EmbeddedContent value={source} />
                        <div>
                            <div className="float-right btn-container">
                                <WatchControl
                                    onWatch={this.handleWatch}
                                    watching={watching}
                                />
                                <UpvoteButton
                                    answerId={id}
                                    count={reactionCounts[UpvoteButton.ReactionType]}
                                    isUpvotedByLoggedInUser={myReactions &&
                                        myReactions.indexOf(UpvoteButton.ReactionType) >= 0}
                                    onReaction={this.handleReaction}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <hr />
                <div className="mb-3">
                    <NewComment
                        questionId={questionId}
                        answerId={id}
                        replyingToText={text}
                    />
                </div>
                <ol className="list-unstyled mb-3">
                    {comments.map((x: CommentModel, i: number) =>
                        <li key={i} className="mb-2">
                            <Comment
                                {...x}
                                questionId={questionId}
                                answerId={id}
                                onReaction={this.handleReaction}
                                onWatch={this.handleWatch}
                            />
                        </li>)}
                </ol>
            </div>
        );
    }

    private handleReaction(reactionType: string, on: boolean, answerId: number, commentId?: number): void {
        this.props.onReaction(reactionType, on, answerId, commentId);
    }

    private handleWatch(on: boolean, identifier?: number): void {
        this.props.onWatch(on, this.props.id, identifier);
    }
}
