import React from 'react';
import { Button, StyleProp, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { HQText } from '../hq-components';
import { QuestionNavigationProps } from '../screens/QuestionScreen';
import { QuestionListItemModel } from '../server-models';
import { getItemCountText } from '../utils/string-utils';
import CircleIcon from './CircleIcon';

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
      <View style={styles.cardStyle}>
        <CircleIcon type="Q" />
        <View style={styles.contentStyle}>
          <HQText style={styles.textStyle}>{text}</HQText>
          <Button
            title={getItemCountText('Answer', answersCount)}
            onPress={() => this.navigateToQuestion(id)}
          />
        </View>
      </View>
    );
  }

  private navigateToQuestion(questionId: number): void {
    const navProps: QuestionNavigationProps = { questionId };
    this.props.navigation.navigate('Question', navProps);
  }
}

const cardStyle: StyleProp<ViewStyle> = {
  flex: 1,
  marginTop: 10,
  backgroundColor: '#1f2b3a',
  borderColor: '#394D67',
  borderWidth: 1,
};
const contentStyle: StyleProp<ViewStyle> = {
  paddingHorizontal: 40,
  paddingBottom: 10,
};
const textStyle: StyleProp<TextStyle> = {
  paddingBottom: 10,
};
const styles = StyleSheet.create({ cardStyle, contentStyle, textStyle });
