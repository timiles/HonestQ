import React from 'react';
import { View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { HQCard, HQLabel, HQPrimaryButton, HQText } from '../hq-components';
import hqStyles from '../hq-styles';
import { CommentModel } from '../server-models';
import AgreeIcon from '../svg-icons/AgreeIcon';
import DisagreeIcon from '../svg-icons/DisagreeIcon';
import AgreementLabel from './AgreementLabel';
import FriendlyDateTime from './FriendlyDateTime';
import NewCommentCard from './NewCommentCard';
import TextWithShortLinks from './TextWithShortLinks';

interface Props {
  questionId: number;
  answerId: number;
  comment: CommentModel;
}

interface State {
  replyWithAgreementRating?: string;
}

export default class CommentCard extends React.Component<Props, State> {

  public constructor(props: Props) {
    super(props);

    this.state = {};

    this.handleNewCommentAgree = this.handleNewCommentAgree.bind(this);
    this.handleNewCommentDisagree = this.handleNewCommentDisagree.bind(this);
    this.handleNewCommentCancel = this.handleNewCommentCancel.bind(this);
  }

  public render() {
    const { questionId, answerId, comment } = this.props;
    const { id: commentId, agreementRating, text, source, postedBy, postedAt, comments } = comment;
    const { replyWithAgreementRating } = this.state;

    return (
      <View style={hqStyles.ml1}>
        <HQCard style={hqStyles.p1}>
          <View style={[hqStyles.flexRow, hqStyles.mb1]}>
            <AgreementLabel isAgree={agreementRating === 'Agree'} />
            <HQText style={[hqStyles.ml1, hqStyles.vAlignCenter]}>{postedBy}, </HQText>
            <FriendlyDateTime style={hqStyles.vAlignCenter} value={postedAt} />
          </View>
          <HQText style={hqStyles.mb1}>{text}</HQText>
          {source ?
            <View style={[hqStyles.flexRow, hqStyles.mb1]}>
              <HQLabel>Source: </HQLabel>
              <TextWithShortLinks value={source} />
            </View>
            : null
          }
          <View style={hqStyles.flexRow}>
            <HQLabel style={[hqStyles.vAlignCenter, hqStyles.mr1]}>Reply:</HQLabel>
            <HQPrimaryButton
              style={[hqStyles.flexRow, hqStyles.mr1]}
              onPress={this.handleNewCommentAgree}
            >
              <AgreeIcon fill="#fff" />
            </HQPrimaryButton>
            <HQPrimaryButton
              style={[hqStyles.flexRow]}
              onPress={this.handleNewCommentDisagree}
            >
              <DisagreeIcon fill="#fff" />
            </HQPrimaryButton>
          </View>
        </HQCard>
        {replyWithAgreementRating &&
          <View style={hqStyles.ml1}>
            <NewCommentCard
              questionId={questionId}
              answerId={answerId}
              agreementRating={replyWithAgreementRating}
              parentCommentId={commentId}
              onCancel={this.handleNewCommentCancel}
            />
          </View>
        }
        {(comments && comments.length > 0) &&
          <FlatList
            data={comment.comments}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <CommentCard questionId={questionId} answerId={answerId} comment={item} />}
          />
        }
      </View>
    );
  }

  private handleNewCommentAgree() {
    this.setState({ replyWithAgreementRating: 'Agree' });
  }
  private handleNewCommentDisagree() {
    this.setState({ replyWithAgreementRating: 'Disagree' });
  }
  private handleNewCommentCancel() {
    this.setState({ replyWithAgreementRating: undefined });
  }
}
