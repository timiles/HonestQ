import React from 'react';
import { Button, StyleProp, StyleSheet, TextStyle, View } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { HQText } from '../hq-components';
import { QuestionNavigationProps } from '../screens/QuestionScreen';
import { QuestionListItemModel } from '../server-models';
import { getItemCountText } from '../utils/string-utils';
import CircleIconCard from './CircleIconCard';

interface OwnProps {
  question: QuestionListItemModel;
}
type Props = OwnProps &
  NavigationScreenProps;

export default class QuestionCard extends React.Component<Props> {

  public render() {
    const { question } = this.props;
    const { id, text, answersCount } = question;

    return (
      <CircleIconCard type="Q">
        <View style={styles.textContainerStyle}>
          <HQText>{text}</HQText>
        </View>
        <Button
          title={getItemCountText('Answer', answersCount)}
          onPress={() => this.navigateToQuestion(id)}
        />
      </CircleIconCard>
    );
  }

  private navigateToQuestion(questionId: number): void {
    const navProps: QuestionNavigationProps = { questionId };
    this.props.navigation.navigate('Question', navProps);
  }
}

const textContainerStyle: StyleProp<TextStyle> = {
  marginBottom: 10,
};
const styles = StyleSheet.create({ textContainerStyle });
