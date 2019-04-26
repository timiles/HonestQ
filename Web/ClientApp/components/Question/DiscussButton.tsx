import * as React from 'react';
import { Link } from 'react-router-dom';
import { CommentModel } from '../../server-models';
import Icon, { IconValue } from '../shared/SvgIcons/Icon';

interface Props {
    linkToCommentsUrl: string;
    comments: CommentModel[];
    upvotes: number;
}

export default class DiscussButton extends React.Component<Props> {

    public render() {
        const { linkToCommentsUrl, comments, upvotes } = this.props;

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
            <>
                <Link
                    className="btn btn-outline-secondary"
                    to={linkToCommentsUrl}
                >
                    <span>Discuss</span>
                </Link>
                {upvotes > 0 &&
                    <span className="badge badge-pill badge-reaction ml-1">
                        <Icon value={IconValue.Upvote} />
                        <label>
                            {upvotes}
                            <span className="sr-only">upvotes</span>
                        </label>
                    </span>
                }
                {agreeCount > 0 &&
                    <span className="badge badge-pill badge-reaction ml-1">
                        <Icon value={IconValue.Agree} />
                        <label>
                            {agreeCount}
                            <span className="sr-only">agree</span>
                        </label>
                    </span>
                }
                {disagreeCount > 0 &&
                    <span className="badge badge-pill badge-reaction ml-1">
                        <Icon value={IconValue.Disagree} />
                        <label>
                            {disagreeCount}
                            <span className="sr-only">disagree</span>
                        </label>
                    </span>
                }
            </>
        );
    }
}
