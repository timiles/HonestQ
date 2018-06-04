import * as moment from 'moment';
import * as React from 'react';
import { extractUrlFromText } from '../../utils';
import EmbeddedContentCard from '../shared/EmbeddedContentCard';

export interface CommentProps {
    text: string;
    postedAt: Date;
    postedByUsername: string;
}

export default class Comment extends React.Component<CommentProps, {}> {

    constructor(props: CommentProps) {
        super(props);
    }

    public render() {
        const { text, postedAt, postedByUsername } = this.props;
        const extractedUrl = extractUrlFromText(text);
        const postedAtMoment = moment(postedAt);
        const friendlyTime = postedAtMoment.fromNow();
        const fullTime = postedAtMoment.format('LLLL');
        return (
            <div className="card">
                <div className="card-body">
                    <blockquote className="blockquote mb-0">
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