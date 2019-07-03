import React from 'react';
import { FlatList } from 'react-native';
import { connect } from 'react-redux';
import { HQNavigationButton } from '../hq-components';
import NavigationService from '../NavigationService';
import { TagNavigationProps } from '../screens/TagScreen';
import { ApplicationState } from '../store';
import * as TagsStore from '../store/Tags';

type TagsListProps = TagsStore.ListState
  & typeof TagsStore.actionCreators;

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

    const orderedTags = tagsList.tags.sort((a, b) => (a.slug.toLowerCase().localeCompare(b.slug.toLowerCase())));

    return (
      <FlatList
        data={orderedTags}
        keyExtractor={(item) => item.slug}
        renderItem={({ item }) =>
          <HQNavigationButton
            title={item.name}
            onPress={() => this.navigateToTag(item.slug, item.name)}
          />
        }
      />
    );
  }

  private navigateToTag(tagSlug: string, tagName: string): void {
    const navProps: TagNavigationProps = { tagSlug, tagName };
    NavigationService.navigate('Tag', navProps);
  }
}

const mapStateToProps = (state: ApplicationState) => (state.tags);
export default connect(mapStateToProps, TagsStore.actionCreators)(TagsList);
