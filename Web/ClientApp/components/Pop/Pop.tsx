import * as React from 'react';
import { Link } from 'react-router-dom';
import { PopModel } from '../../server-models';
import { extractUrlFromText, isUserInRole } from '../../utils';
import { LoggedInUserContext } from '../LoggedInUserContext';
import EmbeddedContentCard from '../shared/EmbeddedContentCard';
import PopTypeView from '../shared/PopTypeView';
import CommentList from './CommentList';
import NewComment from './NewComment';
import TopicsList from './TopicsList';

export interface PopProps {
    loading?: boolean;
    error?: string;
    questionId?: number;
    model?: PopModel;
}

export default class Pop extends React.Component<PopProps, {}> {

    public render() {
        const { questionId, model } = this.props;

        if (!model || !questionId) {
            return null;
        }

        return (
            <div>
                <LoggedInUserContext.Consumer>
                    {(user) => isUserInRole(user, 'Admin') &&
                        <Link to={`/admin/edit/pops/${questionId}`} className="float-right">
                            Edit
                                </Link>
                    }
                </LoggedInUserContext.Consumer>
                <h4>
                    <PopTypeView value={model.type} />
                    <span className={`pop pop-${model.type.toLowerCase()}`}>{model.text}</span>
                </h4>
                <TopicsList topics={model.topics} />
                {model.type === 'RequestForProof' &&
                    <div className="alert alert-info" role="alert">
                        This is a <strong>Request for Proof</strong>.
                        Please only post Sources which prove the request.
                            </div>
                }
                {model.source && this.renderSource(model.source)}
                <div>
                    <NewComment
                        parentCommentId={null}
                        questionId={questionId}
                        type={model!.type}
                    />
                </div>
                <CommentList
                    comments={model.comments}
                    questionId={questionId!}
                />
            </div>
        );
    }

    private renderSource(source: string) {
        const extractedUrl = extractUrlFromText(source);
        return (
            <div>
                <p><small>Source: {source}</small></p>
                {extractedUrl && <EmbeddedContentCard url={extractedUrl} />}
            </div>
        );
    }
}
