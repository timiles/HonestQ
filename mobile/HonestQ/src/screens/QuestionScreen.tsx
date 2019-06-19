import React from 'react';
import { Button, Text } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { NavigationScreenProp } from 'react-navigation';
import { connect } from 'react-redux';
import { ApplicationState } from '../store';
import * as QuestionStore from '../store/Question';
import { getItemCountText } from '../utils/string-utils';
import { AnswerNavigationProps } from './AnswerScreen';

export interface QuestionNavigationProps {
  questionId: number;
}

interface NavProps {
  navigation: NavigationScreenProp<{}, QuestionNavigationProps>;
}

type Props = QuestionStore.QuestionState
  & typeof QuestionStore.actionCreators
  & NavProps;

class QuestionScreen extends React.Component<Props> {

  public constructor(props: Props) {
    super(props);

    const { questionId } = this.props.navigation.state.params;
    if (!props.question || props.question.id !== questionId) {
      this.props.getQuestion(questionId);
    }
  }

  public render() {
    const { question } = this.props;
    const { questionId } = this.props.navigation.state.params;

    if (!question || question.id !== questionId) {
      return <Text>Loading</Text>;
    }

    const { text, context, tags, answers } = question;
    const answersCountText = getItemCountText('Answers', answers.length);

    return (
      <>
        <Text>{text}</Text>
        <Text>{answersCountText}</Text>
        <Text>{context}</Text>
        <Text>Tags:</Text>
        <FlatList
          data={tags}
          keyExtractor={(item) => item.slug}
          renderItem={({ item }) => <Text>{item.name}</Text>}
        />
        <Text>Answers:</Text>
        <FlatList
          data={answers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <>
              <Text>{item.text}</Text>
              <Button
                title={`Discuss (${getItemCountText('Comment', item.comments.length)})`}
                onPress={() => this.navigateToAnswer(item.id)}
              />
            </>
          )}
        />
      </>
    );
  }

  private navigateToAnswer(answerId: number): void {
    const { questionId } = this.props.navigation.state.params;
    const navProps: AnswerNavigationProps = { questionId, answerId };
    this.props.navigation.navigate('Answer', navProps);
  }
}

const mapStateToProps = (state: ApplicationState) => (state.question);
export default connect(mapStateToProps, QuestionStore.actionCreators)(QuestionScreen);
