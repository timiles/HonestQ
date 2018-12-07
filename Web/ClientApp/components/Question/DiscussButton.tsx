import * as React from 'react';
import { Link } from 'react-router-dom';
import { CommentModel } from '../../server-models';
import Emoji, { EmojiValue } from '../shared/Emoji';

interface Props {
    linkToCommentsUrl: string;
    comments: CommentModel[];
    upvotes: number;
}

export default class DiscussButton extends React.Component<Props> {

    private static getTotalCommentsCount(comments: CommentModel[]): number {
        let total = comments.length;
        for (const comment of comments) {
            // Also add any child comments
            if (comment.comments.length > 0) {
                total += DiscussButton.getTotalCommentsCount(comment.comments);
            }
        }
        return total;
    }

    public render() {
        const { linkToCommentsUrl, comments, upvotes } = this.props;

        const commentsCount = DiscussButton.getTotalCommentsCount(comments);

        let agreeCount = 0;
        let disagreeCount = 0;
        for (const comment of comments) {
            if (comment.agreementRating === 'Agree') {
                agreeCount++;
            }
            if (comment.agreementRating === 'Disagree') {
                disagreeCount++;
            }
        }

        return (
            <Link
                className="btn btn-outline-secondary background-white"
                to={linkToCommentsUrl}
            >
                <span>Discuss</span>
                {commentsCount > 0 &&
                    <span className="badge badge-info ml-1">
                        <Emoji value={EmojiValue.Discuss} /> {commentsCount}
                        <span className="sr-only">comments</span>
                    </span>
                }
                {upvotes > 0 &&
                    <span className="badge badge-info ml-1">
                        <Emoji value={EmojiValue.Upvote} /> {upvotes}
                        <span className="sr-only">upvotes</span>
                    </span>
                }
                {agreeCount > 0 &&
                    <span className="badge badge-info ml-1">
                        <Emoji value={EmojiValue.Agree} /> {agreeCount}
                        <span className="sr-only">agree</span>
                    </span>
                }
                {disagreeCount > 0 &&
                    <span className="badge badge-info ml-1">
                        <Emoji value={EmojiValue.Disagree} /> {disagreeCount}
                        <span className="sr-only">disagree</span>
                    </span>
                }
            </Link>
        );
    }
}
