import * as React from 'react';
import { Link } from 'react-router-dom';
import { LoggedInUserContext } from '../../LoggedInUserContext';
import { TagModel } from '../../server-models';
import { isUserInRole } from '../../utils/auth-utils';
import TextWithShortLinks from '../shared/TextWithShortLinks';
import WatchControl from '../shared/WatchControl';
import QuestionList from './QuestionList';

interface TagProps {
    tag: TagModel;
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
        const { tag } = this.props;
        const { slug, name, description, moreInfoUrl, questions, watching } = tag;
        const tagValue = { name, slug };
        return (
            <>
                <div className="card bg-light">
                    <div className="card-body">
                        <div className="float-right">
                            <WatchControl
                                onWatch={this.handleWatch}
                                watching={watching}
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
                                <TextWithShortLinks value={moreInfoUrl} />
                            </>
                        }
                    </div>
                }
                <hr />
                {questions.length === 0 &&
                    <h2>Start the conversation</h2>
                }
                <QuestionList questions={questions} tagValue={tagValue} />
            </>
        );
    }

    private handleWatch(on: boolean): void {
        this.props.onWatch(on);
    }
}
