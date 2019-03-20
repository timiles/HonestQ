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
        numberOfTagsToShow?: number,
        showNewTagButton?: boolean,
        getTagsListStatus: ActionStatus,
    };

class TagsList extends React.Component<TagsListProps> {

    constructor(props: TagsListProps) {
        super(props);

        if (!this.props.tagsList) {
            this.props.getTagsList();
        }
    }

    public render() {
        const { tagsList, buttonSize = 'sm', selectedTagSlugs = [] } = this.props;
        const { showNewTagButton = false, numberOfTagsToShow } = this.props;

        if (!tagsList) {
            return <ActionStatusDisplay {...this.props.getTagsListStatus} />;
        }

        const tagsToShow = (numberOfTagsToShow! > 0) ?
            // TODO: order by most recent activity? Certainly not this random method anyway.
            tagsList.tags.sort((a, b) => Math.random() - .5).slice(0, numberOfTagsToShow) :
            tagsList.tags.sort((a, b) => (a.slug.localeCompare(b.slug)));

        const showMoreTagsButton = numberOfTagsToShow! > 0;
        const isActive = (tag: TagListItemModel) => selectedTagSlugs.indexOf(tag.slug) >= 0;

        return (
            <>
                <ActionStatusDisplay {...this.props.getTagsListStatus} />
                {tagsToShow &&
                    <ul className="list-inline">
                        {tagsToShow
                            .map((x: TagListItemModel, i: number) =>
                                <li key={i} className="mr-1 mb-1 list-inline-item">
                                    <Link
                                        to={`/tags/${x.slug}`}
                                        className={`btn btn-${buttonSize} btn-outline-secondary` +
                                            `${isActive(x) ? ' active btn-primary-brand' : ''}`}
                                    >
                                        {x.name}
                                    </Link>
                                </li>)}
                        {showNewTagButton &&
                            <LoggedInUserContext.Consumer>
                                {(user) => user &&
                                    <li className="list-inline-item">
                                        <Link to="/tags/_" className={`btn btn-${buttonSize} btn-primary`}>
                                            Suggest a new tag
                                        </Link>
                                    </li>}
                            </LoggedInUserContext.Consumer>}
                        {showMoreTagsButton &&
                            <li className="list-inline-item">
                                <Link to="/tags/_all" className={`btn btn-${buttonSize} btn-primary btn-primary-brand`}>
                                    Show more
                                </Link>
                            </li>}
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
