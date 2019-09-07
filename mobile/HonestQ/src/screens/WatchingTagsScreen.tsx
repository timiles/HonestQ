import React from 'react';
import { View } from 'react-native';
import { FlatList, NavigationScreenOptions } from 'react-navigation';
import { connect } from 'react-redux';
import WatchButton from '../components/WatchButton';
import { HQHeader, HQLoadingView, HQNavigationButton, HQText } from '../hq-components';
import hqStyles from '../hq-styles';
import NavigationService from '../NavigationService';
import { ApplicationState } from '../store';
import * as TagStore from '../store/Tag';
import * as TagsStore from '../store/Tags';
import ThemeService from '../ThemeService';
import { TagNavigationProps } from './TagScreen';

type Props = TagsStore.ListState
  & typeof TagsStore.actionCreators
  & { updateWatch: (watching: boolean, tagSlug: string) => any };

class WatchingTagsScreen extends React.Component<Props> {

  protected static navigationOptions: NavigationScreenOptions = {
    title: 'Tags',
  };

  public componentDidMount() {
    if (!this.props.tagsList) {
      this.props.getTagsList();
    }
  }

  public render() {
    const { tagsList } = this.props;

    if (!tagsList) {
      return <HQLoadingView />;
    }

    const orderedTags = tagsList.tags
      .filter((x) => x.watching)
      .sort((a, b) => (a.slug.toLowerCase().localeCompare(b.slug.toLowerCase())));

    return (
      <View style={ThemeService.getStyles().contentView}>
        <FlatList
          style={hqStyles.mv1}
          data={orderedTags}
          keyExtractor={(item) => item.slug}
          renderItem={({ item }) =>
            <View style={[hqStyles.flexRow, hqStyles.mh1, hqStyles.mb1]}>
              <HQNavigationButton
                style={[hqStyles.flexGrow, hqStyles.flexShrink]}
                onPress={() => this.navigateToTag(item.slug, item.name)}
              >
                <HQHeader>{item.name}</HQHeader>
              </HQNavigationButton>
              <View style={[hqStyles.flexShrink, hqStyles.ml1, hqStyles.center]}>
                <WatchButton
                  onChangeWatch={() => this.handleUnwatch(item.slug)}
                  watching={true}
                />
              </View>
            </View>
          }
          ListEmptyComponent={
            <HQText style={[hqStyles.mh1, hqStyles.mb1, hqStyles.textAlignCenter]}>Not watching any Tags.</HQText>
          }
          ListFooterComponent={
            <HQNavigationButton style={hqStyles.mh1} title="Browse all Tags" onPress={this.navigateToAllTags} />
          }
        />
      </View>
    );
  }

  private navigateToTag(tagSlug: string, tagName: string): void {
    const navProps: TagNavigationProps = { tagSlug, tagName };
    NavigationService.navigate('Tag', navProps);
  }

  private navigateToAllTags(): void {
    NavigationService.navigate('AllTags');
  }

  private handleUnwatch(tagSlug: string): void {
    this.props.updateWatch(false, tagSlug);
  }
}

const mapStateToProps = (state: ApplicationState) => (state.tags);
const actions = { ...TagsStore.actionCreators, updateWatch: TagStore.actionCreators.updateWatch };
export default connect(mapStateToProps, actions)(WatchingTagsScreen);
