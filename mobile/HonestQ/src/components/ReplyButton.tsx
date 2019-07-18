import React from 'react';
import { View } from 'react-native';
import { HQPrimaryButton, HQText } from '../hq-components';
import hqStyles from '../hq-styles';
import CommentIcon from '../svg-icons/CommentIcon';

interface Props {
  onPress: () => void;
}

export default class ReplyButton extends React.Component<Props> {

  public render() {
    return (
      <HQPrimaryButton onPress={this.props.onPress}>
        <View style={hqStyles.flexRow}>
          <CommentIcon />
          <HQText style={[hqStyles.ml1, hqStyles.primaryButtonText]}>Reply</HQText>
        </View>
      </HQPrimaryButton>
    );
  }
}
