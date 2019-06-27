import React from 'react';
import { Button } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { NavigationScreenOptions, NavigationScreenProps } from 'react-navigation';
import { connect } from 'react-redux';
import { HQContentView, HQLabel, HQText } from '../hq-components';
import { ApplicationState } from '../store';
import * as QuestionStore from '../store/Question';
import { getItemCountText } from '../utils/string-utils';
import { AnswerNavigationProps } from './AnswerScreen';

export interface QuestionNavigationProps {
  questionId: number;
}

type Props = QuestionStore.QuestionState
  & typeof QuestionStore.actionCreators
  & NavigationScreenProps<QuestionNavigationProps>;

class QuestionScreen extends React.Component<Props> {

  protected static navigationOptions: NavigationScreenOptions = {
    title: 'Question',
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
    const { questionId } = this.props.navigation.state.params;

    if (!question || question.id !== questionId) {
      return <HQContentView><HQText>Loading</HQText></HQContentView>;
    }

    const { text, context, tags, answers } = question;
    const answersCountText = getItemCountText('Answer', answers.length);

    return (
      <HQContentView>
        <HQText>{text}</HQText>
        <HQText>{answersCountText}</HQText>
        <HQText>{context}</HQText>
        <HQLabel>Tags:</HQLabel>
        <FlatList
          data={tags}
          keyExtractor={(item) => item.slug}
          renderItem={({ item }) => <HQText>{item.name}</HQText>}
        />
        <HQLabel>Answers:</HQLabel>
        <FlatList
          data={answers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <>
              <HQText>{item.text}</HQText>
              <Button
                title={`Discuss (${getItemCountText('Comment', item.comments.length)})`}
                onPress={() => this.navigateToAnswer(item.id)}
              />
            </>
          )}
        />
      </HQContentView>
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
