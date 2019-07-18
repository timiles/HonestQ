import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { NavigationScreenOptions, NavigationScreenProps } from 'react-navigation';
import { connect } from 'react-redux';
import AgreementLabel from '../components/AgreementLabel';
import CircleIconCard from '../components/CircleIconCard';
import CommentCard from '../components/CommentCard';
import KeyboardPaddedScrollView from '../components/KeyboardPaddedScrollView';
import QuotationMarks from '../components/QuotationMarks';
import { HQCard, HQSubmitButton, HQSuperTextInput, HQText, HQTextInput } from '../hq-components';
import hqStyles from '../hq-styles';
import { LoggedInUserContext } from '../LoggedInUserContext';
import NavigationService from '../NavigationService';
import { AnswerModel, CommentFormModel, CommentModel } from '../server-models';
import { ApplicationState } from '../store';
import * as NewCommentStore from '../store/NewComment';

export interface NewCommentNavigationProps {
  questionId: number;
  answerId: number;
  answer?: AnswerModel;
  parentComment?: CommentModel;
  submit?: () => void;
  submitting?: boolean;
}
type Props = NewCommentStore.NewCommentState
  & typeof NewCommentStore.actionCreators
  & NavigationScreenProps<NewCommentNavigationProps>;

class NewCommentScreen extends React.Component<Props, CommentFormModel> {

  protected static navigationOptions =
    ({ navigation }: NavigationScreenProps): NavigationScreenOptions => {
      return {
        title: 'Reply',
        headerRight: (
          <HQSubmitButton
            style={hqStyles.mr1}
            title="Submit"
            onPress={navigation.getParam('submit')}
            submitting={navigation.getParam('submitting')}
          />
        ),
      };
    }

  constructor(props: Props) {
    super(props);

    const { parentComment } = this.props.navigation.state.params;
    this.state = {
      text: '',
      source: '',
      agreementRating: 'Agree',
      parentCommentId: parentComment ? parentComment.id : null,
      isAnonymous: false,
    };

    this.handleAgree = this.handleAgree.bind(this);
    this.handleDisagree = this.handleDisagree.bind(this);
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

  public render() {
    const { answer, parentComment } = this.props.navigation.state.params;

    const { submitted, error } = this.props;
    const { text: commentText, source, agreementRating } = this.state;

    return (
      <KeyboardPaddedScrollView style={hqStyles.contentView} contentContainerStyle={hqStyles.p1}>
        {parentComment ? this.renderParentComment(parentComment) : this.renderAnswer(answer)}
        <HQCard style={[hqStyles.mb1, hqStyles.p1, (parentComment ? hqStyles.ml1 : null)]}>
          <View style={[hqStyles.flexRow, hqStyles.mb1]}>
            <TouchableOpacity
              onPress={this.handleAgree}
              disabled={agreementRating === 'Agree'}
            >
              <AgreementLabel isAgree={true} disabled={agreementRating === 'Disagree'} size="medium" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={this.handleDisagree}
              disabled={agreementRating === 'Disagree'}
            >
              <AgreementLabel isAgree={false} disabled={agreementRating === 'Agree'} size="medium" />
            </TouchableOpacity>
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
            placeholder="Source (optional)"
            maxLength={2000}
            value={source}
            onChangeText={(text) => this.setState({ source: text })}
            submitted={submitted && !error}
          />
        </HQCard>
      </KeyboardPaddedScrollView>
    );
  }

  private renderAnswer(answer: AnswerModel) {
    return (
      <CircleIconCard type="A" style={[hqStyles.mb1]}>
        <QuotationMarks size="small">
          <HQText>{answer.text}</HQText>
        </QuotationMarks>
      </CircleIconCard>
    );
  }

  private renderParentComment(parentComment: CommentModel) {
    return <CommentCard comment={parentComment} renderChildComments={false} />;
  }

  private handleAgree(): void {
    this.setState({ agreementRating: 'Agree' });
  }

  private handleDisagree(): void {
    this.setState({ agreementRating: 'Disagree' });
  }

  private handleSubmit(): void {
    const { questionId, answerId } = this.props.navigation.state.params;
    this.props.submit(questionId, answerId, this.state);
  }
}

const mapStateToProps = (state: ApplicationState) => (state.newComment);
export default connect(mapStateToProps, NewCommentStore.actionCreators)(NewCommentScreen);
