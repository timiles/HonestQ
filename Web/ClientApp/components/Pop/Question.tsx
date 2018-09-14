import * as React from 'react';
import { Link } from 'react-router-dom';
import { CommentModel, PopModel } from '../../server-models';
import { isUserInRole } from '../../utils';
import { LoggedInUserContext } from '../LoggedInUserContext';
import PopTypeView from '../shared/PopTypeView';
import AgreementRatingBarChart from '../Topic/AgreementRatingBarChart';
import NewComment from './NewComment';
import TopicsList from './TopicsList';

interface Props {
    loading?: boolean;
    error?: string;
    popId?: number;
    model?: PopModel;
}

export default class Question extends React.Component<Props, {}> {

    public render() {
        const { popId, model } = this.props;

        if (!model || !popId) {
            return null;
        }

        return (
            <div>
                <LoggedInUserContext.Consumer>
                    {(user) => isUserInRole(user, 'Admin') &&
                        <Link to={`/admin/edit/pops/${popId}`} className="float-right">
                            Edit
                                </Link>
                    }
                </LoggedInUserContext.Consumer>
                <h4>
                    <PopTypeView value={model.type} />
                    <span className={`pop pop-${model.type.toLowerCase()}`}>{model.text}</span>
                </h4>
                <TopicsList topics={model.topics} />
                <ol className="list-unstyled mt-3 mb-3">
                    {model.comments.map((x, i) => <li key={`comment_${i}`} className="mb-2">
                        <Link
                            to={`/pops/${popId}/${model.slug}/${x.id}`}
                            className="btn btn-lg btn-outline-secondary pop-list-item"
                        >
                            <PopTypeView value="Answer" />
                            <span className="pop pop-statement">{x.text}</span>
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
                    <NewComment
                        parentCommentId={null}
                        popId={popId}
                        type={model!.type}
                    />
                </div>
            </div>
        );
    }

    private isCitationNeeded(answer: CommentModel): boolean {
        return !answer.source && (answer.comments.filter((x) => x.source).length === 0);
    }

    private renderAgreementRating(answer: CommentModel): any {
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
