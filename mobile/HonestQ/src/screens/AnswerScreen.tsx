import React from 'react';
import { View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { NavigationScreenOptions, NavigationScreenProps } from 'react-navigation';
import { connect } from 'react-redux';
import CircleIconCard from '../components/CircleIconCard';
import CommentCard from '../components/CommentCard';
import QuotationMarks from '../components/QuotationMarks';
import ReplyButton from '../components/ReplyButton';
import ShareButton from '../components/ShareButton';
import WatchButton from '../components/WatchButton';
import { HQHeader, HQLoadingView } from '../hq-components';
import hqStyles from '../hq-styles';
import NavigationService from '../NavigationService';
import { ApplicationState } from '../store';
import * as QuestionStore from '../store/Question';
import ThemeService from '../ThemeService';
import { buildAnswerUrl } from '../utils/route-utils';
import { NewCommentNavigationProps } from './NewCommentScreen';

export interface AnswerNavigationProps {
  questionId: number;
  answerId: number;
  watching?: boolean;
  handleWatch?: (watching: boolean) => void;
  shareUrl?: string;
}

type Props = QuestionStore.QuestionState
  & typeof QuestionStore.actionCreators
  & NavigationScreenProps<AnswerNavigationProps>;

class AnswerScreen extends React.Component<Props> {

  protected static navigationOptions =
    ({ navigation }: NavigationScreenProps<AnswerNavigationProps>): NavigationScreenOptions => {
      const shareUrl = navigation.getParam('shareUrl');
      return {
        title: 'Discuss this Answer',
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
            {shareUrl && (
              <View style={hqStyles.mr1}>
                <ShareButton fill={ThemeService.getNavTextColor()} url={shareUrl} />
              </View>
            )}
          </>
        ),
      };
    }

  public constructor(props: Props) {
    super(props);

    const { questionId } = this.props.navigation.state.params;
    if (!props.question || props.question.id !== questionId) {
      this.props.getQuestion(questionId);
    }

    this.handleNewComment = this.handleNewComment.bind(this);
    this.handleUpvote = this.handleUpvote.bind(this);
    this.props.navigation.setParams({ handleWatch: this.handleWatch.bind(this) });
  }

  public componentDidUpdate() {
    const { navigation, question } = this.props;

    if (!question) {
      return;
    }

    const answer = question.answers.filter((x) => x.id === this.props.navigation.state.params.answerId)[0];

    if (navigation.state.params.watching !== answer.watching) {
      navigation.setParams({ watching: answer.watching });
    }

    if (!navigation.state.params.shareUrl) {
      const answerUrl = buildAnswerUrl(question.id, question.slug, answer.id, answer.slug);
      this.props.navigation.setParams({ shareUrl: answerUrl });
    }
  }

  public render() {
    const { question } = this.props;
    const { questionId, answerId } = this.props.navigation.state.params;

    if (!question || question.id !== questionId) {
      // This could happen if a notification links straight to an Answer
      return <HQLoadingView />;
    }

    const answer = question.answers.filter((x) => x.id === answerId)[0];

    const { text: questionText } = question;
    const { text, comments } = answer;

    return (
      <View style={ThemeService.getStyles().contentView}>
        <FlatList
          ListHeaderComponent={(
            <View style={[hqStyles.mh1]}>
              <CircleIconCard type="Q">
                <HQHeader>{questionText}</HQHeader>
              </CircleIconCard>
              <CircleIconCard type="A" style={hqStyles.mb1}>
                <QuotationMarks size="large">
                  <HQHeader>{text}</HQHeader>
                </QuotationMarks>
              </CircleIconCard>
              <View style={[hqStyles.flexRowPullRight, hqStyles.mb1]}>
                <ReplyButton onPress={this.handleNewComment} />
              </View>
            </View>
          )}
          data={comments.filter((x) => !x.parentCommentId)}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={[hqStyles.mb1, hqStyles.mh1]}>
              <CommentCard questionId={questionId} answerId={answerId} comment={item} onUpvote={this.handleUpvote} />
            </View>
          )}
        />
      </View>
    );
  }

  private handleNewComment() {
    const { questionId, answerId } = this.props.navigation.state.params;
    const { question } = this.props;
    const answer = question.answers.filter((x) => x.id === answerId)[0];
    const params: NewCommentNavigationProps = { questionId, answerId, answer };
    NavigationService.navigate('NewComment', params);
  }

  private handleUpvote(on: boolean, answerId: number, commentId: number): void {
    const { questionId } = this.props.navigation.state.params;
    this.props.updateUpvote(on, questionId, answerId, commentId);
  }

  private handleWatch(watching: boolean): void {
    const { questionId, answerId } = this.props.navigation.state.params;
    this.props.updateWatchAnswer(watching, questionId, answerId);
  }
}

const mapStateToProps = (state: ApplicationState) => (state.question);
export default connect(mapStateToProps, QuestionStore.actionCreators)(AnswerScreen);
