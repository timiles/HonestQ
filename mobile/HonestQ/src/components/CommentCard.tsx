import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { HQCard, HQText } from '../hq-components';
import { CommentModel } from '../server-models';

interface Props {
  comment: CommentModel;
}

export default class CommentCard extends React.Component<Props> {

  public render() {
    const { comment } = this.props;
    const { agreementRating, text, postedBy, postedAt, comments } = comment;

    return (
      <View style={styles.indentStyle}>
        <HQCard style={styles.commentCardStyle}>
          <HQText>{agreementRating}</HQText>
          <HQText>{postedAt}</HQText>
          <HQText>{postedBy}</HQText>
          <HQText>{text}</HQText>
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

const indentStyle: StyleProp<ViewStyle> = {
  marginLeft: 10,
};
const commentCardStyle: StyleProp<ViewStyle> = {
  padding: 10,
};
const styles = StyleSheet.create({ indentStyle, commentCardStyle });
