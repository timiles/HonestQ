import * as React from 'react';
import { CommentModel } from '../../server-models';
import DateTimeTooltip from '../shared/DateTimeTooltip';
import EmbeddedContent from '../shared/EmbeddedContent';
import Icon, { IconValue } from '../shared/Icon';
import Source from '../shared/Source';
import NewComment from './NewComment';
import UpvoteButton from './UpvoteButton';

type Props = CommentModel
    & {
        questionId: number,
        answerId: number,
        onReaction: (reactionType: string, on: boolean, answerId: number, commentId?: number) => void,
    };

export default class Comment extends React.Component<Props, {}> {

    public render(): any {
        const { questionId, answerId } = this.props;
        const { id, text, source, agreementRating, comments, reactionCounts, myReactions } = this.props;
        const { postedAt, postedBy } = this.props;
        const iconValue = IconValue[agreementRating as keyof typeof IconValue];

        return (
            <>
                <div className="card">
                    <div className="card-body">
                        <blockquote className="blockquote">
                            <span className="badge badge-pill badge-reaction float-left mr-2">
                                {iconValue >= 0 && <Icon value={iconValue} />}
                                <label>{agreementRating.toSentenceCase()}</label>
                            </span>
                            {text && <p>{text}</p>}
                            <footer className="blockquote-footer">
                                {postedBy}, <DateTimeTooltip dateTime={postedAt} />
                            </footer>
                        </blockquote>
                        <Source value={source} />
                        <EmbeddedContent value={source} />
                        <div className="float-right btn-container">
                            <UpvoteButton
                                answerId={answerId}
                                commentId={id}
                                count={reactionCounts[UpvoteButton.ReactionType]}
                                isUpvotedByLoggedInUser={myReactions &&
                                    myReactions.indexOf(UpvoteButton.ReactionType) >= 0}
                                onReaction={this.props.onReaction}
                                hideLabelOnMobile={true}
                            />
                        </div>
                        <NewComment
                            questionId={questionId}
                            answerId={answerId}
                            replyingToText={text}
                            parentCommentId={id}
                        />
                    </div>
                </div>
                {comments && comments.length > 0 &&
                    <ol className="list-unstyled list-comments-nested">
                        {comments.map((x: CommentModel, i: number) =>
                            <li key={i}>
                                <Comment
                                    {...x}
                                    questionId={questionId}
                                    answerId={answerId}
                                    onReaction={this.props.onReaction}
                                />
                            </li>)}
                    </ol>}
            </>
        );
    }
}
