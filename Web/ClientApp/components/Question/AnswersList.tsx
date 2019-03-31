import * as React from 'react';
import { AnswerModel } from '../../server-models';
import { parseDateWithTimeZoneOffset } from '../../utils/string-utils';
import OrderByControl, { OrderByValue } from '../shared/OrderByControl';
import AnswerSummary from './AnswerSummary';
import NewAnswer from './NewAnswer';
import UpvoteButton from './UpvoteButton';

interface Props {
    questionId: number;
    questionSlug: string;
    answers: AnswerModel[];
}

interface State {
    orderByValue: OrderByValue;
}

export default class AnswersList extends React.Component<Props, State> {

    private static orderByNewest(a: AnswerModel, b: AnswerModel): number {
        return parseDateWithTimeZoneOffset(b.postedAt).getTime() - parseDateWithTimeZoneOffset(a.postedAt).getTime();
    }
    private static orderByUpvotes(a: AnswerModel, b: AnswerModel): number {
        return (b.reactionCounts ? b.reactionCounts[UpvoteButton.ReactionType] || 0 : 0) -
            (a.reactionCounts ? a.reactionCounts[UpvoteButton.ReactionType] || 0 : 0);
    }

    private static switchOrderBy(orderBy: OrderByValue): (a: AnswerModel, b: AnswerModel) => number {
        switch (orderBy) {
            case OrderByValue.Newest: return this.orderByNewest;
            case OrderByValue.Upvotes: return this.orderByUpvotes;
            default: throw new Error(`Unexpected orderBy: ${orderBy}.`);
        }
    }

    private static orderAnswers(answers: AnswerModel[], orderBy: OrderByValue): AnswerModel[] {
        return answers.sort(this.switchOrderBy(orderBy));
    }

    constructor(props: Props) {
        super(props);

        this.state = { orderByValue: OrderByValue.Upvotes };

        this.handleOrder = this.handleOrder.bind(this);
    }

    public render() {
        const { questionId, questionSlug, answers } = this.props;
        const { orderByValue } = this.state;

        const orderedAnswers = AnswersList.orderAnswers(answers, orderByValue);

        return (
            <>
                <div className="clearfix">
                    <div className="float-right">
                        <NewAnswer questionId={questionId} />
                    </div>
                    {answers.length > 0 &&
                        <div>
                            <label>Order by:</label> <OrderByControl value={orderByValue} onChange={this.handleOrder} />
                        </div>
                    }
                </div>
                <hr />
                <ul className="list-unstyled mt-3 mb-3">
                    {orderedAnswers.map((x: AnswerModel, i: number) =>
                        <li key={i} className="mb-4">
                            <AnswerSummary questionId={questionId} questionSlug={questionSlug} answer={x} />
                        </li>)
                    }
                </ul>
                {answers.length >= 5 &&
                    <div className="clearfix">
                        <div className="float-right">
                            <NewAnswer questionId={questionId} />
                        </div>
                    </div>
                }
            </>
        );
    }

    private handleOrder(value: OrderByValue): void {
        this.setState({ orderByValue: value });
    }
}
