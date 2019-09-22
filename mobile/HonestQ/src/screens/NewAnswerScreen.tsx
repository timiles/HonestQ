import React from 'react';
import { View } from 'react-native';
import { NavigationScreenOptions, NavigationScreenProps } from 'react-navigation';
import { connect } from 'react-redux';
import KeyboardPaddedScrollView from '../components/KeyboardPaddedScrollView';
import TopCircleIconCard from '../components/TopCircleIconCard';
import { HQHeader, HQLabel, HQSubmitButton, HQSuperTextInput, HQText, HQTextInput } from '../hq-components';
import hqStyles from '../hq-styles';
import NavigationService from '../NavigationService';
import { AnswerFormModel } from '../server-models';
import { ApplicationState } from '../store';
import * as NewAnswerStore from '../store/NewAnswer';
import ThemeService from '../ThemeService';

export interface NewAnswerNavigationProps {
  questionId: number;
  questionText: string;
}

const mapStateToProps = (state: ApplicationState) => (state.newAnswer);
const mapDispatchToProps = NewAnswerStore.actionCreators;

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

type Props = StateProps & DispatchProps & NavigationScreenProps<NewAnswerNavigationProps>;

class NewAnswerScreen extends React.Component<Props, AnswerFormModel> {

  protected static navigationOptions: NavigationScreenOptions = {
    title: 'Got an answer?',
  };

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

  public componentWillUnmount() {
    this.props.reset();
  }

  public render() {
    const { submitting, submitted, error } = this.props;
    const { questionText } = this.props.navigation.state.params;
    const { text: answerText, commentText, commentSource } = this.state;

    return (
      <KeyboardPaddedScrollView
        style={ThemeService.getStyles().contentView}
        contentContainerStyle={[hqStyles.p1, hqStyles.pt0]}
      >
        <TopCircleIconCard type="Q" style={hqStyles.mb1}>
          <HQHeader>{questionText}</HQHeader>
        </TopCircleIconCard>
        {error && <HQText style={[hqStyles.error, hqStyles.mb1]}>{error}</HQText>}
        <HQLabel style={hqStyles.my1}>
          Provide a generic, short summary of your answer
        </HQLabel>
        <HQSuperTextInput
          containerStyle={hqStyles.mb1}
          autoFocus={true}
          placeholder="Summary"
          maxLength={280}
          value={answerText}
          onChangeText={(text) => this.setState({ text })}
          submitted={submitted && !error}
          error={!answerText ? 'Answer is required' : null}
        />
        <HQLabel style={hqStyles.my1}>
          You can add a comment and source too, if you want to provide more specific detail
        </HQLabel>
        <HQSuperTextInput
          containerStyle={hqStyles.mb1}
          placeholder="Comment"
          maxLength={280}
          value={commentText}
          onChangeText={(text) => this.setState({ commentText: text })}
          submitted={submitted && !error}
          error={commentSource && !commentText ? 'Please add a comment to explain your source' : null}
        />
        <HQTextInput
          containerStyle={hqStyles.mb1}
          keyboardType="url"
          placeholder="Source"
          maxLength={2000}
          value={commentSource}
          onChangeText={(text) => this.setState({ commentSource: text })}
          submitted={submitted && !error}
        />
        <View style={[hqStyles.rowAlignEnd, hqStyles.mt1]}>
          <HQSubmitButton title="Submit" submitting={submitting} onPress={this.handleSubmit} />
        </View>
      </KeyboardPaddedScrollView>
    );
  }

  private handleSubmit(): void {
    const { questionId } = this.props.navigation.state.params;
    this.props.submit(questionId, this.state);
  }
}

export default connect<StateProps, DispatchProps>(mapStateToProps, mapDispatchToProps)(NewAnswerScreen);
