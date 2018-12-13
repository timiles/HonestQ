import * as React from 'react';
import { Link } from 'react-router-dom';
import { LoggedInUserContext } from '../../LoggedInUserContext';
import { QuestionModel } from '../../server-models';
import { isUserInRole } from '../../utils/auth-utils';
import EmbeddedContent from '../shared/EmbeddedContent';
import Emoji, { EmojiValue } from '../shared/Emoji';
import Source from '../shared/Source';
import WatchControl from '../shared/WatchControl';
import AnswersList from './AnswersList';
import NewAnswer from './NewAnswer';

interface Props {
    questionId: number;
    question: QuestionModel;
    onReaction: (reactionType: string, on: boolean, answerId: number, commentId?: number) => void;
    onWatch: (on: boolean) => void;
}

export default class Question extends React.Component<Props> {

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

    constructor(props: Props) {
        super(props);

        this.handleWatch = this.handleWatch.bind(this);
    }

    public render() {
        const { questionId, question } = this.props;

        const answersHeader = Question.getAnswersHeader(question.answers.length);

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
                        <h4><span className="post quote-marks">{question.text}</span></h4>
                        <footer className="blockquote-footer">
                            {question.postedBy}
                        </footer>
                        <Source value={question.source} />
                        <EmbeddedContent value={question.source} />
                    </blockquote>
                    <div>
                        <div className="float-right">
                            <WatchControl
                                onWatch={this.handleWatch}
                                watching={question.watching}
                            />
                        </div>
                    </div>
                </div>
                <hr />
                <h5>{answersHeader}</h5>
                <div className="mb-3">
                    <NewAnswer questionId={questionId} />
                </div>
                <AnswersList questionId={questionId} questionSlug={question.slug} answers={question.answers} />
                {question.answers.length >= 5 &&
                    <div>
                        <NewAnswer questionId={questionId} />
                    </div>
                }
            </div>
        );
    }

    private handleWatch(on: boolean): void {
        this.props.onWatch(on);
    }
}
