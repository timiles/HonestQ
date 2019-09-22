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

const mapStateToProps = (state: ApplicationState) => (state.tags);
const mapDispatchToProps = { ...TagsStore.actionCreators, updateWatch: TagStore.actionCreators.updateWatch };

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;
type Props = StateProps & DispatchProps;

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
          style={hqStyles.my1}
          data={orderedTags}
          keyExtractor={(item) => item.slug}
          renderItem={({ item }) =>
            <View style={[hqStyles.row, hqStyles.mx1, hqStyles.mb1]}>
              <HQNavigationButton
                style={[hqStyles.fillSpace, hqStyles.mr1]}
                onPress={() => this.navigateToTag(item.slug, item.name)}
              >
                <HQHeader>{item.name}</HQHeader>
              </HQNavigationButton>
              <WatchButton
                onChangeWatch={() => this.handleUnwatch(item.slug)}
                watching={true}
              />
            </View>
          }
          ListEmptyComponent={
            <HQText style={[hqStyles.mx1, hqStyles.mb1, hqStyles.textAlignCenter]}>Not watching any tags.</HQText>
          }
          ListFooterComponent={
            <HQNavigationButton style={hqStyles.mx1} title="Browse all tags" onPress={this.navigateToAllTags} />
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

export default connect<StateProps, DispatchProps>(mapStateToProps, mapDispatchToProps)(WatchingTagsScreen);
