import React from 'react';
import { View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { HQCard, HQLabel, HQText } from '../hq-components';
import hqStyles from '../hq-styles';
import NavigationService from '../NavigationService';
import { NewCommentNavigationProps } from '../screens/NewCommentScreen';
import { CommentModel } from '../server-models';
import AgreementLabel from './AgreementLabel';
import FriendlyDateTime from './FriendlyDateTime';
import ReplyButton from './ReplyButton';
import TextWithShortLinks from './TextWithShortLinks';
import UpvoteButton from './UpvoteButton';

interface Props {
  comment: CommentModel;
  isNested?: boolean;
  renderChildComments?: boolean;
  questionId?: number;
  answerId?: number;
  onUpvote?: (on: boolean, answerId: number, commentId: number) => void;
}

export default class CommentCard extends React.Component<Props> {

  public constructor(props: Props) {
    super(props);

    this.handleNewComment = this.handleNewComment.bind(this);
  }

  public render() {
    const { comment, isNested, renderChildComments = true, questionId, answerId, onUpvote } = this.props;
    const { id: commentId, agreementRating, text, source, postedBy, postedAt, comments } = comment;
    const { upvotes, upvotedByMe } = comment;
    const showActions = questionId && answerId && onUpvote;

    return (
      <View style={isNested ? hqStyles.ml1 : null}>
        <HQCard style={hqStyles.p1}>
          <View style={[hqStyles.rowJustifySpace, hqStyles.mb1]}>
            <View style={hqStyles.row}>
              <AgreementLabel isAgree={agreementRating === 'Agree'} />
              <HQText style={[hqStyles.ml1, hqStyles.vAlignCenter]}>{postedBy}, </HQText>
              <FriendlyDateTime style={hqStyles.vAlignCenter} value={postedAt} />
            </View>
            {showActions && (
              <UpvoteButton
                answerId={answerId}
                commentId={commentId}
                count={upvotes}
                isUpvotedByLoggedInUser={upvotedByMe}
                onUpvote={onUpvote}
              />
            )}
          </View>
          <HQText style={hqStyles.mb1}>{text}</HQText>
          {source ?
            <View style={[hqStyles.row, hqStyles.mb1]}>
              <HQLabel>Source: </HQLabel>
              <TextWithShortLinks value={source} />
            </View>
            : null
          }
          {showActions && (
            <View style={hqStyles.rowAlignEnd}>
              <ReplyButton onPress={this.handleNewComment} />
            </View>
          )}
        </HQCard>
        {
          (renderChildComments && comments && comments.length > 0) &&
          <FlatList
            data={comment.comments}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <CommentCard
                comment={item}
                isNested={true}
                questionId={questionId}
                answerId={answerId}
                onUpvote={onUpvote}
              />
            )}
          />
        }
      </View>
    );
  }

  private handleNewComment() {
    const { questionId, answerId, comment } = this.props;
    const params: NewCommentNavigationProps = { questionId, answerId, parentComment: comment };
    NavigationService.navigate('NewComment', params);
  }
}
