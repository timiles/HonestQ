import * as React from 'react';
import { Link } from 'react-router-dom';
import { TopicModel } from '../../server-models';
import { isUserInRole } from '../../utils';
import { LoggedInUserContext } from '../LoggedInUserContext';
import PopList from './PopList';

export interface TopicProps {
    loading?: boolean;
    error?: string;
    slug?: string;
    model?: TopicModel;
}

export default class Topic extends React.Component<TopicProps, {}> {

    public render() {
        const { loading, error, slug, model } = this.props;
        return (
            <>
                {loading && <p>Loading...</p>}
                {error && <div className="alert alert-danger" role="alert">{error}</div>}
                {slug && model && this.renderModel(slug!, model!)}
            </>
        );
    }

    private renderModel(slug: string, model: TopicModel) {
        const { name, summary, moreInfoUrl, pops } = model;
        const topicValue = { name, slug };
        return (
            <>
                <LoggedInUserContext.Consumer>
                    {(user) => isUserInRole(user, 'Admin') &&
                        <Link to={`/admin/edit/topics/${slug}`} className="float-right">Edit</Link>
                    }
                </LoggedInUserContext.Consumer>
                <h1>{name}</h1>
                {(summary || moreInfoUrl) &&
                    <div className="bs-callout bs-callout-info">
                        {summary &&
                            <>
                                <h4>Summary</h4>
                                <p>{summary}</p>
                            </>
                        }
                        {moreInfoUrl &&
                            <>
                                <h4>More info</h4>
                                <Link to={moreInfoUrl} target="_blank" rel="noopener noreferrer">{moreInfoUrl}</Link>
                            </>
                        }
                    </div>
                }
                <PopList pops={pops} topicValue={topicValue} />
            </>
        );
    }
}
