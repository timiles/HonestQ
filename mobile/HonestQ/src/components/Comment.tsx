import React from 'react';
import { Text, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { CommentModel } from '../server-models';

interface Props {
  comment: CommentModel;
}

export default class Comment extends React.Component<Props> {

  public render() {
    const { comment } = this.props;
    const { agreementRating, text, postedBy, postedAt, comments } = comment;

    return (
      <View style={{ paddingLeft: 10 }}>
        <Text>{agreementRating}</Text>
        <Text>{postedAt}</Text>
        <Text>{postedBy}</Text>
        <Text>{text}</Text>
        {(comments && comments.length > 0) &&
          <FlatList
            data={comment.comments}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <Comment comment={item} />}
          />
        }
      </View>
    );
  }
}
