import React from 'react';
import { View } from 'react-native';
import { FlatList, NavigationScreenOptions } from 'react-navigation';
import { connect } from 'react-redux';
import WatchButton from '../components/WatchButton';
import { HQHeader, HQLoadingView, HQNavigationButton } from '../hq-components';
import hqStyles from '../hq-styles';
import NavigationService from '../NavigationService';
import { ApplicationState } from '../store';
import * as TagStore from '../store/Tag';
import * as WatchingTagsStore from '../store/WatchingTags';
import ThemeService from '../ThemeService';
import { TagNavigationProps } from './TagScreen';

type Props = WatchingTagsStore.State
  & typeof WatchingTagsStore.actionCreators
  & { updateWatch: (on: boolean, tagSlug: string) => any };

class WatchingTagsScreen extends React.Component<Props> {

  protected static navigationOptions: NavigationScreenOptions = {
    title: 'Watching Tags',
  };

  constructor(props: Props) {
    super(props);

    if (!this.props.tagsList) {
      this.props.getWatchingTagsList();
    }
  }

  public render() {
    const { tagsList } = this.props;

    if (!tagsList) {
      return <HQLoadingView />;
    }

    const orderedTags = tagsList.sort((a, b) => (a.slug.toLowerCase().localeCompare(b.slug.toLowerCase())));

    return (
      <View style={ThemeService.getStyles().contentView}>
        <FlatList
          data={orderedTags}
          keyExtractor={(item) => item.slug}
          renderItem={({ item }) =>
            <HQNavigationButton
              style={[hqStyles.flexRow, hqStyles.mh1, hqStyles.mb1]}
              onPress={() => this.navigateToTag(item.slug, item.name)}
            >
              <HQHeader style={[hqStyles.flexGrow, hqStyles.vAlignCenter]}>{item.name}</HQHeader>
              <WatchButton onWatch={() => this.handleWatch(!item.watching, item.slug)} watching={item.watching} />
            </HQNavigationButton>
          }
        />
      </View>
    );
  }

  private navigateToTag(tagSlug: string, tagName: string): void {
    const navProps: TagNavigationProps = { tagSlug, tagName };
    NavigationService.navigate('Tag', navProps);
  }

  private handleWatch(on: boolean, tagSlug: string): void {
    this.props.updateWatch(on, tagSlug);
  }
}

const mapStateToProps = (state: ApplicationState) => (state.watchingsTags);
const actions = { ...WatchingTagsStore.actionCreators, updateWatch: TagStore.actionCreators.updateWatch };
export default connect(mapStateToProps, actions)(WatchingTagsScreen);
