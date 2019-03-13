import * as React from 'react';
import { Link } from 'react-router-dom';
import { TagValueModel } from '../../server-models';

interface Props {
    tags: TagValueModel[];
}

export default class QuestionTagsList extends React.Component<Props, {}> {

    public render() {
        const { tags } = this.props;
        if (tags.length === 0) {
            return null;
        }

        return (
            <ul className="list-inline">
                <li className="mr-1 mt-1 list-inline-item">Tags:</li>
                {tags.map((x: TagValueModel, i: number) =>
                    <li key={i} className="mr-1 mb-1 list-inline-item">
                        <Link
                            to={`/tags/${x.slug}`}
                            className="btn btn-sm btn-outline-secondary"
                        >
                            {x.name}
                        </Link>
                    </li>)}
            </ul>
        );
    }
}
