import React from 'react';
import { Text } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { NavigationScreenProp } from 'react-navigation';
import { connect } from 'react-redux';
import Comment from '../components/Comment';
import { ApplicationState } from '../store';
import * as QuestionStore from '../store/Question';

export interface AnswerNavigationProps {
  questionId: number;
  answerId: number;
}

interface NavProps {
  navigation: NavigationScreenProp<{}, AnswerNavigationProps>;
}

type Props = QuestionStore.QuestionState
  & typeof QuestionStore.actionCreators
  & NavProps;

class AnswerScreen extends React.Component<Props> {

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
      return <Text>Loading</Text>;
    }

    const answer = question.answers.filter((x) => x.id === answerId)[0];

    const { text: questionText } = question;
    const { text, comments } = answer;

    return (
      <>
        <Text>{questionText}</Text>
        <Text>{text}</Text>
        <FlatList
          data={comments.filter((x) => !x.parentCommentId)}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <Comment comment={item} />}
        />
      </>
    );
  }
}

const mapStateToProps = (state: ApplicationState) => (state.question);
export default connect(mapStateToProps, QuestionStore.actionCreators)(AnswerScreen);
