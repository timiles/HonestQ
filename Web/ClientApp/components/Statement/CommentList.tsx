import * as React from 'react';
import { CommentModel } from '../../server-models';
import Comment from './Comment';

interface Props {
    comments: CommentModel[];
    statementId: number;
}

export default class CommentList extends React.Component<Props, {}> {

    public render() {
        const { comments, statementId } = this.props;

        return (
            <ol className="list-unstyled mb-3">
                {comments.map((x, i) => <li key={`comment_${i}`} className="mb-3">
                    <Comment {...x} statementId={statementId} /></li>)}
            </ol>
        );
    }
}
