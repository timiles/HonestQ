import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { HQLabel, HQText } from '../hq-components';
import hqStyles from '../hq-styles';
import NavigationService from '../NavigationService';
import { AnswerNavigationProps } from '../screens/AnswerScreen';
import { AnswerModel } from '../server-models';
import { getCommentScores } from '../utils/model-utils';
import AgreementLabel from './AgreementLabel';
import CircleIconCard from './CircleIconCard';
import QuotationMarks from './QuotationMarks';

interface OwnProps {
  questionId: number;
  answer: AnswerModel;
  onUpvote(on: boolean, answerId: number): void;
}

export default class AnswerCard extends React.Component<OwnProps> {

  public render() {
    const { answer } = this.props;
    const { id, text, comments } = answer;
    const [agreeCount, disagreeCount] = getCommentScores(comments);

    return (
      <TouchableOpacity
        onPress={() => this.navigateToAnswer(id)}
      >
        <CircleIconCard type="A" position="left">
          <View style={hqStyles.m1}>
            <QuotationMarks size="small">
              <HQText>{text}</HQText>
            </QuotationMarks>
            {comments && comments.length > 0 &&
              <View style={[hqStyles.flexRowAlignCenter, hqStyles.mt1]}>
                <HQLabel>Comments:</HQLabel>
                {agreeCount > 0 &&
                  <>
                    <View style={hqStyles.ml1}>
                      <AgreementLabel isAgree={true} />
                    </View>
                    <HQLabel> × {agreeCount}</HQLabel>
                  </>
                }
                {disagreeCount > 0 &&
                  <>
                    <View style={hqStyles.ml1}>
                      <AgreementLabel isAgree={false} />
                    </View>
                    <HQLabel> × {disagreeCount}</HQLabel>
                  </>
                }
              </View>
            }
          </View>
        </CircleIconCard>
      </TouchableOpacity>
    );
  }

  private navigateToAnswer(answerId: number): void {
    const { questionId } = this.props;
    const navProps: AnswerNavigationProps = { questionId, answerId };
    NavigationService.navigate('Answer', navProps);
  }
}
