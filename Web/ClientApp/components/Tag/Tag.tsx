import * as React from 'react';
import { Link } from 'react-router-dom';
import { LoggedInUserContext } from '../../LoggedInUserContext';
import { TagModel } from '../../server-models';
import { isUserInRole } from '../../utils/auth-utils';
import ShortLink from '../shared/ShortLink';
import WatchControl from '../shared/WatchControl';
import QuestionList from './QuestionList';

export interface TagProps {
    loading?: boolean;
    error?: string;
    slug?: string;
    model?: TagModel;
}

type Props = TagProps & {
    onWatch: (on: boolean) => void;
};

export default class Tag extends React.Component<Props, {}> {

    constructor(props: Props) {
        super(props);

        this.handleWatch = this.handleWatch.bind(this);
    }

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
        const { name, description, moreInfoUrl, questions, watchCount, isWatchedByLoggedInUser } = model;
        const tagValue = { name, slug };
        return (
            <>
                <div className="card bg-light">
                    <div className="card-body">
                        <div className="float-right">
                            <WatchControl
                                onWatch={this.handleWatch}
                                count={watchCount}
                                isWatchedByLoggedInUser={isWatchedByLoggedInUser}
                            />
                            <LoggedInUserContext.Consumer>
                                {(user) => isUserInRole(user, 'Admin') &&
                                    <div><Link to={`/admin/edit/tags/${slug}`} className="float-right">Edit</Link></div>
                                }
                            </LoggedInUserContext.Consumer>
                        </div>
                        <h1>{name}</h1>
                    </div>
                </div>
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

    private handleWatch(on: boolean): void {
        this.props.onWatch(on);
    }
}
