import * as React from 'react';
import { Link } from 'react-router-dom';
import { TopicModel } from '../../server-models';
import { isUserInRole } from '../../utils';
import { LoggedInUserContext } from '../LoggedInUserContext';

export interface TopicProps {
    loading?: boolean;
    error?: string;
    slug?: string;
    model?: TopicModel;
}

export default class Topic extends React.Component<TopicProps, {}> {

    constructor(props: TopicProps) {
        super(props);
    }

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
        const { name, summary, moreInfoUrl, statements } = model;
        return (
            <>
                <LoggedInUserContext.Consumer>
                    {(user) => isUserInRole(user, 'Admin') &&
                        <Link to={`/admin/editTopic/${slug}`} className="float-right">Edit</Link>
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
                                <Link to={moreInfoUrl} target="_blank">{moreInfoUrl}</Link>
                            </>
                        }
                    </div>
                }
                {statements.length > 0 &&
                    <h3>Here's a list of things people might say:</h3>
                }
                <ul className="list-unstyled">
                    {statements.map((x, i) =>
                        <li key={`statement_${i}`}>
                            <Link
                                to={`/${slug}/${x.id}/${x.slug}`}
                                className="btn btn-lg btn-outline-secondary statement statement-list-item"
                            >
                                {x.text}
                            </Link>
                        </li>)}
                </ul>
                {this.props.children}
            </>
        );
    }
}
