import * as React from 'react';
import { StatementModel } from '../../server-models';

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
            <div className="col-md-6">
                {loading && <p>Loading...</p>}
                {model && (
                    <div>
                        <h1>{model.text}</h1>
                        {this.props.children}
                        <div>
                            {model.comments.map((x, i) =>
                                <div key={`comment_${i}`}>
                                    <p>{x.text}</p>
                                </div>)}
                        </div>
                    </div>
                )}
            </div>
        );
    }
}
