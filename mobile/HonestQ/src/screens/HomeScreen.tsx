import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FlatList, NavigationScreenOptions, NavigationScreenProps } from 'react-navigation';
import { connect } from 'react-redux';
import CircleIconCard from '../components/CircleIconCard';
import { HQActivityIndicator, HQHeader, HQLoadingView, HQPrimaryButton, HQText } from '../hq-components';
import hqStyles from '../hq-styles';
import NavigationService from '../NavigationService';
import { QuestionListItemModel } from '../server-models';
import { ApplicationState } from '../store';
import * as QuestionsStore from '../store/Questions';
import ThemeService from '../ThemeService';
import { NewQuestionNavigationProps } from './NewQuestionScreen';
import { QuestionNavigationProps } from './QuestionScreen';

type Props = QuestionsStore.ListState
  & typeof QuestionsStore.actionCreators;

interface State {
  loadingMore: boolean;
}
class HomeScreen extends React.Component<Props, State> {

  protected static navigationOptions =
    ({ navigation }: NavigationScreenProps): NavigationScreenOptions => {
      return {
        title: 'Home',
        headerLeft: ({ tintColor }) => (
          <Text style={{ color: tintColor }} onPress={() => navigation.openDrawer()}>Menu</Text>
        ),
      };
    }

  constructor(props: Props) {
    super(props);

    this.state = { loadingMore: false };

    if (!this.props.questionsList) {
      this.props.loadMoreQuestionItems();
    }

    this.loadMore = this.loadMore.bind(this);
  }

  public componentDidUpdate(prevProps: Props) {
    if (this.state.loadingMore && prevProps.questionsList && this.props.questionsList &&
      (prevProps.questionsList.lastTimestamp !== this.props.questionsList.lastTimestamp)) {
      this.setState({ loadingMore: false });
    }
  }

  public render() {
    const { questionsList } = this.props;

    if (!questionsList) {
      return <HQLoadingView />;
    }

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
          style={hqStyles.mt1}
          data={questionsList && questionsList.questions}
          ListHeaderComponent={
            questionsList &&
            <View style={hqStyles.mh1}>
              {newQuestionButton}
              <HQHeader>Recent questions</HQHeader>
            </View>
          }
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
          ListFooterComponent={this.state.loadingMore ?
            <HQActivityIndicator />
            : (questionsList.lastTimestamp === 0) &&
            <View style={hqStyles.mh1}>{newQuestionButton}</View>
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
          <CircleIconCard type="Q" position="left">
            <View style={hqStyles.mt1}>
              <HQText>{question.text}</HQText>
            </View>
          </CircleIconCard>
        </View>
      </TouchableOpacity>
    );
  }

  private loadMore(): void {
    const { questionsList: { lastTimestamp }, loadMoreQuestionItems } = this.props;
    if (lastTimestamp > 0 && !this.state.loadingMore) {
      this.setState({ loadingMore: true });
      loadMoreQuestionItems(lastTimestamp);
    }
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

const mapStateToPros = (state: ApplicationState) => (state.questions);
export default connect(mapStateToPros, QuestionsStore.actionCreators)(HomeScreen);
