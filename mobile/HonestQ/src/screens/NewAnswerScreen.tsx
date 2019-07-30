import React from 'react';
import { NavigationScreenOptions, NavigationScreenProps } from 'react-navigation';
import { connect } from 'react-redux';
import KeyboardPaddedScrollView from '../components/KeyboardPaddedScrollView';
import { HQSubmitButton, HQSuperTextInput, HQText } from '../hq-components';
import hqStyles from '../hq-styles';
import NavigationService from '../NavigationService';
import { AnswerFormModel } from '../server-models';
import { ApplicationState } from '../store';
import * as NewAnswerStore from '../store/NewAnswer';
import ThemeService from '../ThemeService';

export interface NewAnswerNavigationProps {
  questionId: number;
  submit?: () => void;
  submitting?: boolean;
}
type Props = NewAnswerStore.NewAnswerState
  & typeof NewAnswerStore.actionCreators
  & NavigationScreenProps<NewAnswerNavigationProps>;

class NewAnswerScreen extends React.Component<Props, AnswerFormModel> {

  protected static navigationOptions =
    ({ navigation }: NavigationScreenProps): NavigationScreenOptions => {
      return {
        title: 'Got an answer?',
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

    this.state = { text: '' };

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
      NavigationService.goBack();
    }
  }

  public render() {
    const { submitted, error } = this.props;
    const { text: answerText } = this.state;

    return (
      <KeyboardPaddedScrollView style={ThemeService.getStyles().contentView} contentContainerStyle={hqStyles.p1}>
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
