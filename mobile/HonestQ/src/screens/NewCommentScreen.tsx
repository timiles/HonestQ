import React from 'react';
import { View } from 'react-native';
import { NavigationScreenOptions, NavigationScreenProps } from 'react-navigation';
import { connect } from 'react-redux';
import AgreementLabel from '../components/AgreementLabel';
import CommentCard from '../components/CommentCard';
import KeyboardPaddedScrollView from '../components/KeyboardPaddedScrollView';
import QuotationMarks from '../components/QuotationMarks';
import TopCircleIconCard from '../components/TopCircleIconCard';
import { HQCard, HQSubmitButton, HQSuperTextInput, HQText, HQTextInput } from '../hq-components';
import hqStyles from '../hq-styles';
import { LoggedInUserContext } from '../LoggedInUserContext';
import NavigationService from '../NavigationService';
import { AnswerModel, CommentFormModel, CommentModel } from '../server-models';
import { ApplicationState } from '../store';
import * as NewCommentStore from '../store/NewComment';
import ThemeService from '../ThemeService';

export interface NewCommentNavigationProps {
  questionId: number;
  answerId: number;
  answer?: AnswerModel;
  parentComment?: CommentModel;
  submit?: () => void;
  submitting?: boolean;
}

const mapStateToProps = (state: ApplicationState) => (state.newComment);
const mapDispatchToProps = NewCommentStore.actionCreators;

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;
type Props = StateProps & DispatchProps & NavigationScreenProps<NewCommentNavigationProps>;

class NewCommentScreen extends React.Component<Props, CommentFormModel> {

  protected static navigationOptions: NavigationScreenOptions = {
    title: 'Reply',
  };

  constructor(props: Props) {
    super(props);

    const { parentComment } = this.props.navigation.state.params;
    this.state = {
      text: '',
      source: '',
      isAgree: true,
      parentCommentId: parentComment ? parentComment.id : null,
      isAnonymous: false,
    };

    this.handleAgreementSwitch = this.handleAgreementSwitch.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  public componentDidMount() {
    this.props.navigation.setParams({ submit: this.handleSubmit });
  }

  public componentDidUpdate(prevProps: Props) {
    if (prevProps.submitting !== this.props.submitting) {
      this.props.navigation.setParams({ submitting: this.props.submitting });
    }
    if (prevProps.submitted && !this.props.submitted) {
      // Close when a Comment has been successfully submitted
      NavigationService.goBack();
    }
  }

  public componentWillUnmount() {
    this.props.reset();
  }

  public render() {
    const { answer, parentComment } = this.props.navigation.state.params;

    const { submitted, submitting, error } = this.props;
    const { text: commentText, source, isAgree } = this.state;

    return (
      <KeyboardPaddedScrollView style={ThemeService.getStyles().contentView} contentContainerStyle={hqStyles.p1}>
        {parentComment ? this.renderParentComment(parentComment) : this.renderAnswer(answer)}
        <HQCard style={[hqStyles.mb1, hqStyles.p1, (parentComment ? hqStyles.ml1 : null)]}>
          <View style={[hqStyles.row, hqStyles.mb1]}>
            <AgreementLabel onSwitch={this.handleAgreementSwitch} isAgree={isAgree} size="medium" />
            <LoggedInUserContext.Consumer>
              {(user) =>
                <HQText style={[hqStyles.ml1, hqStyles.vAlignCenter]}>{user.username}</HQText>
              }
            </LoggedInUserContext.Consumer>
          </View>
          {error && <HQText style={[hqStyles.error, hqStyles.mb1]}>{error}</HQText>}
          <HQSuperTextInput
            containerStyle={hqStyles.mb1}
            autoFocus={true}
            placeholder="Comment"
            maxLength={280}
            value={commentText}
            onChangeText={(text) => this.setState({ text })}
            submitted={submitted && !error}
            error={!commentText ? 'Comment is required' : null}
          />
          <HQTextInput
            containerStyle={hqStyles.mb1}
            keyboardType="url"
            placeholder="Source (optional)"
            maxLength={2000}
            value={source}
            onChangeText={(text) => this.setState({ source: text })}
            submitted={submitted && !error}
          />
          <View style={[hqStyles.rowAlignEnd, hqStyles.mt1]}>
            <HQSubmitButton title="Submit" submitting={submitting} onPress={this.handleSubmit} />
          </View>
        </HQCard>
      </KeyboardPaddedScrollView>
    );
  }

  private renderAnswer(answer: AnswerModel) {
    return (
      <TopCircleIconCard type="A" style={hqStyles.mb1}>
        <QuotationMarks size="small">
          <HQText>{answer.text}</HQText>
        </QuotationMarks>
      </TopCircleIconCard>
    );
  }

  private renderParentComment(parentComment: CommentModel) {
    return <CommentCard comment={parentComment} renderChildComments={false} />;
  }

  private handleAgreementSwitch(isAgree: boolean): void {
    this.setState({ isAgree });
  }

  private handleSubmit(): void {
    const { questionId, answerId } = this.props.navigation.state.params;
    this.props.submit(questionId, answerId, this.state);
  }
}

export default connect<StateProps, DispatchProps>(mapStateToProps, mapDispatchToProps)(NewCommentScreen);
