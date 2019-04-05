import * as React from 'react';
import { AnswerModel } from '../../server-models';
import { buildAnswerUrl } from '../../utils/route-utils';
import CircleIcon, { CircleIconValue } from '../shared/CircleIcon';
import DiscussButton from './DiscussButton';
import UpvoteButton from './UpvoteButton';

interface Props {
    questionId: number;
    questionSlug: string;
    answer: AnswerModel;
}

export default class AnswerSummary extends React.Component<Props> {

    public render() {
        const { questionId, questionSlug, answer } = this.props;

        return (
            <div className="card">
                <CircleIcon value={CircleIconValue.Answer} />
                <div className="card-body px-sm-5">
                    <blockquote className="blockquote mb-0">
                        <span className="post quote-marks">{answer.text}</span>
                    </blockquote>
                    <div className="mt-3">
                        <DiscussButton
                            linkToCommentsUrl={buildAnswerUrl(questionId, questionSlug, answer.id, answer.slug)}
                            upvotes={answer.reactionCounts ? answer.reactionCounts[UpvoteButton.ReactionType] : 0}
                            comments={answer.comments}
                        />
                    </div>
                </div>
            </div>
        );
    }
}
