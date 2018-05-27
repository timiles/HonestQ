import * as React from 'react';
import { Link } from 'react-router-dom';
import { TopicModel } from '../../server-models';

export interface TopicProps {
    loading?: boolean;
    error?: string;
    urlFragment?: string;
    model?: TopicModel;
}

export default class Topic extends React.Component<TopicProps, {}> {

    constructor(props: TopicProps) {
        super(props);
    }

    public render() {
        const { loading, error, urlFragment, model } = this.props;
        return (
            <div className="col-md-6">
                {loading && <p>Loading...</p>}
                {error && <div className="alert alert-danger" role="alert">{error}</div>}
                {model && (
                    <div>
                        <h1>{model.name}</h1>
                        {this.props.children}
                        {model.statements.map((x, i) =>
                            <div key={`statement_${i}`}>
                                <Link to={`/${urlFragment}/${x.id}`} className="btn btn-lg btn-default" role="button">
                                    &ldquo;{x.text}&rdquo; &rarr;
                                </Link>
                            </div>)}
                    </div>
                )}
            </div>
        );
    }
}
