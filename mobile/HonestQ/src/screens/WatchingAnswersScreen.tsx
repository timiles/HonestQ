import React from 'react';
import { View } from 'react-native';
import { FlatList, NavigationScreenOptions } from 'react-navigation';
import { connect } from 'react-redux';
import WatchButton from '../components/WatchButton';
import { HQHeader, HQLoadingView, HQNavigationButton, HQText } from '../hq-components';
import hqStyles from '../hq-styles';
import NavigationService from '../NavigationService';
import { ApplicationState } from '../store';
import * as QuestionStore from '../store/Question';
import * as WatchingAnswersStore from '../store/WatchingAnswers';
import ThemeService from '../ThemeService';
import { AnswerNavigationProps } from './AnswerScreen';

type Props = WatchingAnswersStore.State
  & typeof WatchingAnswersStore.actionCreators
  & { updateWatchAnswer: (watching: boolean, questionId: number, answerId: number) => void };

class WatchingAnswersScreen extends React.Component<Props> {

  protected static navigationOptions: NavigationScreenOptions = {
    title: 'Answers',
  };

  public componentDidMount() {
    if (!this.props.answersList) {
      this.props.getWatchingAnswersList();
    }
  }

  public render() {
    const { answersList } = this.props;

    if (!answersList) {
      return <HQLoadingView />;
    }

    const orderedAnswers = answersList.sort((a, b) => (b.watchId - a.watchId));

    return (
      <View style={ThemeService.getStyles().contentView}>
        <FlatList
          style={hqStyles.mt1}
          data={orderedAnswers}
          keyExtractor={(item) => item.answerId.toString()}
          renderItem={({ item }) =>
            <View style={[hqStyles.flexRowAlignCenter, hqStyles.mh1, hqStyles.mb1]}>
              <HQNavigationButton
                style={[hqStyles.flexGrow, hqStyles.flexShrink, hqStyles.mr1]}
                onPress={() => this.navigateToAnswer(item.questionId, item.answerId)}
              >
                <HQText>{item.questionText}</HQText>
                <HQHeader>{item.answerText}</HQHeader>
              </HQNavigationButton>
              <WatchButton
                onChangeWatch={() => this.handleUnwatch(item.questionId, item.answerId)}
                watching={true}
              />
            </View>
          }
          ListEmptyComponent={
            <HQText style={[hqStyles.mh1, hqStyles.textAlignCenter]}>Not watching any Answers.</HQText>
          }
        />
      </View>
    );
  }

  private navigateToAnswer(questionId: number, answerId: number): void {
    const navProps: AnswerNavigationProps = { questionId, answerId };
    NavigationService.navigate('Answer', navProps);
  }

  private handleUnwatch(questionId: number, answerId: number): void {
    this.props.updateWatchAnswer(false, questionId, answerId);
  }
}

const mapStateToProps = (state: ApplicationState) => (state.watchingsAnswers);
const actions = {
  ...WatchingAnswersStore.actionCreators,
  updateWatchAnswer: QuestionStore.actionCreators.updateWatchAnswer,
};
export default connect(mapStateToProps, actions)(WatchingAnswersScreen);
