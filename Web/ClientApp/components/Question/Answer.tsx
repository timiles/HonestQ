import * as React from 'react';
import { Link } from 'react-router-dom';
import { AnswerModel, CommentModel } from '../../server-models';
import { isUserInRole } from '../../utils';
import { LoggedInUserContext } from '../LoggedInUserContext';
import Emoji, { EmojiValue } from '../shared/Emoji';
import Comment from './Comment';
import NewComment from './NewComment';
import ReactionsControl from './ReactionsControl';

type Props = AnswerModel
    & {
    questionId: number,
    onReaction: (reactionType: string, on: boolean, commentId?: number) => void,
};

export default class Answer extends React.Component<Props, {}> {

    constructor(props: Props) {
        super(props);

        this.handleAnswerReaction = this.handleAnswerReaction.bind(this);
        this.handleCommentReaction = this.handleCommentReaction.bind(this);
    }

    public render() {
        const { questionId, id, text, source, comments, reactionCounts, myReactions } = this.props;

        return (
            <div>
                <LoggedInUserContext.Consumer>
                    {(user) => isUserInRole(user, 'Admin') &&
                        <Link to={`/admin/edit/questions/${questionId}/answers/${id}`} className="float-right">
                            Edit
                        </Link>
                    }
                </LoggedInUserContext.Consumer>
                <h4>
                    <Emoji value={EmojiValue.Answer} />
                    <span className="ml-1 post quote-marks">{text}</span>
                </h4>
                {source && <p><small>Source: {source}</small></p>}
                <div className="float-right mb-2">
                    <ReactionsControl
                        reactionCounts={reactionCounts}
                        myReactions={myReactions}
                        onReaction={this.handleAnswerReaction}
                        showHelp={true}
                    />
                </div>
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
                                onReaction={this.handleCommentReaction}
                            /></li>)}
                </ol>
            </div>
        );
    }

    private handleAnswerReaction(reactionType: string, on: boolean): void {
        this.props.onReaction(reactionType, on);
    }

    private handleCommentReaction(reactionType: string, on: boolean, commentId: number): void {
        this.props.onReaction(reactionType, on, commentId);
    }
}
