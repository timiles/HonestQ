import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { HQCard, HQLabel, HQText } from '../hq-components';
import hqStyles from '../hq-styles';
import { CommentModel } from '../server-models';
import TextWithShortLinks from './TextWithShortLinks';

interface Props {
  comment: CommentModel;
}

export default class CommentCard extends React.Component<Props> {

  public render() {
    const { comment } = this.props;
    const { agreementRating, text, source, postedBy, postedAt, comments } = comment;

    return (
      <View style={hqStyles.ml1}>
        <HQCard style={styles.commentCardStyle}>
          <View style={[hqStyles.flexRow, hqStyles.mb1]}>
            <HQText>{agreementRating}</HQText>
            <HQText style={hqStyles.ml1}>{postedBy}, {postedAt}</HQText>
          </View>
          <HQText style={hqStyles.mb1}>{text}</HQText>
          {source ?
            <View style={hqStyles.flexRow}>
              <HQLabel>Source: </HQLabel>
              <TextWithShortLinks value={source} />
            </View>
            : null
          }
        </HQCard>
        {(comments && comments.length > 0) &&
          <FlatList
            data={comment.comments}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <CommentCard comment={item} />}
          />
        }
      </View>
    );
  }
}

const commentCardStyle: StyleProp<ViewStyle> = {
  padding: 10,
};
const styles = StyleSheet.create({ commentCardStyle });
