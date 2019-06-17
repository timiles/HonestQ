import React from 'react';
import { AnswerModel } from '../../server-models';
import { buildAnswerUrl } from '../../utils/route-utils';
import CircleIcon, { CircleIconValue } from '../shared/CircleIcon';
import QuotationMarks from '../shared/QuotationMarks';
import DiscussButton from './DiscussButton';

interface Props {
    questionId: number;
    questionSlug: string;
    answer: AnswerModel;
}

export default class AnswerSummary extends React.Component<Props> {

    public render() {
        const { questionId, questionSlug, answer } = this.props;

        return (
            <div className="card light-dark-bg">
                <CircleIcon value={CircleIconValue.Answer} />
                <div className="card-body px-sm-5">
                    <p>
                        <QuotationMarks width={16}>
                            <span className="mx-2 post">{answer.text}</span>
                        </QuotationMarks>
                    </p>
                    <div className="mt-3">
                        <DiscussButton
                            linkToCommentsUrl={buildAnswerUrl(questionId, questionSlug, answer.id, answer.slug)}
                            upvotes={answer.upvotes}
                            comments={answer.comments}
                        />
                    </div>
                </div>
            </div>
        );
    }
}
