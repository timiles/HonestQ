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

export function getCommentScores(comments: CommentModel[]): [number, number] {
  let agreeCount = 0;
  let disagreeCount = 0;
  for (const comment of comments) {
    comment.isAgree ? agreeCount++ : disagreeCount++;
  }
  return [agreeCount, disagreeCount];
}

export function findComment(comments: CommentModel[], commentId: number): CommentModel | null {
  for (const comment of comments) {
    if (comment.id === commentId) {
      return comment;
    }
    const childComment = findComment(comment.comments, commentId);
    if (childComment) {
      return childComment;
    }
  }
  return null;
}
