import React from 'react';
import { View } from 'react-native';
import { HQNavigationButton, HQText } from '../hq-components';
import hqStyles from '../hq-styles';
import NavigationService from '../NavigationService';
import { AnswerNavigationProps } from '../screens/AnswerScreen';
import { AnswerModel } from '../server-models';
import { getItemCountText } from '../utils/string-utils';
import CircleIconCard from './CircleIconCard';
import QuotationMarks from './QuotationMarks';

interface OwnProps {
  questionId: number;
  answer: AnswerModel;
}

export default class AnswerCard extends React.Component<OwnProps> {

  public render() {
    const { answer } = this.props;
    const { id, text, comments } = answer;

    return (
      <CircleIconCard type="A">
        <View style={hqStyles.mb1}>
          <QuotationMarks width={16}>
            <HQText>{text}</HQText>
          </QuotationMarks>
        </View>
        <HQNavigationButton
          title={`Discuss (${getItemCountText('comment', comments.length)})`}
          onPress={() => this.navigateToAnswer(id)}
        />
      </CircleIconCard>
    );
  }

  private navigateToAnswer(answerId: number): void {
    const { questionId } = this.props;
    const navProps: AnswerNavigationProps = { questionId, answerId };
    NavigationService.navigate('Answer', navProps);
  }
}
