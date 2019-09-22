import React from 'react';
import { Picker, StyleSheet, View, ViewStyle } from 'react-native';
import { NavigationScreenOptions, NavigationScreenProps } from 'react-navigation';
import { connect } from 'react-redux';
import CommentCard from '../components/CommentCard';
import KeyboardPaddedScrollView from '../components/KeyboardPaddedScrollView';
import TopCircleIconCard from '../components/TopCircleIconCard';
import { HQHeader, HQLoadingView, HQSubmitButton, HQSuperTextInput } from '../hq-components';
import hqStyles from '../hq-styles';
import { ReportModel } from '../server-models';
import { ApplicationState } from '../store';
import * as QuestionStore from '../store/Question';
import ThemeService from '../ThemeService';
import { postJson } from '../utils/http-utils';
import { showPopup } from '../utils/popup-utils';

export interface ReportNavigationProps {
  questionId: number;
  answerId?: number;
  commentId?: number;
}

const mapStateToProps = (state: ApplicationState) => ({ ...state.question, loggedInUser: state.auth.loggedInUser });
const mapDispatchToProps = { getQuestion: QuestionStore.actionCreators.getQuestion };

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;
type Props = StateProps & DispatchProps & NavigationScreenProps<ReportNavigationProps>;

interface State {
  reason: string;
  otherReason?: string;
  submitting: boolean;
  error?: string;
}

class ReportScreen extends React.Component<Props, State> {

  protected static navigationOptions =
    ({ navigation }: NavigationScreenProps<ReportNavigationProps>): NavigationScreenOptions => {
      const { answerId, commentId } = navigation.state.params;
      const entity = commentId ? 'comment' : answerId ? 'answer' : 'question';
      return {
        title: `Report ${entity}`,
      };
    }

  private readonly reasons = [
    'Bullying or ad hominem attack',
    'Inciting hatred against individuals or groups',
    'Promoting violence or other dangerous activities',
    'Inappropriate sexual content',
    'Other',
  ];

  public constructor(props: Props) {
    super(props);

    this.state = { reason: this.reasons[0], submitting: false };

    this.submit = this.submit.bind(this);
  }

  public componentDidMount() {
    const { questionId } = this.props.navigation.state.params;
    if (!this.props.question || this.props.question.id !== questionId) {
      this.props.getQuestion(questionId);
    }
  }

  public render() {
    const { questionId, answerId, commentId } = this.props.navigation.state.params;
    const { question } = this.props;

    if (!question || question.id !== questionId) {
      return <HQLoadingView />;
    }

    const themeStyles = ThemeService.getStyles();
    const answer = (answerId) ? question.answers.filter((x) => x.id === answerId)[0] : null;
    const comment = (answer && commentId) ? answer.comments.filter((x) => x.id === commentId)[0] : null;
    const entity = commentId ? 'comment' : answerId ? 'answer' : 'question';
    const { reason, otherReason, submitting, error } = this.state;

    return (
      <KeyboardPaddedScrollView style={[themeStyles.contentView, hqStyles.px1]}>
        <TopCircleIconCard type="Q" style={hqStyles.mb1}>
          <HQHeader>{question.text}</HQHeader>
        </TopCircleIconCard>
        {answer &&
          <TopCircleIconCard type="A" style={hqStyles.mb1}>
            <HQHeader>{answer.text}</HQHeader>
          </TopCircleIconCard>
        }
        {comment &&
          <View style={hqStyles.mb1}>
            <CommentCard comment={comment} />
          </View>
        }
        <HQHeader>What is your reason for reporting this {entity}?</HQHeader>
        <View style={[styles.picker, hqStyles.my1]}>
          <Picker
            style={themeStyles.label}
            selectedValue={reason}
            onValueChange={(itemValue) => this.setState({ reason: itemValue })}
          >
            {this.reasons.map((x) => <Picker.Item key={x} label={x} value={x} />)}
          </Picker>
        </View>
        {reason === 'Other' &&
          <HQSuperTextInput
            containerStyle={hqStyles.mb1}
            autoFocus={true}
            placeholder="Please provide a reason"
            maxLength={280}
            value={otherReason}
            onChangeText={(text) => this.setState({ otherReason: text })}
            submitted={!!error}
            error={error}
          />
        }
        <View style={hqStyles.rowAlignEnd}>
          <HQSubmitButton
            title="Submit"
            onPress={this.submit}
            submitting={submitting}
          />
        </View>
      </KeyboardPaddedScrollView>
    );
  }

  private submit() {
    const { reason, otherReason } = this.state;
    const payload: ReportModel = {
      reason: reason !== 'Other' ? reason : otherReason,
    };
    if (!payload.reason) {
      this.setState({ submitting: false, error: 'Reason is required' });
      return;
    }

    this.setState({ submitting: true });

    const { loggedInUser } = this.props;
    const { questionId, answerId, commentId } = this.props.navigation.state.params;
    let url = `/api/questions/${questionId}`;
    if (answerId) {
      url += `/answers/${answerId}`;
      if (commentId) {
        url += `/comments/${commentId}`;
      }
    }
    url += '/report';
    postJson(url, payload, loggedInUser)
      .then(() => {
        showPopup({
          title: 'Thank you',
          message: 'We will investigate the offending content and get back to you.',
          durationMilliseconds: 5000,
        });
        this.props.navigation.goBack();
      })
      .catch((errorReason: string) => {
        this.setState({ submitting: false, error: errorReason });
      });
  }
}

export default connect<StateProps, DispatchProps>(mapStateToProps, mapDispatchToProps)(ReportScreen);

// tslint:disable:no-object-literal-type-assertion
const styles = StyleSheet.create({
  picker: {
    borderWidth: 1,
    borderColor: ThemeService.getBorderColor(),
    borderRadius: 5,
  } as ViewStyle,
});
