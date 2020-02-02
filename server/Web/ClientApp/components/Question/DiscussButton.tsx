import React from 'react';
import { Link } from 'react-router-dom';
import { CommentModel } from '../../server-models';
import { getCommentScores } from '../../utils/model-utils';
import Icon, { IconValue } from '../shared/SvgIcons/Icon';

interface Props {
  linkToCommentsUrl: string;
  comments: CommentModel[];
  upvotes: number;
}

export default class DiscussButton extends React.Component<Props> {

  public render() {
    const { linkToCommentsUrl, comments, upvotes } = this.props;
    const [agreeCount, disagreeCount] = getCommentScores(comments);

    return (
      <>
        <Link
          className="btn btn-outline-secondary"
          to={linkToCommentsUrl}
        >
          <span>Sources</span>
        </Link>
        {agreeCount > 0 &&
          <span className="badge badge-pill badge-reaction ml-1">
            <Icon value={IconValue.Agree} />
            <label>
              {agreeCount}
              <span className="d-none d-sm-block float-right">&nbsp;× Agree</span>
            </label>
          </span>
        }
        {disagreeCount > 0 &&
          <span className="badge badge-pill badge-reaction ml-1">
            <Icon value={IconValue.Disagree} />
            <label>
              {disagreeCount}
              <span className="d-none d-sm-block float-right">&nbsp;× Disagree</span>
            </label>
          </span>
        }
        {upvotes > 0 &&
          <span className="badge badge-pill badge-reaction ml-1">
            <Icon value={IconValue.Upvote} />
            <label>
              {upvotes}
              <span className="sr-only">Upvotes</span>
            </label>
          </span>
        }
      </>
    );
  }
}
