import { CommentModel } from './../server-models';

export function countNestedComments(comments: CommentModel[]): number {
    let total = comments.length;
    for (const comment of comments) {
        // Also add any child comments
        if (comment.comments.length > 0) {
            total += countNestedComments(comment.comments);
        }
    }
    return total;
}
