import * as React from 'react';
import { Link } from 'react-router-dom';
import { AnswerModel, CommentModel } from '../../server-models';
import { isUserInRole } from '../../utils';
import { LoggedInUserContext } from '../LoggedInUserContext';
import Emoji, { EmojiValue } from '../shared/Emoji';
import Comment from './Comment';
import NewComment from './NewComment';

type Props = AnswerModel
    & {
    questionId: number,
    onReaction: (commentId: number, reactionType: string, on: boolean) => void,
};

export default class Answer extends React.Component<Props, {}> {

    public render() {
        const { questionId, id, text, source, comments } = this.props;

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
                    <span className="ml-1 post answer">{text}</span>
                </h4>
                {source && <p><small>Source: {source}</small></p>}
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
                                onReaction={this.props.onReaction}
                            /></li>)}
                </ol>
            </div>
        );
    }
}
