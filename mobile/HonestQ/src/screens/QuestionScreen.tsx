import React from 'react';
import { View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { NavigationScreenOptions, NavigationScreenProps } from 'react-navigation';
import { connect } from 'react-redux';
import AnswerCard from '../components/AnswerCard';
import CircleIconCard from '../components/CircleIconCard';
import { InfoCard } from '../components/InfoCard';
import TextWithShortLinks from '../components/TextWithShortLinks';
import WatchButton from '../components/WatchButton';
import { HQHeader, HQLoadingView, HQPrimaryButton } from '../hq-components';
import hqStyles from '../hq-styles';
import NavigationService from '../NavigationService';
import { ApplicationState } from '../store';
import * as QuestionStore from '../store/Question';
import ThemeService from '../ThemeService';
import { getItemCountText } from '../utils/string-utils';
import { NewAnswerNavigationProps } from './NewAnswerScreen';

export interface QuestionNavigationProps {
  questionId: number;
}

type Props = QuestionStore.QuestionState
  & typeof QuestionStore.actionCreators
  & NavigationScreenProps<QuestionNavigationProps>;

class QuestionScreen extends React.Component<Props> {

  protected static navigationOptions: NavigationScreenOptions = {
    title: 'Question',
  };

  public constructor(props: Props) {
    super(props);

    const { questionId } = this.props.navigation.state.params;
    if (!props.question || props.question.id !== questionId) {
      this.props.getQuestion(questionId);
    }

    this.navigateToNewAnswer = this.navigateToNewAnswer.bind(this);
    this.handleUpvote = this.handleUpvote.bind(this);
    this.handleWatch = this.handleWatch.bind(this);
  }

  public render() {
    const { question } = this.props;
    const { questionId } = this.props.navigation.state.params;

    if (!question || question.id !== questionId) {
      return <HQLoadingView />;
    }

    const { text, context, answers, watching } = question;
    const answersCountText = getItemCountText('Answer', answers.length);
    const newAnswerButton = (
      <HQPrimaryButton
        title="Got an answer?"
        style={hqStyles.mb1}
        onPress={this.navigateToNewAnswer}
      />
    );

    return (
      <View style={ThemeService.getStyles().contentView}>
        <FlatList
          ListHeaderComponent={(
            <View style={hqStyles.mh1}>
              <CircleIconCard type="Q" style={hqStyles.mb1}>
                <HQHeader>{text}</HQHeader>
              </CircleIconCard>
              <View style={[hqStyles.flexRowPullRight, hqStyles.mb1]}>
                <WatchButton
                  onWatch={this.handleWatch}
                  watching={watching}
                />
              </View>
              {context &&
                <InfoCard style={hqStyles.mb1}>
                  <HQHeader>Context</HQHeader>
                  <TextWithShortLinks value={context} />
                </InfoCard>
              }
              <HQHeader>{answersCountText}</HQHeader>
              {newAnswerButton}
            </View>
          )}
          data={answers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={[hqStyles.mb1, hqStyles.mh1]}>
              <AnswerCard questionId={questionId} answer={item} onUpvote={this.handleUpvote} />
            </View>
          )}
          ListFooterComponent={
            answers.length >= 5 &&
            <View style={[hqStyles.mb1, hqStyles.mh1]}>
              {newAnswerButton}
            </View>
          }
        />
      </View>
    );
  }

  private navigateToNewAnswer() {
    const { questionId } = this.props.navigation.state.params;
    const navProps: NewAnswerNavigationProps = { questionId };
    NavigationService.navigate('NewAnswer', navProps);
  }

  private handleUpvote(on: boolean, answerId: number): void {
    const { questionId } = this.props.navigation.state.params;
    this.props.updateUpvote(on, questionId, answerId);
  }

  private handleWatch(on: boolean): void {
    const { questionId } = this.props.navigation.state.params;
    this.props.updateWatchQuestion(on, questionId);
  }
}

const mapStateToProps = (state: ApplicationState) => (state.question);
export default connect(mapStateToProps, QuestionStore.actionCreators)(QuestionScreen);
