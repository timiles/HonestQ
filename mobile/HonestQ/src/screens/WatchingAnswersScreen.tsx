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
  & { updateWatchAnswer: (on: boolean, questionId: number, answerId: number) => any };

class WatchingAnswersScreen extends React.Component<Props> {

  protected static navigationOptions: NavigationScreenOptions = {
    title: 'Answers',
  };

  constructor(props: Props) {
    super(props);

    if (!this.props.answersList) {
      this.props.getWatchingAnswersList();
    }
  }

  public render() {
    const { answersList } = this.props;

    if (!answersList) {
      return <HQLoadingView />;
    }

    const orderedAnswers = answersList.sort((a, b) => (a.slug.toLowerCase().localeCompare(b.slug.toLowerCase())));

    return (
      <View style={ThemeService.getStyles().contentView}>
        <FlatList
          data={orderedAnswers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) =>
            <HQNavigationButton
              style={[hqStyles.flexRowSpaceBetween, hqStyles.mh1, hqStyles.mb1]}
              onPress={() => this.navigateToAnswer(item.questionId, item.id)}
            >
              <View style={[hqStyles.flexShrink, hqStyles.vAlignCenter]}>
                <HQText>{item.questionText}</HQText>
                <HQHeader>{item.text}</HQHeader>
              </View>
              <View >
                <WatchButton
                  onWatch={() => this.handleWatch(!item.watching, item.questionId, item.id)}
                  watching={item.watching}
                />
              </View>
            </HQNavigationButton>
          }
        />
      </View>
    );
  }

  private navigateToAnswer(questionId: number, answerId: number): void {
    const navProps: AnswerNavigationProps = { questionId, answerId };
    NavigationService.navigate('Answer', navProps);
  }

  private handleWatch(on: boolean, questionId: number, answerId: number): void {
    this.props.updateWatchAnswer(on, questionId, answerId);
  }
}

const mapStateToProps = (state: ApplicationState) => (state.watchingsAnswers);
const actions = {
  ...WatchingAnswersStore.actionCreators,
  updateWatchAnswer: QuestionStore.actionCreators.updateWatchAnswer,
};
export default connect(mapStateToProps, actions)(WatchingAnswersScreen);
