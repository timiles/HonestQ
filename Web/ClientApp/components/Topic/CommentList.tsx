import * as React from 'react';
import { CommentListItemModel } from '../../server-models';
import Comment from './Comment';

interface Props {
    comments: CommentListItemModel[];
}

export default class CommentList extends React.Component<Props, {}> {

    public render() {
        const { comments } = this.props;

        return (
            <ol>
                {comments.map((x, i) => <li key={`comment_${i}`}><Comment {...x} /></li>)}
            </ol>
        );
    }
}
