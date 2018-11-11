import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { LoggedInUserContext } from '../../LoggedInUserContext';
import { TagListItemModel } from '../../server-models';
import { ApplicationState } from '../../store';
import * as TagsStore from '../../store/Tags';
import Loading from '../shared/Loading';

type TagsListProps = TagsStore.ListState
    & typeof TagsStore.actionCreators
    & { buttonSize?: string, selectedTagSlugs?: string[], showNewTagButton?: boolean };

class TagsList extends React.Component<TagsListProps> {

    public componentWillMount() {
        if (!this.props.loadingTagsList.loadedModel) {
            this.props.getTagsList();
        }
    }

    public render() {
        const tagsModel = this.props.loadingTagsList.loadedModel;
        const { buttonSize = 'sm', selectedTagSlugs = [], showNewTagButton = false } = this.props;

        return (
            <>
                <h2>Tags</h2>
                <Loading {...this.props.loadingTagsList} />
                {tagsModel &&
                    <ul className="list-inline">
                        {tagsModel.tags
                            .sort((a, b) => (a.slug.localeCompare(b.slug)))
                            .map((x: TagListItemModel, i: number) =>
                                <li key={i} className="mr-1 mb-1 list-inline-item">
                                    <Link
                                        to={`/tags/${x.slug}`}
                                        className={`btn btn-${buttonSize} btn-outline-secondary ` +
                                            `${selectedTagSlugs.indexOf(x.slug) >= 0 ? 'active' : ''}`}
                                    >
                                        {x.name}
                                    </Link>
                                </li>)}
                        {showNewTagButton &&
                            <LoggedInUserContext.Consumer>
                                {(user) => user &&
                                    <li className="list-inline-item">
                                        <Link to="/newtag" className={`btn btn-${buttonSize} btn-primary`}>
                                            Suggest a new tag
                                        </Link>
                                    </li>}
                            </LoggedInUserContext.Consumer>}
                    </ul>
                }
            </>
        );
    }
}

export default connect(
    (state: ApplicationState, ownProps: any): any => (state.tags),
    TagsStore.actionCreators,
)(TagsList);
