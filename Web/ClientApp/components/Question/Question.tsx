import * as React from 'react';
import { Link } from 'react-router-dom';
import { AnswerModel, QuestionModel } from '../../server-models';
import { isUserInRole } from '../../utils';
import { LoggedInUserContext } from '../LoggedInUserContext';
import Emoji, { EmojiValue } from '../shared/Emoji';
import AgreementRatingBarChart from '../Topic/AgreementRatingBarChart';
import NewAnswer from './NewAnswer';
import TopicsList from './TopicsList';

export interface QuestionProps {
    loading?: boolean;
    error?: string;
    questionId?: number;
    model?: QuestionModel;
}

export default class Question extends React.Component<QuestionProps, {}> {

    public render() {
        const { questionId, model } = this.props;

        if (!model || !questionId) {
            return null;
        }

        return (
            <div>
                <LoggedInUserContext.Consumer>
                    {(user) => isUserInRole(user, 'Admin') &&
                        <Link to={`/admin/edit/questions/${questionId}`} className="float-right">
                            Edit
                                </Link>
                    }
                </LoggedInUserContext.Consumer>
                <h4>
                    <Emoji value={EmojiValue.Question} />
                    <span className="ml-1 question">{model.text}</span>
                </h4>
                {model.source && <p><small>Source: {model.source}</small></p>}
                <TopicsList topics={model.topics} />
                <ol className="list-unstyled mt-3 mb-3">
                    {model.answers.map((x, i) => <li key={`answer_${i}`} className="mb-2">
                        <Link
                            to={`/questions/${questionId}/${model.slug}/${x.id}/${x.slug}`}
                            className="btn btn-lg btn-outline-secondary question-list-item"
                        >
                            <Emoji value={EmojiValue.Answer} />
                            <span className="ml-1 answer">{x.text}</span>
                            {this.isCitationNeeded(x) &&
                                <small className="ml-1">
                                    <span className="badge badge-info">Citation needed</span>
                                </small>
                            }
                            <span className="ml-1">{this.renderAgreementRating(x)}</span>
                        </Link>
                    </li>)}
                </ol>
                <div>
                    <NewAnswer questionId={questionId} />
                </div>
            </div>
        );
    }

    private isCitationNeeded(answer: AnswerModel): boolean {
        return !answer.source && (answer.comments.filter((x) => x.source).length === 0);
    }

    private renderAgreementRating(answer: AnswerModel): any {
        const agreementRatings: { [key: string]: number } = {};
        if (answer.comments && answer.comments.length > 0) {
            answer.comments.forEach((x) => {
                if (!agreementRatings[x.agreementRating]) {
                    agreementRatings[x.agreementRating] = 1;
                } else {
                    agreementRatings[x.agreementRating]++;
                }
            });
        }
        return <AgreementRatingBarChart {...agreementRatings} />;
    }
}
