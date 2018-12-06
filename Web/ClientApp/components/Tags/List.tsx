import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { LoggedInUserContext } from '../../LoggedInUserContext';
import { TagListItemModel } from '../../server-models';
import { ApplicationState } from '../../store';
import { ActionStatus, getActionStatus } from '../../store/ActionStatuses';
import * as TagsStore from '../../store/Tags';
import ActionStatusDisplay from '../shared/ActionStatusDisplay';

type TagsListProps = TagsStore.ListState
    & typeof TagsStore.actionCreators
    & {
    buttonSize?: string,
    selectedTagSlugs?: string[],
    showNewTagButton?: boolean,
    getTagsListStatus: ActionStatus,
};

class TagsList extends React.Component<TagsListProps> {

    public componentWillMount() {
        if (!this.props.tagsList) {
            this.props.getTagsList();
        }
    }

    public render() {
        const { tagsList, buttonSize = 'sm', selectedTagSlugs = [], showNewTagButton = false } = this.props;

        return (
            <>
                <h2>Tags</h2>
                <ActionStatusDisplay {...this.props.getTagsListStatus} />
                {tagsList &&
                    <ul className="list-inline">
                        {tagsList.tags
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
    (state: ApplicationState) => ({
        ...state.tags,
        getTagsListStatus: getActionStatus(state, 'GET_TAGS_LIST'),
    }),
    TagsStore.actionCreators,
)(TagsList);
