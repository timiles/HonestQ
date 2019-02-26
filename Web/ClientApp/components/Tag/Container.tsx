import * as React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { ApplicationState } from '../../store';
import { ActionStatus, getActionStatus } from '../../store/ActionStatuses';
import * as TagStore from '../../store/Tag';
import NewQuestion from '../QuestionForm/NewQuestion';
import ActionStatusDisplay from '../shared/ActionStatusDisplay';
import TagsList from '../Tags/List';
import Tag from './Tag';

interface OwnProps {
    tagSlug: string;
}
type ContainerProps = TagStore.ContainerState
    & typeof TagStore.actionCreators
    & OwnProps
    & {
        getTagStatus: ActionStatus,
    };

class Container extends React.Component<ContainerProps, {}> {

    constructor(props: ContainerProps) {
        super(props);

        this.handleWatch = this.handleWatch.bind(this);

        // This will also run on server side render
        props.getTag(props.tagSlug);
    }

    public render() {
        const { tag } = this.props;

        const numberOfQuestionsInTag = tag ? tag.questions.length : 0;

        return (
            <>
                {this.renderHelmetTags()}

                <div className="row">
                    <div className="col-lg-3">
                        <TagsList selectedTagSlugs={tag && tag.slug ? [tag.slug] : []} />
                    </div>
                    <div className="col-lg-6">
                        <div className="row">
                            <div className="col-md-12">
                                <ActionStatusDisplay {...this.props.getTagStatus} />
                                {tag &&
                                    <>
                                        <Tag tag={tag} onWatch={this.handleWatch} />
                                        {numberOfQuestionsInTag === 0 &&
                                            <>
                                                <h2>Start the conversation</h2>
                                                <NewQuestion tagValue={tag} />
                                            </>}
                                    </>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    private renderHelmetTags() {
        const { tag, tagSlug } = this.props;

        if (!tag || tag.slug !== tagSlug) {
            return (
                <Helmet>
                    <title>⏳ 𝘓𝘰𝘢𝘥𝘪𝘯𝘨...</title>
                </Helmet>
            );
        }

        const pageTitle = `HonestQ: ${tag.name}`;
        const canonicalUrl = `https://www.honestq.com/tags/${tag.slug}`;

        const ogTitle = `Questions about ${tag.name}`;
        const ogDescription = `View questions about ${tag.name}, ask your own, and join the debate.`;

        return (
            <Helmet>
                <title>{pageTitle}</title>
                <link rel="canonical" href={canonicalUrl} />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:title" content={ogTitle} />
                <meta property="og:description" content={ogDescription} />
                <meta property="og:image" content="https://www.honestq.com/android-chrome-256x256.png" />
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:site" content="@HonestQ_com" />
            </Helmet>
        );
    }

    private handleWatch(on: boolean): void {
        this.props.updateWatch(on, this.props.tagSlug);
    }
}

export default connect(
    (state: ApplicationState, ownProps: OwnProps) => ({
        ...state.tag,
        getTagStatus: getActionStatus(state, 'GET_TAG'),
    }),
    TagStore.actionCreators,
)(Container);
