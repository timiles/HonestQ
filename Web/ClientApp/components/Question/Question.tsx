import * as React from 'react';
import { Link } from 'react-router-dom';
import { LoggedInUserContext } from '../../LoggedInUserContext';
import { AnswerModel, CommentModel, QuestionModel } from '../../server-models';
import { isUserInRole } from '../../utils/auth-utils';
import { buildAnswerUrl } from '../../utils/route-utils';
import Emoji, { EmojiValue } from '../shared/Emoji';
import Source from '../shared/Source';
import NewAnswer from './NewAnswer';
import ReactionsControl from './ReactionsControl';

export interface QuestionProps {
    loading?: boolean;
    error?: string;
    questionId?: number;
    model?: QuestionModel;
}

type Props = QuestionProps
    & {
    onReaction: (reactionType: string, on: boolean, answerId: number, commentId?: number) => void,
};

export default class Question extends React.Component<Props, {}> {

    private static getAnswersHeader(answersCount: number): string {
        switch (answersCount) {
            case 0: {
                return 'No answers yet';
            }
            case 1: {
                return '1 answer';
            }
            default: {
                return `${answersCount} answers`;
            }
        }
    }

    private static getTotalCommentsCount(comments: CommentModel[]): number {
        let total = comments.length;
        for (const comment of comments) {
            // Also add any child comments
            if (comment.comments.length > 0) {
                total += Question.getTotalCommentsCount(comment.comments);
            }
        }
        return total;
    }

    constructor(props: Props) {
        super(props);

        this.handleReaction = this.handleReaction.bind(this);
    }

    public render() {
        const { questionId, model } = this.props;

        if (!model || !questionId) {
            return null;
        }

        const answersHeader = Question.getAnswersHeader(model.answers.length);

        return (
            <div>
                <div className="card card-body bg-light">
                    <blockquote className="blockquote mb-0">
                        <p>
                            <LoggedInUserContext.Consumer>
                                {(user) => isUserInRole(user, 'Admin') &&
                                    <Link to={`/admin/edit/questions/${questionId}`} className="float-right">
                                        Edit
                                    </Link>
                                }
                            </LoggedInUserContext.Consumer>
                            <Emoji value={EmojiValue.Question} /> HonestQ:
                        </p>
                        <h4><span className="quote-marks">{model.text}</span></h4>
                        <Source value={model.source} />
                        <footer className="blockquote-footer">
                            {model.postedBy}
                        </footer>
                    </blockquote>
                </div>
                <hr />
                <h5>{answersHeader}</h5>
                <div className="mb-3">
                    <NewAnswer questionId={questionId} />
                </div>
                <ul className="list-unstyled mt-3 mb-3">
                    {model.answers.map((x: AnswerModel, i: number) =>
                        <li key={i} className="mb-2">
                            <div className="card">
                                <div className="card-body">
                                    <blockquote className="blockquote mb-0">
                                        <Emoji value={EmojiValue.Answer} />
                                        <span className="quote-marks">{x.text}</span>
                                        <Source value={x.source} />
                                    </blockquote>
                                    <div className="mt-2 float-right">
                                        <ReactionsControl
                                            answerId={x.id}
                                            linkToCommentsUrl={buildAnswerUrl(questionId, model.slug, x.id, x.slug)}
                                            commentsCount={Question.getTotalCommentsCount(x.comments)}
                                            reactionCounts={x.reactionCounts}
                                            myReactions={x.myReactions}
                                            onReaction={this.handleReaction}
                                            showHelp={i === 0}
                                        />
                                    </div>
                                </div>
                            </div>
                        </li>)}
                </ul>
                {model.answers.length >= 10 &&
                    <div>
                        <NewAnswer questionId={questionId} />
                    </div>
                }
            </div>
        );
    }

    private handleReaction(reactionType: string, on: boolean, answerId: number, commentId?: number): void {
        this.props.onReaction(reactionType, on, answerId, commentId);
    }
}
