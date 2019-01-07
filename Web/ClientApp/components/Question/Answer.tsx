import * as React from 'react';
import { Link } from 'react-router-dom';
import { LoggedInUserContext } from '../../LoggedInUserContext';
import { AnswerModel, CommentModel } from '../../server-models';
import { isUserInRole } from '../../utils/auth-utils';
import DateTimeTooltip from '../shared/DateTimeTooltip';
import EmbeddedContent from '../shared/EmbeddedContent';
import Emoji, { EmojiValue } from '../shared/Emoji';
import Source from '../shared/Source';
import WatchControl from '../shared/WatchControl';
import Comment from './Comment';
import NewComment from './NewComment';
import UpvoteButton from './UpvoteButton';

type Props = AnswerModel
    & {
        questionId: number,
        questionText: string,
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
        const { questionId, questionText, id, text, source, postedBy, postedAt, comments } = this.props;
        const { reactionCounts, myReactions, watching } = this.props;

        return (
            <div>
                <div className="card card-body bg-light">
                    <blockquote className="blockquote">
                        <LoggedInUserContext.Consumer>
                            {(user) => isUserInRole(user, 'Admin') &&
                                <Link
                                    to={`/admin/edit/questions/${questionId}/answers/${id}`}
                                    className="float-right"
                                >
                                    Edit
                                </Link>
                            }
                        </LoggedInUserContext.Consumer>
                        <p className="small">
                            <Emoji value={EmojiValue.Question} />
                            <span className="post quote-marks">{questionText}</span>
                        </p>
                        <h4>
                            <Emoji value={EmojiValue.Answer} />
                            <span className="ml-1 post">{text}</span>
                        </h4>
                        <footer className="blockquote-footer">
                            {postedBy}, <DateTimeTooltip dateTime={postedAt} />
                        </footer>
                        <Source value={source} />
                        <EmbeddedContent value={source} />
                    </blockquote>
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
                <hr />
                <div>
                    <NewComment
                        questionId={questionId}
                        answerId={id}
                    />
                </div>
                <ol className="list-unstyled mb-3">
                    {comments.map((x: CommentModel, i: number) =>
                        <li key={i} className="mb-3">
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
