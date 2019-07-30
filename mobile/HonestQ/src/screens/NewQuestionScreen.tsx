import React from 'react';
import { showMessage } from 'react-native-flash-message';
import { NavigationScreenOptions, NavigationScreenProps } from 'react-navigation';
import { connect } from 'react-redux';
import KeyboardPaddedScrollView from '../components/KeyboardPaddedScrollView';
import { HQSubmitButton, HQSuperTextInput, HQText, HQTextInput } from '../hq-components';
import hqStyles from '../hq-styles';
import NavigationService from '../NavigationService';
import { QuestionFormModel, TagValueModel } from '../server-models';
import { ApplicationState } from '../store';
import * as NewQuestionStore from '../store/NewQuestion';
import ThemeService from '../ThemeService';

export interface NewQuestionNavigationProps {
  initialTagValues?: TagValueModel[];
  submit?: () => void;
  submitting?: boolean;
}
type Props = NewQuestionStore.NewQuestionState
  & typeof NewQuestionStore.actionCreators
  & NavigationScreenProps<NewQuestionNavigationProps>;

class NewQuestionScreen extends React.Component<Props, QuestionFormModel> {

  protected static navigationOptions =
    ({ navigation }: NavigationScreenProps): NavigationScreenOptions => {
      return {
        title: 'Ask a question',
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

    const { initialTagValues } = this.props.navigation.state.params;
    this.state = { text: '', context: '', tags: initialTagValues || [] };

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
      if (this.props.awaitingApproval) {
        showMessage({
          message: 'Success',
          description: 'Your question has been created and is awaiting approval!',
          type: 'success',
          icon: 'success',
          floating: true,
          duration: 3000,
        });
      }
      NavigationService.goBack();
    }
  }

  public render() {
    const { submitted, error } = this.props;
    const { text: questionText, context, tags } = this.state;

    return (
      <KeyboardPaddedScrollView style={ThemeService.getStyles().contentView} contentContainerStyle={hqStyles.p1}>
        {error && <HQText style={[hqStyles.error, hqStyles.mb1]}>{error}</HQText>}
        <HQSuperTextInput
          containerStyle={hqStyles.mb1}
          autoFocus={true}
          placeholder="Question"
          maxLength={280}
          value={questionText}
          onChangeText={(text) => this.setState({ text })}
          submitted={submitted && !error}
          error={!questionText ? 'Question is required' : null}
        />
        <HQTextInput
          containerStyle={hqStyles.mb1}
          placeholder="Context (optional)"
          helpText="Provide context if it would help people to understand why you are asking this question."
          maxLength={2000}
          value={context}
          onChangeText={(text) => this.setState({ context: text })}
          submitted={submitted && !error}
        />
      </KeyboardPaddedScrollView>
    );
  }

  private handleSubmit(): void {
    this.props.submit(this.state);
  }
}

const mapStateToProps = (state: ApplicationState) => (state.newQuestion);
export default connect(mapStateToProps, NewQuestionStore.actionCreators)(NewQuestionScreen);
