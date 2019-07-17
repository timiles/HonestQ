import React from 'react';
import { NavigationScreenProps } from 'react-navigation';
import { connect } from 'react-redux';
import KeyboardPaddedScrollView from '../components/KeyboardPaddedScrollView';
import { HQHeader, HQSubmitButton, HQSuperTextInput, HQText } from '../hq-components';
import hqStyles from '../hq-styles';
import NavigationService from '../NavigationService';
import { AnswerFormModel } from '../server-models';
import { ApplicationState } from '../store';
import * as NewAnswerStore from '../store/NewAnswer';

export interface NewAnswerNavigationProps {
  questionId: number;
}
type Props = NewAnswerStore.NewAnswerState
  & typeof NewAnswerStore.actionCreators
  & NavigationScreenProps<NewAnswerNavigationProps>;

class NewAnswerScreen extends React.Component<Props, AnswerFormModel> {

  constructor(props: Props) {
    super(props);

    this.state = { text: '' };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  public componentDidUpdate(prevProps: Props) {
    if (prevProps.submitted && !this.props.submitted) {
      NavigationService.goBack();
    }
  }

  public render() {
    const { submitting, submitted, error } = this.props;
    const { text: answerText } = this.state;

    return (
      <KeyboardPaddedScrollView style={hqStyles.contentView} contentContainerStyle={hqStyles.p1}>
        <HQHeader style={hqStyles.mb1}>Got an answer?</HQHeader>
        {error && <HQText style={[hqStyles.error, hqStyles.mb1]}>{error}</HQText>}
        <HQSuperTextInput
          containerStyle={hqStyles.mb1}
          autoFocus={true}
          placeholder="Provide a short summary of your answer"
          helpText="You can back up your answer with specific details and sources in the Comments section."
          maxLength={280}
          value={answerText}
          onChangeText={(text) => this.setState({ text })}
          submitted={submitted && !error}
          error={!answerText ? 'Answer is required' : null}
        />
        <HQSubmitButton title="Submit" submitting={submitting} onPress={this.handleSubmit} />
      </KeyboardPaddedScrollView>
    );
  }

  private handleSubmit(): void {
    const { questionId } = this.props.navigation.state.params;
    this.props.submit(questionId, this.state);
  }
}

const mapStateToProps = (state: ApplicationState) => (state.newAnswer);
export default connect(mapStateToProps, NewAnswerStore.actionCreators)(NewAnswerScreen);
