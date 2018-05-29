import * as React from 'react';
import { StatementModel } from '../../server-models';
import Comment from './Comment';

export interface StatementProps {
    loading?: boolean;
    error?: string;
    statementId?: number;
    model?: StatementModel;
}

export default class Statement extends React.Component<StatementProps, {}> {

    constructor(props: StatementProps) {
        super(props);
    }

    public render() {
        const { loading, model } = this.props;
        return (
            <>
                {loading && <p>Loading...</p>}
                {model && (
                    <div>
                        <h1>{model.text}</h1>
                        {this.props.children}
                        <ol>
                            {model.comments.map((x, i) => <li key={`comment_${i}`}><Comment {...x} /></li>)}
                        </ol>
                    </div>
                )}
            </>
        );
    }
}
