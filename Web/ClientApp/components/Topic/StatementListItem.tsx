import * as React from 'react';
import { Link } from 'react-router-dom';
import { StatementListItemModel } from '../../server-models';

type StatementListItemProps = StatementListItemModel
    & { topicSlug: string };

export default class StatementListItem extends React.Component<StatementListItemProps, {}> {

    constructor(props: StatementListItemProps) {
        super(props);
    }

    public render() {
        const { topicSlug, id, slug, text } = this.props;

        return (
            <Link
                to={`/${topicSlug}/${id}/${slug}`}
                className="btn btn-lg btn-outline-secondary statement statement-list-item"
            >
                {text}
            </Link>
        );
    }
}
