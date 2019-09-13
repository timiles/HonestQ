import React from 'react';
import { View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { NavigationScreenOptions, NavigationScreenProps } from 'react-navigation';
import { connect } from 'react-redux';
import AnswerCard from '../components/AnswerCard';
import { InfoCard } from '../components/InfoCard';
import ShareButton from '../components/ShareButton';
import TextWithShortLinks from '../components/TextWithShortLinks';
import TopCircleIconCard from '../components/TopCircleIconCard';
import WatchButton from '../components/WatchButton';
import { HQHeader, HQLoadingView, HQPrimaryButton } from '../hq-components';
import hqStyles from '../hq-styles';
import NavigationService from '../NavigationService';
import { ApplicationState } from '../store';
import * as QuestionStore from '../store/Question';
import ThemeService from '../ThemeService';
import { buildQuestionUrl } from '../utils/route-utils';
import { getItemCountText } from '../utils/string-utils';
import { NewAnswerNavigationProps } from './NewAnswerScreen';

export interface QuestionNavigationProps {
  questionId: number;
  watching?: boolean;
  handleWatch?: (watching: boolean) => void;
  shareUrl?: string;
}

const mapStateToProps = (state: ApplicationState) => (state.question);
const mapDispatchToProps = QuestionStore.actionCreators;

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;
type Props = StateProps & DispatchProps & NavigationScreenProps<QuestionNavigationProps>;

class QuestionScreen extends React.Component<Props> {

  protected static navigationOptions =
    ({ navigation }: NavigationScreenProps<QuestionNavigationProps>): NavigationScreenOptions => {
      const shareUrl = navigation.getParam('shareUrl');
      return {
        title: 'Question',
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

    this.navigateToNewAnswer = this.navigateToNewAnswer.bind(this);
    this.handleUpvote = this.handleUpvote.bind(this);
    this.props.navigation.setParams({ handleWatch: this.handleWatch.bind(this) });
  }

  public componentDidMount() {
    const { questionId } = this.props.navigation.state.params;
    if (!this.props.question || this.props.question.id !== questionId) {
      this.props.getQuestion(questionId);
    }
  }

  public componentDidUpdate() {
    const { navigation, question } = this.props;

    if (!question) {
      return;
    }

    if (navigation.state.params.watching !== question.watching) {
      navigation.setParams({ watching: question.watching });
    }

    if (!navigation.state.params.shareUrl) {
      const questionUrl = buildQuestionUrl(question.id, question.slug);
      this.props.navigation.setParams({ shareUrl: questionUrl });
    }
  }

  public render() {
    const { question } = this.props;
    const { questionId } = this.props.navigation.state.params;

    if (!question || question.id !== questionId) {
      return <HQLoadingView />;
    }

    const { text, context, answers } = question;
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
              <TopCircleIconCard type="Q" style={hqStyles.mb1}>
                <HQHeader>{text}</HQHeader>
              </TopCircleIconCard>
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
    const { text } = this.props.question;
    const navProps: NewAnswerNavigationProps = { questionId, questionText: text };
    NavigationService.navigate('NewAnswer', navProps);
  }

  private handleUpvote(on: boolean, answerId: number): void {
    const { questionId } = this.props.navigation.state.params;
    this.props.updateUpvote(on, questionId, answerId);
  }

  private handleWatch(watching: boolean): void {
    const { questionId } = this.props.navigation.state.params;
    this.props.updateWatchQuestion(watching, questionId);
  }
}

export default connect<StateProps, DispatchProps>(mapStateToProps, mapDispatchToProps)(QuestionScreen);
