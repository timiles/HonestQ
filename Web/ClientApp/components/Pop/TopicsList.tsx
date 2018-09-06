import * as React from 'react';
import { Link } from 'react-router-dom';
import { TopicValueStanceModel } from '../../server-models';

interface Props {
    topics: TopicValueStanceModel[];
}

export default class TopicsList extends React.Component<Props, {}> {

    public render() {
        const { topics } = this.props;

        return (
            <ul className="topics-list">
                <li className="mr-1 mt-1">Topics:</li>
                {topics.map((x, i) =>
                    <li key={`topic${i}`} className="mr-1 mb-1">
                        <Link
                            to={`/topics/${x.slug}`}
                            className={`btn btn-sm btn-outline-secondary ${this.getStanceClass(x)}`}
                        >
                            {x.name}
                        </Link>
                    </li>)}
            </ul>
        );
    }

    private getStanceClass(topic: TopicValueStanceModel): string {
        return (topic.stance) ? `stance stance-${topic.stance.toLowerCase()}` : '';
    }
}
