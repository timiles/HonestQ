import * as React from 'react';
import { AnswerModel } from '../../server-models';
import { countNestedComments } from '../../utils/model-utils';
import { buildAnswerUrl } from '../../utils/route-utils';
import { parseDateWithTimeZoneOffset } from '../../utils/string-utils';
import EmbeddedContent from '../shared/EmbeddedContent';
import OrderByControl, { OrderByValue } from '../shared/OrderByControl';
import Source from '../shared/Source';
import DiscussButton from './DiscussButton';
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
    private static orderByComments(a: AnswerModel, b: AnswerModel): number {
        return countNestedComments(b.comments) - countNestedComments(a.comments);
    }

    private static switchOrderBy(orderBy: OrderByValue): (a: AnswerModel, b: AnswerModel) => number {
        switch (orderBy) {
            case OrderByValue.Newest: return this.orderByNewest;
            case OrderByValue.Upvotes: return this.orderByUpvotes;
            case OrderByValue.Comments: return this.orderByComments;
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
                            Order by: <OrderByControl value={orderByValue} onChange={this.handleOrder} />
                        </div>
                    }
                </div>
                <hr />
                <ul className="list-unstyled mt-3 mb-3">
                    {orderedAnswers.map((x: AnswerModel, i: number) =>
                        <li key={i} className="mb-4">
                            <div className="card">
                                <div className="circle-tag circle-tag-A" />
                                <div className="card-body px-5">
                                    <blockquote className="blockquote mb-0">
                                        <span className="post">{x.text}</span>
                                    </blockquote>
                                    <Source value={x.source} />
                                    <EmbeddedContent value={x.source} />
                                    <div className="mt-3">
                                        <DiscussButton
                                            linkToCommentsUrl={buildAnswerUrl(questionId, questionSlug, x.id, x.slug)}
                                            upvotes={x.reactionCounts ? x.reactionCounts[UpvoteButton.ReactionType] : 0}
                                            comments={x.comments}
                                        />
                                    </div>
                                </div>
                            </div>
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
