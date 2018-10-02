import * as React from 'react';
import { Link } from 'react-router-dom';
import { AnswerModel } from '../../server-models';
import { isUserInRole } from '../../utils';
import { LoggedInUserContext } from '../LoggedInUserContext';
import Emoji, { EmojiValue } from '../shared/Emoji';
import CommentList from './CommentList';
import NewComment from './NewComment';

type Props = AnswerModel
    & { questionId: number };

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
                    <span className="ml-1 answer">{text}</span>
                </h4>
                {source && <p><small>Source: {source}</small></p>}
                <div>
                    <NewComment
                        questionId={questionId}
                        answerId={id}
                    />
                </div>
                <CommentList questionId={questionId} answerId={id} comments={comments} />
            </div>
        );
    }
}
