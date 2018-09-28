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
            <ul className="topics-list">
                <li className="mr-1 mt-1">Topics:</li>
                {topics.map((x, i) =>
                    <li key={`topic_${i}`} className="mr-1 mb-1">
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