import * as React from 'react';
import { Link } from 'react-router-dom';
import { StatementModel } from '../../server-models';
import { extractUrlFromText, isUserInRole } from '../../utils';
import { LoggedInUserContext } from '../LoggedInUserContext';
import EmbeddedContentCard from '../shared/EmbeddedContentCard';
import StatementTypeView from '../shared/StatementTypeView';
import CommentList from './CommentList';
import NewComment from './NewComment';

export interface StatementProps {
    loading?: boolean;
    error?: string;
    statementId?: number;
    model?: StatementModel;
}

export default class Statement extends React.Component<StatementProps, {}> {

    public render() {
        const { loading, error, statementId, model } = this.props;

        return (
            <>
                {loading && <p>Loading...</p>}
                {error && <div className="alert alert-danger" role="alert">{error}</div>}
                {model && statementId && (
                    <div>
                        <LoggedInUserContext.Consumer>
                            {(user) => isUserInRole(user, 'Admin') &&
                                <Link to={`/admin/edit/statements/${statementId}`} className="float-right">
                                    Edit
                                </Link>
                            }
                        </LoggedInUserContext.Consumer>
                        <h4>
                            {model.type && <StatementTypeView value={model.type} />}
                            <span className="statement">{model.text}</span>
                        </h4>
                        <ul className="topics-list">
                            <li className="mr-1 mt-1">Topics:</li>
                            {model.topics.map((x, i) =>
                                <li key={`topic${i}`} className="mr-1 mb-1">
                                    <Link to={`/topics/${x.slug}`} className="btn btn-sm btn-outline-secondary">
                                        {x.name}
                                    </Link>
                                </li>)}
                        </ul>
                        {model.type === 'ProveIt' &&
                            <div className="alert alert-info" role="alert">
                                This is a <strong>Request for Proof</strong>.
                                Please only post Sources which prove the statement.
                            </div>
                        }
                        {model.source && this.renderSource(model.source)}
                        <NewComment
                            parentCommentId={null}
                            statementId={statementId}
                            type={model!.type}
                        />
                        <CommentList
                            comments={model.comments}
                            statementId={statementId!}
                        />
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
