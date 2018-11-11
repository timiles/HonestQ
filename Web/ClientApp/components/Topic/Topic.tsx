import * as React from 'react';
import { Link } from 'react-router-dom';
import { LoggedInUserContext } from '../../LoggedInUserContext';
import { TopicModel } from '../../server-models';
import { isUserInRole } from '../../utils';
import ShortLink from '../shared/ShortLink';
import QuestionList from './QuestionList';

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
                {loading && <p>⏳ <i>Loading...</i></p>}
                {error && <div className="alert alert-danger" role="alert">{error}</div>}
                {slug && model && this.renderModel(slug!, model!)}
            </>
        );
    }

    private renderModel(slug: string, model: TopicModel) {
        const { name, summary, moreInfoUrl, questions } = model;
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
                                <ShortLink to={moreInfoUrl} />
                            </>
                        }
                    </div>
                }
                <QuestionList questions={questions} topicValue={topicValue} />
            </>
        );
    }
}
