import React from 'react';
import { View } from 'react-native';
import { HQNavigationButton, HQText } from '../hq-components';
import hqStyles from '../hq-styles';
import NavigationService from '../NavigationService';
import { QuestionNavigationProps } from '../screens/QuestionScreen';
import { QuestionListItemModel } from '../server-models';
import { getItemCountText } from '../utils/string-utils';
import CircleIconCard from './CircleIconCard';

interface Props {
  question: QuestionListItemModel;
}

export default class QuestionCard extends React.Component<Props> {

  public render() {
    const { question } = this.props;
    const { id, text, answersCount } = question;

    return (
      <CircleIconCard type="Q">
        <View style={hqStyles.mb1}>
          <HQText>{text}</HQText>
        </View>
        <HQNavigationButton
          title={getItemCountText('answer', answersCount)}
          onPress={() => this.navigateToQuestion(id)}
        />
      </CircleIconCard>
    );
  }

  private navigateToQuestion(questionId: number): void {
    const navProps: QuestionNavigationProps = { questionId };
    NavigationService.navigate('Question', navProps);
  }
}
