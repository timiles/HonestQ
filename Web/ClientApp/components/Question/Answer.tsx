import * as React from 'react';
import { Link } from 'react-router-dom';
import { LoggedInUserContext } from '../../LoggedInUserContext';
import { AnswerModel, CommentModel } from '../../server-models';
import { isUserInRole } from '../../utils';
import DateTimeTooltip from '../shared/DateTimeTooltip';
import Emoji, { EmojiValue } from '../shared/Emoji';
import Source from '../shared/Source';
import Comment from './Comment';
import NewComment from './NewComment';
import ReactionsControl from './ReactionsControl';

type Props = AnswerModel
    & {
    questionId: number,
    onReaction: (reactionType: string, on: boolean, answerId: number, commentId?: number) => void,
};

export default class Answer extends React.Component<Props, {}> {

    constructor(props: Props) {
        super(props);

        this.handleReaction = this.handleReaction.bind(this);
    }

    public render() {
        const { questionId, id, text, source, postedBy, postedAt, comments, reactionCounts, myReactions } = this.props;

        return (
            <div>
                <div className="card card-body bg-light">
                    <blockquote className="blockquote">
                        <LoggedInUserContext.Consumer>
                            {(user) => isUserInRole(user, 'Admin') &&
                                <Link
                                    to={`/admin/edit/questions/${questionId}/answers/${id}`}
                                    className="float-right"
                                >
                                    Edit
                                </Link>
                            }
                        </LoggedInUserContext.Consumer>
                        <h4>
                            <Emoji value={EmojiValue.Answer} />
                            <span className="post quote-marks">{text}</span>
                        </h4>
                        <Source value={source} />
                        <footer className="blockquote-footer">
                            {postedBy}, <DateTimeTooltip dateTime={postedAt} />
                        </footer>
                    </blockquote>
                    <div>
                        <div className="float-right">
                            <ReactionsControl
                                answerId={id}
                                reactionCounts={reactionCounts}
                                myReactions={myReactions}
                                onReaction={this.handleReaction}
                                showHelp={true}
                            />
                        </div>
                    </div>
                </div>
                <hr />
                <div>
                    <NewComment
                        questionId={questionId}
                        answerId={id}
                    />
                </div>
                <ol className="list-unstyled mb-3">
                    {comments.map((x: CommentModel, i: number) =>
                        <li key={i} className="mb-3">
                            <Comment
                                {...x}
                                questionId={questionId}
                                answerId={id}
                                onReaction={this.handleReaction}
                            /></li>)}
                </ol>
            </div>
        );
    }

    private handleReaction(reactionType: string, on: boolean, answerId: number, commentId?: number): void {
        this.props.onReaction(reactionType, on, answerId, commentId);
    }
}
