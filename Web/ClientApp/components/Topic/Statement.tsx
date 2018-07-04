import * as React from 'react';
import { StatementModel } from '../../server-models';
import { extractUrlFromText } from '../../utils';
import EmbeddedContentCard from '../shared/EmbeddedContentCard';
import Comment from './Comment';
import StanceView from './StanceView';

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
        const { loading, error, model } = this.props;

        return (
            <>
                {loading && <p>Loading...</p>}
                {error && <div className="alert alert-danger" role="alert">{error}</div>}
                {model && (
                    <div>
                        <h4>
                            {model.stance && <StanceView value={model.stance} />}
                            <span className="statement">{model.text}</span>
                        </h4>
                        {model.source && this.renderSource(model.source)}
                        {this.props.children}
                        <ol>
                            {model.comments.map((x, i) => <li key={`comment_${i}`}><Comment {...x} /></li>)}
                        </ol>
                    </div>
                )}
            </>
        );
    }

    private renderSource(source: string) {
        const extractedUrl = extractUrlFromText(source);
        return (
            <>
                <p><small>Source: {source}</small></p>
                {extractedUrl && <EmbeddedContentCard url={extractedUrl} />}
            </>
        );
    }
}
