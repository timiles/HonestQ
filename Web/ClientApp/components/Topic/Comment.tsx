import * as moment from 'moment';
import * as React from 'react';
import { CommentListItemModel } from '../../server-models';
import { extractUrlFromText, parseDateWithTimeZoneOffset } from '../../utils';
import { LoggedInUserContext } from '../LoggedInUserContext';
import EmbeddedContentCard from '../shared/EmbeddedContentCard';

export default class Comment extends React.Component<CommentListItemModel, {}> {

    constructor(props: CommentListItemModel) {
        super(props);
    }

    public render() {
        const { text, source, agreementRating, postedAt, postedByUsername } = this.props;
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
                        <div className="card">
                            <div className="card-body">
                                <blockquote className="blockquote mb-0">
                                    <span className="badge badge-secondary">{agreementRating.toSentenceCase()}</span>
                                    <p>{text}</p>
                                    {source && <p><small>Source: {source}</small></p>}
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
