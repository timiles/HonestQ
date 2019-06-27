import React from 'react';
import { Button, StyleProp, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { HQText } from '../hq-components';
import { AnswerNavigationProps } from '../screens/AnswerScreen';
import { AnswerModel } from '../server-models';
import { getItemCountText } from '../utils/string-utils';
import CircleIcon from './CircleIcon';

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
      <View style={styles.cardStyle}>
        <CircleIcon type="A" />
        <View style={styles.contentStyle}>
          <HQText style={styles.textStyle}>{text}</HQText>
          <Button
            title={`Discuss (${getItemCountText('Comment', comments.length)})`}
            onPress={() => this.navigateToAnswer(id)}
          />
        </View>
      </View>
    );
  }

  private navigateToAnswer(answerId: number): void {
    const { questionId } = this.props.navigation.state.params;
    const navProps: AnswerNavigationProps = { questionId, answerId };
    this.props.navigation.navigate('Answer', navProps);
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
