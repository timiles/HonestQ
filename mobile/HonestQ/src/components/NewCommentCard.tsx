import React from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';
import { HQCard, HQNavigationButton, HQSubmitButton, HQText, HQTextInput } from '../hq-components';
import hqStyles from '../hq-styles';
import { CommentFormModel } from '../server-models';
import { ApplicationState } from '../store';
import * as NewCommentStore from '../store/NewComment';
import AgreementLabel from './AgreementLabel';

interface OwnProps {
  questionId: number;
  answerId: number;
  agreementRating: string;
  parentCommentId?: number;
  onCancel: () => void;
}

type Props = NewCommentStore.NewCommentState
  & typeof NewCommentStore.actionCreators
  & OwnProps;

class NewCommentCard extends React.Component<Props, CommentFormModel> {

  constructor(props: Props) {
    super(props);

    this.state = {
      text: '',
      source: '',
      agreementRating: this.props.agreementRating,
      parentCommentId: this.props.parentCommentId,
      isAnonymous: false,
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  public componentDidUpdate(prevProps: Props) {
    if (prevProps.agreementRating !== this.props.agreementRating) {
      this.setState({ agreementRating: this.props.agreementRating });
    }
    if (prevProps.submitted && !this.props.submitted) {
      // Close when a Comment has been successfully submitted
      this.props.onCancel();
    }
  }

  public render() {
    const { submitting, submitted, error } = this.props;
    const { text: commentText, source, agreementRating } = this.state;

    return (
      <HQCard style={[hqStyles.mb1, hqStyles.p1]}>
        <View style={[hqStyles.flexRow, hqStyles.mb1]}>
          <AgreementLabel isAgree={agreementRating === 'Agree'} />
          <HQText style={[hqStyles.ml1, hqStyles.vAlignCenter]}>todo_username</HQText>
        </View>
        {error && <HQText style={[hqStyles.error, hqStyles.mb1]}>{error}</HQText>}
        <HQTextInput
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
        <View style={hqStyles.flexRowPullRight}>
          <HQNavigationButton title="Cancel" style={hqStyles.mr1} onPress={this.props.onCancel} />
          <HQSubmitButton title="Submit" submitting={submitting} onPress={this.handleSubmit} />
        </View>
      </HQCard>
    );
  }

  private handleSubmit(): void {
    const { questionId, answerId, submit } = this.props;
    submit(questionId, answerId, this.state);
  }
}

const mapStateToProps = (state: ApplicationState, ownProps: OwnProps) => ({ ...state.newComment, ...ownProps });
export default connect(mapStateToProps, NewCommentStore.actionCreators)(NewCommentCard);
