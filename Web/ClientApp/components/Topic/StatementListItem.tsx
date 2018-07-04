import * as React from 'react';
import { Link } from 'react-router-dom';
import { StatementListItemModel } from '../../server-models';
import AgreementRatingBarChart from './AgreementRatingBarChart';
import StanceView from './StanceView';

type StatementListItemProps = StatementListItemModel
    & { topicSlug: string };

export default class StatementListItem extends React.Component<StatementListItemProps, {}> {

    constructor(props: StatementListItemProps) {
        super(props);
    }

    public render() {
        const { topicSlug, id, slug, text, stance, agreementRatings } = this.props;

        return (
            <Link
                to={`/${topicSlug}/${id}/${slug}`}
                className="btn btn-lg btn-outline-secondary statement-list-item"
            >
                {stance && <StanceView value={stance} />}
                <span className="statement">{text}</span>
                {agreementRatings && <AgreementRatingBarChart {...agreementRatings} />}
            </Link>
        );
    }
}
