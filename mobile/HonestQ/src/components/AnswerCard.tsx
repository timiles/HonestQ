import React from 'react';
import { Button, StyleProp, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { HQCard, HQText } from '../hq-components';
import { AnswerNavigationProps } from '../screens/AnswerScreen';
import { AnswerModel } from '../server-models';
import { getItemCountText } from '../utils/string-utils';
import CircleIcon from './CircleIcon';
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
      <HQCard style={styles.cardStyle}>
        <CircleIcon type="A" />
        <View style={styles.contentStyle}>
          <View style={styles.textContainerStyle}>
            <QuotationMarks width={16}>
              <HQText>{text}</HQText>
            </QuotationMarks>
          </View>
          <Button
            title={`Discuss (${getItemCountText('Comment', comments.length)})`}
            onPress={() => this.navigateToAnswer(id)}
          />
        </View>
      </HQCard>
    );
  }

  private navigateToAnswer(answerId: number): void {
    const { questionId } = this.props.navigation.state.params;
    const navProps: AnswerNavigationProps = { questionId, answerId };
    this.props.navigation.navigate('Answer', navProps);
  }
}

const cardStyle: StyleProp<ViewStyle> = {
  marginTop: 10,
};
const contentStyle: StyleProp<ViewStyle> = {
  paddingHorizontal: 40,
  paddingBottom: 10,
};
const textContainerStyle: StyleProp<TextStyle> = {
  marginBottom: 10,
};
const styles = StyleSheet.create({ cardStyle, contentStyle, textContainerStyle });
