import React from 'react';
import { View } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { HQNavigationButton, HQText } from '../hq-components';
import hqStyles from '../hq-styles';
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
    const { questionId } = this.props.navigation.state.params;
    const navProps: AnswerNavigationProps = { questionId, answerId };
    this.props.navigation.navigate('Answer', navProps);
  }
}
