import * as moment from 'moment';
import * as React from 'react';
import { CommentModel } from '../../server-models';
import { extractUrlFromText, parseDateWithTimeZoneOffset } from '../../utils';
import { LoggedInUserContext } from '../LoggedInUserContext';
import EmbeddedContentCard from '../shared/EmbeddedContentCard';
import NewComment from './NewComment';

type Props = CommentModel
    & { popId: number };

export default class Comment extends React.Component<Props, {}> {

    constructor(props: Props) {
        super(props);
    }

    public render(): any {
        const { popId } = this.props;
        const { id, text, source, agreementRating, postedAt, postedByUsername, comments } = this.props;
        const extractedUrl = extractUrlFromText(source) || extractUrlFromText(text);

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
                                        <p>{text}</p>
                                        {source && <p><small>Source: {source}</small></p>}
                                        <footer className="blockquote-footer">
                                            @{postedByUsername}, <a href="#" title={fullTime}>{friendlyTime}</a>
                                        </footer>
                                        {extractedUrl && <EmbeddedContentCard url={extractedUrl} />}
                                    </blockquote>
                                    <NewComment
                                        parentCommentId={id}
                                        popId={popId}
                                    />
                                </div>
                            </div>
                            {comments && comments.length > 0 &&
                                <ol className="list-unstyled list-comments-nested">
                                    {comments.map((x, i) =>
                                        <li key={`comment_${i}`}>
                                            <Comment
                                                {...x}
                                                popId={popId}
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
