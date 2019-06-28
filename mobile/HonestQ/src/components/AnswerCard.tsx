import React from 'react';
import { Button, StyleProp, StyleSheet, TextStyle, View } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { HQText } from '../hq-components';
import { AnswerNavigationProps } from '../screens/AnswerScreen';
import { AnswerModel } from '../server-models';
import { getItemCountText } from '../utils/string-utils';
import CircleIconCard from './CircleIconCard';
import QuotationMarks from './QuotationMarks';

interface OwnProps {
  answer: AnswerModel;
}
type Props = OwnProps &
  NavigationScreenProps;

export default class AnswerCard extends React.Component<Props> {

  public render() {
    const { answer } = this.props;
    const { id, text, comments } = answer;

    return (
      <CircleIconCard type="A">
        <View style={styles.textContainerStyle}>
          <QuotationMarks width={16}>
            <HQText>{text}</HQText>
          </QuotationMarks>
        </View>
        <Button
          title={`Discuss (${getItemCountText('Comment', comments.length)})`}
          onPress={() => this.navigateToAnswer(id)}
        />
      </CircleIconCard>
    );
  }

  private navigateToAnswer(answerId: number): void {
    const { questionId } = this.props.navigation.state.params;
    const navProps: AnswerNavigationProps = { questionId, answerId };
    this.props.navigation.navigate('Answer', navProps);
  }
}

const textContainerStyle: StyleProp<TextStyle> = {
  marginBottom: 10,
};
const styles = StyleSheet.create({ textContainerStyle });
