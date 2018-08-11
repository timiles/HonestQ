import * as React from 'react';
import { Link } from 'react-router-dom';
import { StatementListItemModel, TopicValueModel } from '../../server-models';
import StatementTypeView from '../shared/StatementTypeView';
import AgreementRatingBarChart from './AgreementRatingBarChart';
import NewStatement from './NewStatement';
import StatementTypeInput from './StatementTypeInput';

interface Props {
    statements: StatementListItemModel[];
    topicValue: TopicValueModel;
}

interface State {
    typeFilter?: string;
}

export default class StatementList extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {};

        this.handleChangeTypeFilter = this.handleChangeTypeFilter.bind(this);
    }

    public render() {
        let { statements } = this.props;
        if (statements.length === 0) {
            return null;
        }
        const { topicValue } = this.props;
        const { typeFilter } = this.state;

        if (typeFilter) {
            statements = statements.filter((x) => x.type === typeFilter);
        }

        return (
            <>
                <h3>Here's a list of things people might say:</h3>
                <form className="form-inline my-2 float-right">
                    <label className="my-1 mr-2">Filter</label>
                    <StatementTypeInput includeAll={true} onChange={this.handleChangeTypeFilter} />
                </form>
                <ul className="list-unstyled">
                    {statements.map((x, i) =>
                        <li key={`statement_${i}`}>
                            <Link
                                to={`/statements/${x.id}/${x.slug}`}
                                className="btn btn-lg btn-outline-secondary statement-list-item"
                            >
                                <StatementTypeView value={x.type} />
                                <span className="statement">{x.text}</span>
                                {x.agreementRatings && <AgreementRatingBarChart {...x.agreementRatings} />}
                            </Link>
                        </li>)}
                    <li>
                        <NewStatement topicValue={topicValue} />
                    </li>
                </ul>
            </>);
    }

    private handleChangeTypeFilter(event: React.FormEvent<HTMLButtonElement>): void {
        this.setState({ typeFilter: event.currentTarget.value });
    }
}
