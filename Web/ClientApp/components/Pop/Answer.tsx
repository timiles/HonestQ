import * as React from 'react';
import { CommentModel } from '../../server-models';
import PopTypeView from '../shared/PopTypeView';
import CommentList from './CommentList';
import NewComment from './NewComment';

type Props = CommentModel
    & { popId: number };

export default class Answer extends React.Component<Props, {}> {

    public render() {
        const { popId, id, text, comments } = this.props;

        return (
            <div>
                <h4>
                    <PopTypeView value="Answer" />
                    <span className="pop pop-statement">{text}</span>
                </h4>
                <div>
                    <NewComment
                        parentCommentId={id}
                        popId={popId}
                        type="Question"
                    />
                </div>
                <CommentList popId={popId} comments={comments} />
            </div>
        );
    }
}
