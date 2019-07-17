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
import UpvoteButton from './UpvoteButton';

interface OwnProps {
  questionId: number;
  answer: AnswerModel;
  onUpvote(on: boolean, answerId: number): void;
}

export default class AnswerCard extends React.Component<OwnProps> {

  public render() {
    const { answer, onUpvote } = this.props;
    const { id, text, comments, upvotes, upvotedByMe } = answer;

    return (
      <CircleIconCard type="A">
        <View style={hqStyles.mb1}>
          <QuotationMarks size="small">
            <HQText>{text}</HQText>
          </QuotationMarks>
        </View>
        <View style={hqStyles.flexRow}>
          <UpvoteButton
            answerId={id}
            count={upvotes}
            isUpvotedByLoggedInUser={upvotedByMe}
            onUpvote={onUpvote}
          />
          <HQNavigationButton
            style={hqStyles.ml1}
            title={`Discuss (${getItemCountText('comment', comments.length)})`}
            onPress={() => this.navigateToAnswer(id)}
          />
        </View>
      </CircleIconCard>
    );
  }

  private navigateToAnswer(answerId: number): void {
    const { questionId } = this.props;
    const navProps: AnswerNavigationProps = { questionId, answerId };
    NavigationService.navigate('Answer', navProps);
  }
}
