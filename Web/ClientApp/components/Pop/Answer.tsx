import * as React from 'react';
import { CommentModel } from '../../server-models';
import PopTypeView from '../shared/PopTypeView';
import CommentList from './CommentList';
import NewComment from './NewComment';

type Props = CommentModel
    & { questionId: number };

export default class Answer extends React.Component<Props, {}> {

    public render() {
        const { questionId, id, text, comments } = this.props;

        return (
            <div>
                <h4>
                    <PopTypeView value="Answer" />
                    <span className="pop pop-statement">{text}</span>
                </h4>
                <div>
                    <NewComment
                        parentCommentId={id}
                        questionId={questionId}
                        type="Question"
                    />
                </div>
                <CommentList questionId={questionId} comments={comments} />
            </div>
        );
    }
}
