import * as moment from 'moment';
import * as React from 'react';
import { CommentModel } from '../../server-models';
import { extractUrlFromText, parseDateWithTimeZoneOffset } from '../../utils';
import { LoggedInUserContext } from '../LoggedInUserContext';
import EmbeddedContentCard from '../shared/EmbeddedContentCard';
import Emoji, { EmojiValue } from '../shared/Emoji';
import NewComment from './NewComment';
import ReactionsControl from './ReactionsControl';

type Props = CommentModel
    & {
    questionId: number,
    answerId: number,
    onReaction: (commentId: number, reactionType: string, on: boolean) => void,
};

export default class Comment extends React.Component<Props, {}> {

    public render(): any {
        const { questionId, answerId } = this.props;
        const { id, text, source, agreementRating, comments } = this.props;
        const { postedAt, postedByUserPseudoId, isPostedByLoggedInUser } = this.props;
        const extractedUrl = (source ? extractUrlFromText(source) : null) || (text ? extractUrlFromText(text) : null);
        const postedBy = `Thread user #${postedByUserPseudoId}` + (isPostedByLoggedInUser ? ' (you)' : '');

        return (
            <LoggedInUserContext.Consumer>
                {(user) => {
                    const offsetHours = user ? user.timeZoneOffsetHours : 0;
                    const postedAtOffset = parseDateWithTimeZoneOffset(postedAt, offsetHours);
                    const postedAtMoment = moment(postedAtOffset);
                    const friendlyTime = postedAtMoment.fromNow();
                    const fullTime = postedAtMoment.format('LLLL');
                    const emojiValue = EmojiValue[agreementRating as keyof typeof EmojiValue];

                    return (
                        <>
                            <div className="card">
                                <div className="card-body">
                                    <div className="float-right">
                                        <ReactionsControl {...this.props} />
                                    </div>
                                    <blockquote className="blockquote mb-0">
                                        {emojiValue && <Emoji value={emojiValue} />}
                                        <span className="badge badge-secondary">
                                            {agreementRating.toSentenceCase()}
                                        </span>
                                        {text && <p>{text}</p>}
                                        {source && <p><small>Source: {source}</small></p>}
                                        <footer className="blockquote-footer">
                                            {postedBy},&nbsp;
                                            <a href="javascript:void(0);" title={fullTime}>{friendlyTime}</a>
                                        </footer>
                                        {extractedUrl && <EmbeddedContentCard url={extractedUrl} />}
                                    </blockquote>
                                    <NewComment
                                        questionId={questionId}
                                        answerId={answerId}
                                        parentCommentId={id}
                                    />
                                </div>
                            </div>
                            {comments && comments.length > 0 &&
                                <ol className="list-unstyled list-comments-nested">
                                    {comments.map((x, i) =>
                                        <li key={`comment_${i}`}>
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
                }}
            </LoggedInUserContext.Consumer>
        );
    }
}
