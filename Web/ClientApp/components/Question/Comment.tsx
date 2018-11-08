import * as React from 'react';
import { CommentModel } from '../../server-models';
import { extractUrlFromText } from '../../utils';
import DateTimeTooltip from '../shared/DateTimeTooltip';
import EmbeddedContentCard from '../shared/EmbeddedContentCard';
import Emoji, { EmojiValue } from '../shared/Emoji';
import NewComment from './NewComment';
import ReactionsControl from './ReactionsControl';

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
        const extractedUrl = (source ? extractUrlFromText(source) : null) || (text ? extractUrlFromText(text) : null);
        const emojiValue = EmojiValue[agreementRating as keyof typeof EmojiValue];

        return (
            <>
                <div className="card">
                    <div className="card-body">
                        <blockquote className="blockquote mb-0">
                            {emojiValue && <Emoji value={emojiValue} />}
                            <span className="badge badge-secondary">
                                {agreementRating.toSentenceCase()}
                            </span>
                            {text && <p>{text}</p>}
                            {source && <p><small>Source: {source}</small></p>}
                            <footer className="blockquote-footer">
                                {postedBy}, <DateTimeTooltip dateTime={postedAt} />
                            </footer>
                            {extractedUrl && <EmbeddedContentCard url={extractedUrl} />}
                        </blockquote>
                        <div className="float-right">
                            <ReactionsControl
                                answerId={answerId}
                                commentId={id}
                                reactionCounts={reactionCounts}
                                myReactions={myReactions}
                                onReaction={this.props.onReaction}
                            />
                        </div>
                        <NewComment
                            questionId={questionId}
                            answerId={answerId}
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
