import * as React from 'react';
import { StatementListItemModel } from '../../server-models';
import StanceInput from './StanceInput';
import StatementListItem from './StatementListItem';

interface Props {
    statements: StatementListItemModel[];
    topicSlug: string;
}

interface State {
    stanceFilter?: string;
}

export default class StatementList extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {};

        this.handleChangeStanceFilter = this.handleChangeStanceFilter.bind(this);
    }

    public render() {
        const { topicSlug } = this.props;
        const { stanceFilter } = this.state;
        let { statements } = this.props;
        const unfilteredStatementCount = statements.length;

        if (stanceFilter) {
            statements = statements.filter((x) => x.stance === stanceFilter);
        }

        return (
            <>
                {unfilteredStatementCount > 0 &&
                    <h3>Here's a list of things people might say:</h3>
                }
                <form className="form-inline my-2 float-right">
                    <label className="my-1 mr-2">Filter</label>
                    <StanceInput includeAll={true} onChange={this.handleChangeStanceFilter} />
                </form>
                <ul className="list-unstyled">
                    {statements.map((x, i) =>
                        <li key={`statement_${i}`}>
                            <StatementListItem topicSlug={topicSlug} {...x} />
                        </li>)}
                </ul>
            </>);
    }

    private handleChangeStanceFilter(event: React.FormEvent<HTMLButtonElement>): void {
        this.setState({ stanceFilter: event.currentTarget.value });
    }
}
