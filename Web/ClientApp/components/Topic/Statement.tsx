import * as React from 'react';
import { Link } from 'react-router-dom';
import { StatementModel } from '../../server-models';
import { extractUrlFromText, isUserInRole } from '../../utils';
import { LoggedInUserContext } from '../LoggedInUserContext';
import EmbeddedContentCard from '../shared/EmbeddedContentCard';
import CommentList from './CommentList';
import StanceView from './StanceView';

type Props = StatementProps
    & { topicSlug: string; };

export interface StatementProps {
    loading?: boolean;
    error?: string;
    statementId?: number;
    model?: StatementModel;
}

export default class Statement extends React.Component<Props, {}> {

    public render() {
        const { loading, error, topicSlug, statementId, model } = this.props;

        return (
            <>
                {loading && <p>Loading...</p>}
                {error && <div className="alert alert-danger" role="alert">{error}</div>}
                {model && (
                    <div>
                        <LoggedInUserContext.Consumer>
                            {(user) => isUserInRole(user, 'Admin') &&
                                <Link to={`/admin/edit/${topicSlug}/${statementId}`} className="float-right">
                                    Edit
                                </Link>
                            }
                        </LoggedInUserContext.Consumer>
                        <h4>
                            {model.stance && <StanceView value={model.stance} />}
                            <span className="statement">{model.text}</span>
                        </h4>
                        {model.source && this.renderSource(model.source)}
                        {this.props.children}
                        <CommentList comments={model.comments} />
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
