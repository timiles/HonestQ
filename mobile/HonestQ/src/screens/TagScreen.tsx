import React from 'react';
import { View } from 'react-native';
import { FlatList, NavigationScreenOptions, NavigationScreenProps } from 'react-navigation';
import { connect } from 'react-redux';
import { InfoCard } from '../components/InfoCard';
import QuestionCard from '../components/QuestionCard';
import TextWithShortLinks from '../components/TextWithShortLinks';
import WatchButton from '../components/WatchButton';
import { HQContentView, HQHeader, HQLabel, HQPrimaryButton, HQText } from '../hq-components';
import hqStyles from '../hq-styles';
import NavigationService from '../NavigationService';
import { ApplicationState } from '../store';
import * as TagStore from '../store/Tag';
import { getItemCountText, parseDateWithTimeZoneOffset } from '../utils/string-utils';
import { NewQuestionNavigationProps } from './NewQuestionScreen';

export interface TagNavigationProps {
  tagSlug: string;
  tagName: string;
}

type Props = TagStore.TagState
  & typeof TagStore.actionCreators
  & NavigationScreenProps<TagNavigationProps>;

class TagScreen extends React.Component<Props> {

  protected static navigationOptions =
    ({ navigation }: NavigationScreenProps<TagNavigationProps>): NavigationScreenOptions => {
      return {
        title: navigation.getParam('tagName'),
      };
    }

  public constructor(props: Props) {
    super(props);

    const { tagSlug } = this.props.navigation.state.params;
    if (!props.tag || props.tag.slug !== tagSlug) {
      props.getTag(tagSlug);
    }

    this.navigateToNewQuestion = this.navigateToNewQuestion.bind(this);
    this.handleWatch = this.handleWatch.bind(this);
  }

  public render() {
    const { tag } = this.props;
    const { tagSlug } = this.props.navigation.state.params;

    if (!tag || tag.slug !== tagSlug) {
      return <HQContentView><HQText>Loading</HQText></HQContentView>;
    }

    const { description, moreInfoUrl, questions, watching } = tag;

    const orderedQuestions = questions.sort((a, b) =>
      parseDateWithTimeZoneOffset(b.mostRecentActivityPostedAt).getTime() -
      parseDateWithTimeZoneOffset(a.mostRecentActivityPostedAt).getTime());

    const questionsCountText = getItemCountText('Question', questions.length);
    const newQuestionButton = (
      <HQPrimaryButton
        title="Ask a question"
        style={hqStyles.mb1}
        onPress={this.navigateToNewQuestion}
      />
    );

    return (
      <HQContentView>
        <FlatList
          ListHeaderComponent={
            <View style={hqStyles.mh1}>
              <View style={hqStyles.mb1}>
                {(description || moreInfoUrl) ?
                  <InfoCard>
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
              <View style={[hqStyles.flexRowPullRight, hqStyles.mb1]}>
                <WatchButton
                  onWatch={this.handleWatch}
                  watching={watching}
                />
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
      </HQContentView>
    );
  }

  private navigateToNewQuestion() {
    const navProps: NewQuestionNavigationProps = { initialTagValues: [this.props.tag] };
    NavigationService.navigate('NewQuestion', navProps);
  }

  private handleWatch(on: boolean): void {
    const { tagSlug } = this.props.navigation.state.params;
    this.props.updateWatch(on, tagSlug);
  }
}

const mapStateToProps = (state: ApplicationState) => (state.tag);
export default connect(mapStateToProps, TagStore.actionCreators)(TagScreen);
