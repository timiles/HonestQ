import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { HQLabel, HQText } from '../hq-components';
import hqStyles from '../hq-styles';
import NavigationService from '../NavigationService';
import { QuestionNavigationProps } from '../screens/QuestionScreen';
import { QuestionListItemModel } from '../server-models';
import { getItemCountText } from '../utils/string-utils';
import IconCard from './IconCard';

interface Props {
  question: QuestionListItemModel;
}

export default class QuestionCard extends React.Component<Props> {

  public render() {
    const { question } = this.props;
    const { id, text, answersCount } = question;

    return (
      <TouchableOpacity
        onPress={() => this.navigateToQuestion(id)}
      >
        <IconCard type="Q">
          <View style={hqStyles.mb1}>
            <HQText>{text}</HQText>
          </View>
          <HQLabel>{getItemCountText('answer', answersCount)}</HQLabel>
        </IconCard>
      </TouchableOpacity>
    );
  }

  private navigateToQuestion(questionId: number): void {
    const navProps: QuestionNavigationProps = { questionId };
    NavigationService.navigate('Question', navProps);
  }
}
