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

type Props = WatchingQuestionsStore.State
  & typeof WatchingQuestionsStore.actionCreators
  & { updateWatchQuestion: (on: boolean, questionId: number) => any };

class WatchingQuestionsScreen extends React.Component<Props> {

  protected static navigationOptions: NavigationScreenOptions = {
    title: 'Questions',
  };

  constructor(props: Props) {
    super(props);

    if (!this.props.questionsList) {
      this.props.getWatchingQuestionsList();
    }
  }

  public render() {
    const { questionsList } = this.props;

    if (!questionsList) {
      return <HQLoadingView />;
    }

    const orderedQuestions = questionsList
      .filter((x) => x.watching)
      .sort((a, b) => (a.slug.toLowerCase().localeCompare(b.slug.toLowerCase())));

    return (
      <View style={ThemeService.getStyles().contentView}>
        <FlatList
          style={hqStyles.mt1}
          data={orderedQuestions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) =>
            <HQNavigationButton
              style={[hqStyles.flexRowSpaceBetween, hqStyles.mh1, hqStyles.mb1]}
              onPress={() => this.navigateToQuestion(item.id)}
            >
              <HQHeader style={[hqStyles.flexShrink, hqStyles.vAlignCenter]}>{item.text}</HQHeader>
              <WatchButton onWatch={() => this.handleWatch(!item.watching, item.id)} watching={item.watching} />
            </HQNavigationButton>
          }
          ListEmptyComponent={
            <HQText style={[hqStyles.mh1, hqStyles.textAlignCenter]}>Not watching any Questions.</HQText>
          }
        />
      </View>
    );
  }

  private navigateToQuestion(questionId: number): void {
    const navProps: QuestionNavigationProps = { questionId };
    NavigationService.navigate('Question', navProps);
  }

  private handleWatch(on: boolean, questionId: number): void {
    this.props.updateWatchQuestion(on, questionId);
  }
}

const mapStateToProps = (state: ApplicationState) => (state.watchingsQuestions);
const actions = {
  ...WatchingQuestionsStore.actionCreators,
  updateWatchQuestion: QuestionStore.actionCreators.updateWatchQuestion,
};
export default connect(mapStateToProps, actions)(WatchingQuestionsScreen);
