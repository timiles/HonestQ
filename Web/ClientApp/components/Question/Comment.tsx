import * as React from 'react';
import { CommentModel } from '../../server-models';
import DateTimeTooltip from '../shared/DateTimeTooltip';
import EmbeddedContent from '../shared/EmbeddedContent';
import Source from '../shared/Source';
import Icon, { IconValue } from '../shared/SvgIcons/Icon';
import NewComment from './NewComment';
import UpvoteButton from './UpvoteButton';

type Props = CommentModel
    & {
        questionId: number,
        answerId: number,
        onUpvote: (on: boolean, answerId: number, commentId?: number) => void,
    };

export default class Comment extends React.Component<Props, {}> {

    public render(): any {
        const { questionId, answerId } = this.props;
        const { id, text, source, agreementRating, comments, upvotes, upvotedByMe } = this.props;
        const { postedAt, postedBy } = this.props;
        const iconValue = IconValue[agreementRating as keyof typeof IconValue];

        return (
            <>
                <div className="card light-dark-bg">
                    <div className="card-body">
                        <div className="mb-3">
                            <span className="badge badge-pill badge-reaction mr-2">
                                {iconValue >= 0 && <Icon value={iconValue} />}
                                <label>{agreementRating.toSentenceCase()}</label>
                            </span>
                            <span>
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
                                    onUpvote={this.props.onUpvote}
                                />
                            </li>)}
                    </ol>}
            </>
        );
    }
}
