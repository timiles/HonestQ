import React from 'react';
import { Share } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import ShareIcon from '../svg-icons/ShareIcon';

interface Props {
  fill: string;
  url: string;
}

export default class ShareButton extends React.Component<Props> {

  constructor(props: Props) {
    super(props);

    this.share = this.share.bind(this);
  }

  public render() {
    const { fill } = this.props;

    return (
      <TouchableOpacity onPress={this.share}>
        <ShareIcon fill={fill} />
      </TouchableOpacity>
    );
  }

  private share() {
    Share.share({ message: this.props.url });
  }
}
