import React from 'react';
import { FlatList } from 'react-native-gesture-handler';
import { NavigationScreenOptions, NavigationScreenProps } from 'react-navigation';
import { connect } from 'react-redux';
import Comment from '../components/Comment';
import { HQContentView, HQText } from '../hq-components';
import { ApplicationState } from '../store';
import * as QuestionStore from '../store/Question';

export interface AnswerNavigationProps {
  questionId: number;
  answerId: number;
}

type Props = QuestionStore.QuestionState
  & typeof QuestionStore.actionCreators
  & NavigationScreenProps<AnswerNavigationProps>;

class AnswerScreen extends React.Component<Props> {

  protected static navigationOptions: NavigationScreenOptions = {
    title: 'Answer',
  };

  public constructor(props: Props) {
    super(props);

    const { questionId } = this.props.navigation.state.params;
    if (!props.question || props.question.id !== questionId) {
      this.props.getQuestion(questionId);
    }
  }

  public render() {
    const { question } = this.props;
    const { questionId, answerId } = this.props.navigation.state.params;

    if (!question || question.id !== questionId) {
      return <HQContentView><HQText>Loading</HQText></HQContentView>;
    }

    const answer = question.answers.filter((x) => x.id === answerId)[0];

    const { text: questionText } = question;
    const { text, comments } = answer;

    return (
      <HQContentView>
        <HQText>{questionText}</HQText>
        <HQText>{text}</HQText>
        <FlatList
          data={comments.filter((x) => !x.parentCommentId)}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <Comment comment={item} />}
        />
      </HQContentView>
    );
  }
}

const mapStateToProps = (state: ApplicationState) => (state.question);
export default connect(mapStateToProps, QuestionStore.actionCreators)(AnswerScreen);
