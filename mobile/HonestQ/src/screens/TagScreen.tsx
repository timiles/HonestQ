import moment from 'moment';
import React from 'react';
import { View } from 'react-native';
import { FlatList, NavigationScreenOptions, NavigationScreenProps } from 'react-navigation';
import { connect } from 'react-redux';
import { InfoCard } from '../components/InfoCard';
import QuestionCard from '../components/QuestionCard';
import ShareButton from '../components/ShareButton';
import TextWithShortLinks from '../components/TextWithShortLinks';
import WatchButton from '../components/WatchButton';
import { HQHeader, HQLabel, HQLoadingView, HQPrimaryButton } from '../hq-components';
import hqStyles from '../hq-styles';
import NavigationService from '../NavigationService';
import { ApplicationState } from '../store';
import * as TagStore from '../store/Tag';
import ThemeService from '../ThemeService';
import { buildTagUrl } from '../utils/route-utils';
import { getItemCountText } from '../utils/string-utils';
import { NewQuestionNavigationProps } from './NewQuestionScreen';

export interface TagNavigationProps {
  tagSlug: string;
  tagName: string;
  watching?: boolean;
  handleWatch?: (watching: boolean) => void;
}

const mapStateToProps = (state: ApplicationState) => (state.tag);
const mapDispatchToProps = TagStore.actionCreators;

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;
type Props = StateProps & DispatchProps & NavigationScreenProps<TagNavigationProps>;

class TagScreen extends React.Component<Props> {

  protected static navigationOptions =
    ({ navigation }: NavigationScreenProps<TagNavigationProps>): NavigationScreenOptions => {
      return {
        title: navigation.getParam('tagName'),
        headerRight: (
          <>
            {(navigation.getParam('watching') !== undefined) && (
              <View style={hqStyles.mr2}>
                <WatchButton
                  onChangeWatch={navigation.getParam('handleWatch')}
                  watching={navigation.getParam('watching')}
                />
              </View>
            )}
            <View style={hqStyles.mr1}>
              <ShareButton fill={ThemeService.getNavTextColor()} url={buildTagUrl(navigation.getParam('tagSlug'))} />
            </View>
          </>
        ),
      };
    }

  public constructor(props: Props) {
    super(props);

    this.navigateToNewQuestion = this.navigateToNewQuestion.bind(this);
    this.props.navigation.setParams({ handleWatch: this.handleWatch.bind(this) });
  }

  public componentDidMount() {
    const { tagSlug } = this.props.navigation.state.params;
    if (!this.props.tag || this.props.tag.slug !== tagSlug) {
      this.props.getTag(tagSlug);
    }
  }

  public componentDidUpdate() {
    const { navigation, tag } = this.props;
    if (tag && navigation.state.params.watching !== tag.watching) {
      navigation.setParams({ watching: tag.watching });
    }
  }

  public componentWillUnmount() {
    this.props.clearTag();
  }

  public render() {
    const { tag } = this.props;
    const { tagSlug } = this.props.navigation.state.params;

    if (!tag || tag.slug !== tagSlug) {
      return <HQLoadingView />;
    }

    const { description, moreInfoUrl, questions } = tag;

    const orderedQuestions = questions.sort((a, b) =>
      moment(b.mostRecentActivityPostedAt).isAfter(moment(a.mostRecentActivityPostedAt)) ? 1 : -1);

    const questionsCountText = getItemCountText('Question', questions.length);
    const newQuestionButton = (
      <HQPrimaryButton
        title="Ask a question"
        style={hqStyles.mb1}
        onPress={this.navigateToNewQuestion}
      />
    );

    return (
      <View style={ThemeService.getStyles().contentView}>
        <FlatList
          ListHeaderComponent={
            <View style={hqStyles.mh1}>
              <View style={hqStyles.mb1}>
                {(description || moreInfoUrl) ?
                  <InfoCard style={hqStyles.mt1}>
                    {description ?
                      <>
                        <HQHeader>Description</HQHeader>
                        <TextWithShortLinks value={description} />
                      </>
                      : null
                    }
                    {(description && moreInfoUrl) ?
                      <View style={hqStyles.mb1} />
                      : null
                    }
                    {moreInfoUrl ?
                      <>
                        <HQHeader>More info</HQHeader>
                        <TextWithShortLinks value={moreInfoUrl} />
                      </>
                      : null}
                  </InfoCard>
                  : null
                }
              </View>
              <HQHeader>{questionsCountText}</HQHeader>
              {questions.length === 0 &&
                <HQLabel>Start the conversation</HQLabel>
              }
              {newQuestionButton}
            </View>
          }
          data={orderedQuestions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={[hqStyles.mb1, hqStyles.mh1]}>
              <QuestionCard question={item} />
            </View>
          )}
          ListFooterComponent={
            orderedQuestions.length >= 5 &&
            <View style={[hqStyles.mb1, hqStyles.mh1]}>
              {newQuestionButton}
            </View>
          }
        />
      </View>
    );
  }

  private navigateToNewQuestion() {
    const navProps: NewQuestionNavigationProps = { initialTagValues: [this.props.tag] };
    NavigationService.navigate('NewQuestion', navProps);
  }

  private handleWatch(watching: boolean): void {
    const { tagSlug } = this.props.navigation.state.params;
    this.props.updateWatch(watching, tagSlug);
  }
}

export default connect<StateProps, DispatchProps>(mapStateToProps, mapDispatchToProps)(TagScreen);
