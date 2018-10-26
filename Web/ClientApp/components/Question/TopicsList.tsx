import * as React from 'react';
import { Link } from 'react-router-dom';
import { TopicValueModel } from '../../server-models';

interface Props {
    topics: TopicValueModel[];
}

export default class TopicsList extends React.Component<Props, {}> {

    public render() {
        const { topics } = this.props;
        if (topics.length === 0) {
            return null;
        }

        return (
            <ul className="list-inline">
                <li className="mr-1 mt-1 list-inline-item">Topics:</li>
                {topics.map((x: TopicValueModel, i: number) =>
                    <li key={i} className="mr-1 mb-1 list-inline-item">
                        <Link
                            to={`/topics/${x.slug}`}
                            className="btn btn-sm btn-outline-secondary"
                        >
                            {x.name}
                        </Link>
                    </li>)}
            </ul>
        );
    }
}
