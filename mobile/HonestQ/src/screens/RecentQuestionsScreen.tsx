import React from 'react';
import { RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { FlatList, NavigationScreenOptions } from 'react-navigation';
import { connect } from 'react-redux';
import IconCard from '../components/IconCard';
import hqColors from '../hq-colors';
import { HQActivityIndicator, HQLoadingView, HQPrimaryButton, HQText } from '../hq-components';
import hqStyles from '../hq-styles';
import NavigationService from '../NavigationService';
import { QuestionListItemModel } from '../server-models';
import { ApplicationState } from '../store';
import * as QuestionsStore from '../store/Questions';
import ThemeService from '../ThemeService';
import { NewQuestionNavigationProps } from './NewQuestionScreen';
import { QuestionNavigationProps } from './QuestionScreen';

const mapStateToProps = (state: ApplicationState) => (state.questions);
const mapDispatchToProps = QuestionsStore.actionCreators;

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;
type Props = StateProps & DispatchProps;

interface State {
  loadingMore: boolean;
}

class RecentQuestionsScreen extends React.Component<Props, State> {

  protected static navigationOptions: NavigationScreenOptions = {
    title: 'Recent questions',
  };

  constructor(props: Props) {
    super(props);

    this.state = { loadingMore: false };

    this.loadMore = this.loadMore.bind(this);
    this.handleRefresh = this.handleRefresh.bind(this);
  }

  public componentDidMount() {
    if (!this.props.questionsList) {
      this.props.loadMoreQuestionItems({});
    }
  }

  public componentDidUpdate(prevProps: Props) {
    if (this.state.loadingMore && prevProps.questionsList && this.props.questionsList &&
      (prevProps.questionsList.lastTimestamp !== this.props.questionsList.lastTimestamp)) {
      this.setState({ loadingMore: false });
    }
  }

  public render() {
    const { questionsList, refreshing } = this.props;

    if (!questionsList) {
      return <HQLoadingView />;
    }

    return (
      <View style={ThemeService.getStyles().contentView}>
        <FlatList
          style={hqStyles.mt1}
          data={questionsList && questionsList.questions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            this.renderQuestion(item)
          )}
          ItemSeparatorComponent={() => <View
            style={{
              borderBottomColor: ThemeService.getBorderColor(),
              borderBottomWidth: StyleSheet.hairlineWidth,
            }}
          />}
          onEndReached={this.loadMore}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={this.handleRefresh}
              colors={[hqColors.Orange]}
              progressBackgroundColor={ThemeService.getBorderColor()}
            />
          }
          ListFooterComponent={
            this.state.loadingMore ?
              <HQActivityIndicator />
              : (questionsList.lastTimestamp === 0) &&
              <View style={hqStyles.mx1}>
                <HQPrimaryButton
                  title="Ask a question"
                  style={hqStyles.mb1}
                  onPress={this.navigateToNewQuestion}
                />
              </View>
          }
        />
      </View>
    );
  }

  private renderQuestion(question: QuestionListItemModel) {
    return (
      <TouchableOpacity onPress={() => this.navigateToQuestion(question.id)}>
        <View style={hqStyles.m1}>
          <HQText>
            Question
            {question.tags.length > 0 ? ' in: ' + question.tags.map((x) => x.name).join(', ') : null}
          </HQText>
          <IconCard type="Q">
            <HQText>{question.text}</HQText>
          </IconCard>
        </View>
      </TouchableOpacity>
    );
  }

  private loadMore(): void {
    const { questionsList: { lastTimestamp }, loadMoreQuestionItems } = this.props;
    if (lastTimestamp > 0 && !this.state.loadingMore) {
      this.setState({ loadingMore: true });
      loadMoreQuestionItems({ beforeTimestamp: lastTimestamp });
    }
  }

  private handleRefresh(): void {
    this.props.loadMoreQuestionItems({ isRefresh: true });
  }

  private navigateToNewQuestion() {
    const navProps: NewQuestionNavigationProps = {};
    NavigationService.navigate('NewQuestion', navProps);
  }

  private navigateToQuestion(questionId: number) {
    const navProps: QuestionNavigationProps = { questionId };
    NavigationService.navigate('Question', navProps);
  }
}

export default connect<StateProps, DispatchProps>(mapStateToProps, mapDispatchToProps)(RecentQuestionsScreen);
