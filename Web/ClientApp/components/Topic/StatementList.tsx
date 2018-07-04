import * as React from 'react';
import { StatementListItemModel } from '../../server-models';
import StatementListItem from './StatementListItem';

interface Props {
    statements: StatementListItemModel[];
    topicSlug: string;
}

export default class StatementList extends React.Component<Props, {}> {

    public render() {
        const { statements, topicSlug } = this.props;

        return (
            <>
                {statements.length > 0 &&
                    <h3>Here's a list of things people might say:</h3>
                }
                <ul className="list-unstyled">
                    {statements.map((x, i) =>
                        <li key={`statement_${i}`}>
                            <StatementListItem topicSlug={topicSlug} {...x} />
                        </li>)}
                </ul>
            </>);
    }
}
