import * as React from 'react';
import { AnswerModel } from '../../server-models';
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
                <h4>
                    <Emoji value={EmojiValue.Answer} />
                    <span className="answer">{text}</span>
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
