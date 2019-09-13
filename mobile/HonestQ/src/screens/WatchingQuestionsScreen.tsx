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
import * as WatchingQuestionsStore from '../store/WatchingQuestions';
import ThemeService from '../ThemeService';
import { QuestionNavigationProps } from './QuestionScreen';

const mapStateToProps = (state: ApplicationState) => (state.watchingsQuestions);
const mapDispatchToProps = {
  ...WatchingQuestionsStore.actionCreators,
  updateWatchQuestion: QuestionStore.actionCreators.updateWatchQuestion,
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;
type Props = StateProps & DispatchProps;

class WatchingQuestionsScreen extends React.Component<Props> {

  protected static navigationOptions: NavigationScreenOptions = {
    title: 'Questions',
  };

  public componentDidMount() {
    if (!this.props.questionsList) {
      this.props.getWatchingQuestionsList();
    }
  }

  public render() {
    const { questionsList } = this.props;

    if (!questionsList) {
      return <HQLoadingView />;
    }

    const orderedQuestions = questionsList.sort((a, b) => (b.watchId - a.watchId));

    return (
      <View style={ThemeService.getStyles().contentView}>
        <FlatList
          style={hqStyles.mt1}
          data={orderedQuestions}
          keyExtractor={(item) => item.watchId.toString()}
          renderItem={({ item }) =>
            <View style={[hqStyles.row, hqStyles.mh1, hqStyles.mb1]}>
              <HQNavigationButton
                style={[hqStyles.fillSpace, hqStyles.mr1]}
                onPress={() => this.navigateToQuestion(item.questionId)}
              >
                <HQHeader>{item.questionText}</HQHeader>
              </HQNavigationButton>
              <WatchButton
                onChangeWatch={() => this.handleUnwatch(item.questionId)}
                watching={true}
              />
            </View>
          }
          ListEmptyComponent={
            <HQText style={[hqStyles.mh1, hqStyles.textAlignCenter]}>Not watching any questions.</HQText>
          }
        />
      </View>
    );
  }

  private navigateToQuestion(questionId: number): void {
    const navProps: QuestionNavigationProps = { questionId };
    NavigationService.navigate('Question', navProps);
  }

  private handleUnwatch(questionId: number): void {
    this.props.updateWatchQuestion(false, questionId);
  }
}

export default connect<StateProps, DispatchProps>(mapStateToProps, mapDispatchToProps)(WatchingQuestionsScreen);
