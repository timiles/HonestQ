import React from 'react';
import { View } from 'react-native';
import { FlatList, NavigationScreenOptions } from 'react-navigation';
import { connect } from 'react-redux';
import WatchButton from '../components/WatchButton';
import { HQHeader, HQLoadingView, HQNavigationButton, HQPrimaryButton } from '../hq-components';
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

class AllTagsScreen extends React.Component<Props> {

  protected static navigationOptions: NavigationScreenOptions = {
    title: 'All Tags',
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

    const orderedTags = tagsList.tags.sort((a, b) => (a.slug.toLowerCase().localeCompare(b.slug.toLowerCase())));

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
                  onChangeWatch={() => this.handleWatch(!item.watching, item.slug)}
                  watching={item.watching}
                />
              </View>
            </View>
          }
          ListFooterComponent={
            <HQPrimaryButton style={hqStyles.mh1} title="Suggest a new tag" onPress={this.navigateToNewTag} />
          }
        />
      </View>
    );
  }

  private navigateToTag(tagSlug: string, tagName: string): void {
    const navProps: TagNavigationProps = { tagSlug, tagName };
    NavigationService.navigate('Tag', navProps);
  }

  private navigateToNewTag(): void {
    NavigationService.navigate('NewTag');
  }

  private handleWatch(watching: boolean, tagSlug: string): void {
    this.props.updateWatch(watching, tagSlug);
  }
}

const mapStateToProps = (state: ApplicationState) => (state.tags);
const actions = { ...TagsStore.actionCreators, updateWatch: TagStore.actionCreators.updateWatch };
export default connect(mapStateToProps, actions)(AllTagsScreen);
