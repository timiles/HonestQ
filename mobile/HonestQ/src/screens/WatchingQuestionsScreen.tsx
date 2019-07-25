import React from 'react';
import { View } from 'react-native';
import { FlatList, NavigationScreenOptions } from 'react-navigation';
import { connect } from 'react-redux';
import WatchButton from '../components/WatchButton';
import { HQHeader, HQLoadingView, HQNavigationButton } from '../hq-components';
import hqStyles from '../hq-styles';
import NavigationService from '../NavigationService';
import { ApplicationState } from '../store';
import * as QuestionStore from '../store/Question';
import * as WatchingQuestionsStore from '../store/WatchingQuestions';
import ThemeService from '../ThemeService';
import { QuestionNavigationProps } from './QuestionScreen';

type Props = WatchingQuestionsStore.State
  & typeof WatchingQuestionsStore.actionCreators
  & { updateWatch: (on: boolean, questionId: number) => any };

class WatchingQuestionsScreen extends React.Component<Props> {

  protected static navigationOptions: NavigationScreenOptions = {
    title: 'Watching Questions',
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

    const orderedQuestions = questionsList.sort((a, b) => (a.slug.toLowerCase().localeCompare(b.slug.toLowerCase())));

    return (
      <View style={ThemeService.getStyles().contentView}>
        <FlatList
          data={orderedQuestions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) =>
            <HQNavigationButton
              style={[hqStyles.flexRow, hqStyles.mh1, hqStyles.mb1]}
              onPress={() => this.navigateToQuestion(item.id)}
            >
              <HQHeader style={[hqStyles.flexGrow, hqStyles.vAlignCenter]}>{item.text}</HQHeader>
              <WatchButton onWatch={() => this.handleWatch(!item.watching, item.id)} watching={item.watching} />
            </HQNavigationButton>
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
    this.props.updateWatch(on, questionId);
  }
}

const mapStateToProps = (state: ApplicationState) => (state.watchingsQuestions);
const actions = { ...WatchingQuestionsStore.actionCreators, updateWatch: QuestionStore.actionCreators.updateWatch };
export default connect(mapStateToProps, actions)(WatchingQuestionsScreen);
