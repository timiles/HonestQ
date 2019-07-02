import React from 'react';
import { View } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { HQButton, HQText } from '../hq-components';
import hqStyles from '../hq-styles';
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
        <View style={hqStyles.mb1}>
          <HQText>{text}</HQText>
        </View>
        <HQButton
          title={getItemCountText('answer', answersCount)}
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
