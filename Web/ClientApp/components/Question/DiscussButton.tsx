import * as React from 'react';
import { Link } from 'react-router-dom';
import Emoji, { EmojiValue } from '../shared/Emoji';

interface Props {
    linkToCommentsUrl: string;
    commentsCount: number;
}

export default class DiscussButton extends React.Component<Props> {

    public render() {
        const { linkToCommentsUrl, commentsCount } = this.props;

        return (
            <Link
                className="btn btn-outline-secondary background-white"
                to={linkToCommentsUrl}
            >
                <Emoji value={EmojiValue.Discuss} />
                <span className="ml-1">
                    Discuss <span className="badge badge-info">{commentsCount}</span>
                </span>
            </Link>
        );
    }
}
