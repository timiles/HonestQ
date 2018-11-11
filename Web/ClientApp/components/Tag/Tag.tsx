import * as React from 'react';
import { Link } from 'react-router-dom';
import { LoggedInUserContext } from '../../LoggedInUserContext';
import { TagModel } from '../../server-models';
import { isUserInRole } from '../../utils/auth-utils';
import ShortLink from '../shared/ShortLink';
import QuestionList from './QuestionList';

export interface TagProps {
    loading?: boolean;
    error?: string;
    slug?: string;
    model?: TagModel;
}

export default class Tag extends React.Component<TagProps, {}> {

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

    private renderModel(slug: string, model: TagModel) {
        const { name, description, moreInfoUrl, questions } = model;
        const tagValue = { name, slug };
        return (
            <>
                <LoggedInUserContext.Consumer>
                    {(user) => isUserInRole(user, 'Admin') &&
                        <Link to={`/admin/edit/tags/${slug}`} className="float-right">Edit</Link>
                    }
                </LoggedInUserContext.Consumer>
                <h1>{name}</h1>
                {(description || moreInfoUrl) &&
                    <div className="bs-callout bs-callout-info">
                        {description &&
                            <>
                                <h4>Description</h4>
                                <p>{description}</p>
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
                <QuestionList questions={questions} tagValue={tagValue} />
            </>
        );
    }
}
