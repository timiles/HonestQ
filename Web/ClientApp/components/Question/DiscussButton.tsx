import * as React from 'react';
import { Link } from 'react-router-dom';
import { CommentModel } from '../../server-models';
import { countNestedComments } from '../../utils/model-utils';
import Icon, { IconValue } from '../shared/Icon';

interface Props {
    linkToCommentsUrl: string;
    comments: CommentModel[];
    upvotes: number;
}

export default class DiscussButton extends React.Component<Props> {

    public render() {
        const { linkToCommentsUrl, comments, upvotes } = this.props;

        const commentsCount = countNestedComments(comments);

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
                className="btn btn-outline-secondary"
                to={linkToCommentsUrl}
            >
                <span>Discuss</span>
                {upvotes > 0 &&
                    <span className="badge badge-pill badge-reaction ml-1">
                        <Icon value={IconValue.Upvote} /> {upvotes}
                        <span className="sr-only">upvotes</span>
                    </span>
                }
                {commentsCount > 0 &&
                    <span className="badge badge-pill badge-reaction ml-1">
                        <Icon value={IconValue.Discuss} /> {commentsCount}
                        <span className="sr-only">comments</span>
                    </span>
                }
                {agreeCount > 0 &&
                    <span className="badge badge-pill badge-reaction ml-1">
                        <Icon value={IconValue.Agree} /> {agreeCount}
                        <span className="sr-only">agree</span>
                    </span>
                }
                {disagreeCount > 0 &&
                    <span className="badge badge-pill badge-reaction ml-1">
                        <Icon value={IconValue.Disagree} /> {disagreeCount}
                        <span className="sr-only">disagree</span>
                    </span>
                }
            </Link>
        );
    }
}
