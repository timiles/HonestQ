import * as moment from 'moment';
import * as React from 'react';
import { extractUrlFromText, parseDateWithTimeZoneOffset } from '../../utils';
import { LoggedInUserContext } from '../LoggedInUserContext';
import EmbeddedContentCard from '../shared/EmbeddedContentCard';

export interface CommentProps {
    text: string;
    agreementRating: string;
    postedAt: string;
    postedByUsername: string;
}

export default class Comment extends React.Component<CommentProps, {}> {

    constructor(props: CommentProps) {
        super(props);
    }

    public render() {
        const { text, agreementRating, postedAt, postedByUsername } = this.props;
        const extractedUrl = extractUrlFromText(text);

        return (
            <LoggedInUserContext.Consumer>
                {(user) => {
                    const offsetHours = user ? user.timeZoneOffsetHours : 0;
                    const postedAtOffset = parseDateWithTimeZoneOffset(postedAt, offsetHours);
                    const postedAtMoment = moment(postedAtOffset);
                    const friendlyTime = postedAtMoment.fromNow();
                    const fullTime = postedAtMoment.format('LLLL');

                    return (
                        <div className="card">
                            <div className="card-body">
                                <blockquote className="blockquote mb-0">
                                    <span className="badge badge-secondary">{agreementRating.toSentenceCase()}</span>
                                    <p>{text}</p>
                                    <footer className="blockquote-footer">
                                        @{postedByUsername}, <a href="#" title={fullTime}>{friendlyTime}</a>
                                    </footer>
                                    {extractedUrl && <EmbeddedContentCard url={extractedUrl} />}
                                </blockquote>
                            </div>
                        </div>
                    );
                }
                }
            </LoggedInUserContext.Consumer>
        );
    }
}
