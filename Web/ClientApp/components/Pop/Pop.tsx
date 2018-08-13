import * as React from 'react';
import { Link } from 'react-router-dom';
import { PopModel } from '../../server-models';
import { extractUrlFromText, isUserInRole } from '../../utils';
import { LoggedInUserContext } from '../LoggedInUserContext';
import EmbeddedContentCard from '../shared/EmbeddedContentCard';
import PopTypeView from '../shared/PopTypeView';
import CommentList from './CommentList';
import NewComment from './NewComment';

export interface PopProps {
    loading?: boolean;
    error?: string;
    popId?: number;
    model?: PopModel;
}

export default class Pop extends React.Component<PopProps, {}> {

    public render() {
        const { loading, error, popId, model } = this.props;

        return (
            <>
                {loading && <p>Loading...</p>}
                {error && <div className="alert alert-danger" role="alert">{error}</div>}
                {model && popId && (
                    <div>
                        <LoggedInUserContext.Consumer>
                            {(user) => isUserInRole(user, 'Admin') &&
                                <Link to={`/admin/edit/pops/${popId}`} className="float-right">
                                    Edit
                                </Link>
                            }
                        </LoggedInUserContext.Consumer>
                        <h4>
                            <PopTypeView value={model.type} />
                            <span className={`pop pop-${model.type.toLowerCase()}`}>{model.text}</span>
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
                                Please only post Sources which prove the request.
                            </div>
                        }
                        {model.source && this.renderSource(model.source)}
                        <NewComment
                            parentCommentId={null}
                            popId={popId}
                            type={model!.type}
                        />
                        <CommentList
                            comments={model.comments}
                            popId={popId!}
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
