import * as React from 'react';
import { Link } from 'react-router-dom';
import { TopicModel } from '../../server-models';

export interface TopicProps {
    loading?: boolean;
    error?: string;
    slug?: string;
    model?: TopicModel;
}

export default class Topic extends React.Component<TopicProps, {}> {

    constructor(props: TopicProps) {
        super(props);
    }

    public render() {
        const { loading, error, slug, model } = this.props;
        return (
            <>
                {loading && <p>Loading...</p>}
                {error && <div className="alert alert-danger" role="alert">{error}</div>}
                {model && (
                    <>
                        <h1>{model.name}</h1>
                        {model.statements.length > 0 &&
                            <h3>Here's a list of things people might say:</h3>
                        }
                        <ul className="list-unstyled">
                            {model.statements.map((x, i) =>
                                <li key={`statement_${i}`}>
                                    <Link
                                        to={`/${slug}/${x.id}/${x.slug}`}
                                        className="btn btn-lg btn-default statement statement-list-item"
                                    >
                                        {x.text}
                                    </Link>
                                </li>)}
                        </ul>
                        {this.props.children}
                    </>
                )}
            </>
        );
    }
}
