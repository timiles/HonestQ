import React from 'react';
import { FlatList } from 'react-native';
import { connect } from 'react-redux';
import { HQButton } from '../hq-components';
import { ApplicationState } from '../store';
import * as TagsStore from '../store/Tags';

interface OwnProps {
  navigateToTagScreen: (tagSlug: string, tagName: string) => void;
}

type TagsListProps = TagsStore.ListState
  & typeof TagsStore.actionCreators
  & OwnProps;

class TagsList extends React.Component<TagsListProps> {

  constructor(props: TagsListProps) {
    super(props);

    if (!this.props.tagsList) {
      this.props.getTagsList();
    }
  }

  public render() {
    const { tagsList } = this.props;

    if (!tagsList) {
      return null;
    }

    const orderedTags = tagsList.tags.sort((a, b) => (a.slug.localeCompare(b.slug)));

    return (
      <FlatList
        data={orderedTags}
        keyExtractor={(item) => item.slug}
        renderItem={({ item }) =>
          <HQButton
            title={item.name}
            onPress={() => this.props.navigateToTagScreen(item.slug, item.name)}
          />
        }
      />
    );
  }
}

const mapStateToProps = (state: ApplicationState, ownProps: OwnProps) => ({ ...state.tags, ...ownProps });
export default connect(mapStateToProps, TagsStore.actionCreators)(TagsList);
