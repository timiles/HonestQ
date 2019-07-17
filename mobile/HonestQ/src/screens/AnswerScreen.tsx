import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { NavigationScreenOptions, NavigationScreenProps } from 'react-navigation';
import { connect } from 'react-redux';
import CircleIconCard from '../components/CircleIconCard';
import CommentCard from '../components/CommentCard';
import NewCommentCard from '../components/NewCommentCard';
import QuotationMarks from '../components/QuotationMarks';
import WatchButton from '../components/WatchButton';
import { HQContentView, HQHeader, HQPrimaryButton, HQText } from '../hq-components';
import hqStyles from '../hq-styles';
import { ApplicationState } from '../store';
import * as QuestionStore from '../store/Question';
import AgreeIcon from '../svg-icons/AgreeIcon';
import DisagreeIcon from '../svg-icons/DisagreeIcon';

export interface AnswerNavigationProps {
  questionId: number;
  answerId: number;
}

type Props = QuestionStore.QuestionState
  & typeof QuestionStore.actionCreators
  & NavigationScreenProps<AnswerNavigationProps>;

interface State {
  replyWithAgreementRating?: string;
}

class AnswerScreen extends React.Component<Props, State> {

  protected static navigationOptions: NavigationScreenOptions = {
    title: 'Answer',
  };

  public constructor(props: Props) {
    super(props);

    const { questionId } = this.props.navigation.state.params;
    if (!props.question || props.question.id !== questionId) {
      this.props.getQuestion(questionId);
    }

    this.state = {};

    this.handleNewCommentAgree = this.handleNewCommentAgree.bind(this);
    this.handleNewCommentDisagree = this.handleNewCommentDisagree.bind(this);
    this.handleNewCommentCancel = this.handleNewCommentCancel.bind(this);

    this.handleUpvote = this.handleUpvote.bind(this);
    this.handleWatch = this.handleWatch.bind(this);
  }

  public render() {
    const { question } = this.props;
    const { questionId, answerId } = this.props.navigation.state.params;

    if (!question || question.id !== questionId) {
      // This could happen if a notification links straight to an Answer
      return <HQContentView style={hqStyles.center}><ActivityIndicator size="large" /></HQContentView>;
    }

    const answer = question.answers.filter((x) => x.id === answerId)[0];

    const { text: questionText } = question;
    const { text, comments, watching } = answer;
    const { replyWithAgreementRating } = this.state;

    return (
      <HQContentView>
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
                <WatchButton
                  onWatch={this.handleWatch}
                  watching={watching}
                />
                <HQPrimaryButton
                  style={[hqStyles.flexRow, hqStyles.mr1]}
                  onPress={this.handleNewCommentAgree}
                >
                  <HQText style={[hqStyles.primaryButtonText, hqStyles.mr1]}>Agree</HQText>
                  <AgreeIcon fill="#fff" />
                </HQPrimaryButton>
                <HQPrimaryButton
                  style={[hqStyles.flexRow]}
                  onPress={this.handleNewCommentDisagree}
                >
                  <HQText style={[hqStyles.primaryButtonText, hqStyles.mr1]}>Disagree</HQText>
                  <DisagreeIcon fill="#fff" />
                </HQPrimaryButton>
              </View>
              {replyWithAgreementRating &&
                <NewCommentCard
                  questionId={questionId}
                  answerId={answerId}
                  agreementRating={replyWithAgreementRating}
                  onCancel={this.handleNewCommentCancel}
                />
              }
            </View>
          )}
          data={comments.filter((x) => !x.parentCommentId)}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={[hqStyles.mb1, hqStyles.mr1]}>
              <CommentCard questionId={questionId} answerId={answerId} comment={item} onUpvote={this.handleUpvote} />
            </View>
          )}
        />
      </HQContentView>
    );
  }

  private handleNewCommentAgree() {
    this.setState({ replyWithAgreementRating: 'Agree' });
  }
  private handleNewCommentDisagree() {
    this.setState({ replyWithAgreementRating: 'Disagree' });
  }
  private handleNewCommentCancel() {
    this.setState({ replyWithAgreementRating: undefined });
  }

  private handleUpvote(on: boolean, answerId: number, commentId: number): void {
    const { questionId } = this.props.navigation.state.params;
    this.props.updateUpvote(on, questionId, answerId, commentId);
  }

  private handleWatch(on: boolean): void {
    const { questionId, answerId } = this.props.navigation.state.params;
    this.props.updateWatch(on, questionId, answerId);
  }
}

const mapStateToProps = (state: ApplicationState) => (state.question);
export default connect(mapStateToProps, QuestionStore.actionCreators)(AnswerScreen);
