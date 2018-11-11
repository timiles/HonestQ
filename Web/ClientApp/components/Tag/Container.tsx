import * as React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { ApplicationState } from '../../store';
import * as TagStore from '../../store/Tag';
import NewQuestion from '../QuestionForm/NewQuestion';
import TagsList from '../Tags/List';
import Tag from './Tag';

type ContainerProps = TagStore.ContainerState
    & typeof TagStore.actionCreators
    & { tagSlug: string };

class Container extends React.Component<ContainerProps, {}> {

    public componentWillMount() {
        // This will also run on server side render
        this.setUp(this.props);
    }

    public componentWillReceiveProps(nextProps: ContainerProps) {
        this.setUp(nextProps);
    }

    public render() {
        const { tag } = this.props;

        // REVIEW: Is there a better way to handle this?
        if (!tag) {
            return false;
        }

        const numberOfQuestionsInTag = tag.model ? tag.model!.questions.length : 0;

        return (
            <>
                {this.renderHelmetTags()}

                <div className="row">
                    <div className="col-lg-3">
                        <TagsList selectedTagSlugs={[tag.slug]} />
                    </div>
                    <div className="col-lg-6">
                        <div className="row">
                            <div className="col-md-12">
                                <Tag {...tag} />
                                {tag.model && numberOfQuestionsInTag === 0 &&
                                    <>
                                        <h2>Start the conversation</h2>
                                        <NewQuestion tagValue={tag.model} />
                                    </>}
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    private renderHelmetTags() {
        const { tag } = this.props;

        if (!tag.model) {
            return (
                <Helmet>
                    <title>⏳ 𝘓𝘰𝘢𝘥𝘪𝘯𝘨...</title>
                </Helmet>
            );
        }

        const pageTitle = `HonestQ: ${tag.model.name}`;
        const canonicalUrl = `https://www.honestq.com/tags/${tag.model.slug}`;

        const ogTitle = `Questions about ${tag.model.name}`;
        const ogDescription = `View questions about ${tag.model.name}, ask your own, and join the debate.`;

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

    private setUp(props: ContainerProps): void {
        if (!props.tag || (props.tag.slug !== props.tagSlug)) {
            props.getTag(props.tagSlug);
        }
    }
}

export default connect(
    (state: ApplicationState, ownProps: any) => (state.tag),
    TagStore.actionCreators,
)(Container);
