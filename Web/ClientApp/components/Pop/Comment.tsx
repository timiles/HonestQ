import * as moment from 'moment';
import * as React from 'react';
import { CommentModel } from '../../server-models';
import { extractUrlFromText, parseDateWithTimeZoneOffset } from '../../utils';
import { LoggedInUserContext } from '../LoggedInUserContext';
import EmbeddedContentCard from '../shared/EmbeddedContentCard';
import NewComment from './NewComment';

type Props = CommentModel
    & { questionId: number };

export default class Comment extends React.Component<Props, {}> {

    constructor(props: Props) {
        super(props);
    }

    public render(): any {
        const { questionId } = this.props;
        const { id, text, source, agreementRating, comments } = this.props;
        const { postedAt, postedByUserPseudoId, isPostedByLoggedInUser } = this.props;
        const extractedUrl = extractUrlFromText(source) || extractUrlFromText(text);
        const postedBy = `Thread user #${postedByUserPseudoId}` + (isPostedByLoggedInUser ? ' (you)' : '');

        return (
            <LoggedInUserContext.Consumer>
                {(user) => {
                    const offsetHours = user ? user.timeZoneOffsetHours : 0;
                    const postedAtOffset = parseDateWithTimeZoneOffset(postedAt, offsetHours);
                    const postedAtMoment = moment(postedAtOffset);
                    const friendlyTime = postedAtMoment.fromNow();
                    const fullTime = postedAtMoment.format('LLLL');

                    return (
                        <>
                            <div className="card">
                                <div className="card-body">
                                    <blockquote className="blockquote mb-0">
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
                                        parentCommentId={id}
                                        questionId={questionId}
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
