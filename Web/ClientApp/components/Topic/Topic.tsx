import * as React from 'react';
import { TopicModel } from '../../server-models';

export interface TopicProps {
    loading?: boolean;
    error?: string;
    model?: TopicModel;
}

export default class Topic extends React.Component<TopicProps, {}> {

    constructor(props: TopicProps) {
        super(props);
    }

    public render() {
        const { loading, error, model } = this.props;
        return (
            <div className="col-md-6">
                {loading && <p>Loading...</p>}
                {error && <div className="alert alert-danger" role="alert">{error}</div>}
                {model && (
                    <div>
                        <h1>{model.name}</h1>
                        {this.props.children}
                        {model.statements.map((x, i) => <h2 key={`statement_${i}`}>&ldquo;{x.text}&rdquo;</h2>)}
                    </div>
                )}
            </div>
        );
    }
}
