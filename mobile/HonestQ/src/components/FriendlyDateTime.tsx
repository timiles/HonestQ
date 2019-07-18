import moment from 'moment';
import React from 'react';
import { Alert, TextProps } from 'react-native';
import { HQText } from '../hq-components';

interface OwnProps {
  value: string;
}
type Props = OwnProps & TextProps;

export default class FriendlyDateTime extends React.Component<Props> {

  public render() {
    const { style, value } = this.props;

    const dateTimeMoment = moment(value);
    // Client time could be behind Server time - avoid printing 'in a few seconds'
    const friendlyTime = dateTimeMoment.isAfter(moment.now()) ? 'just now' : dateTimeMoment.fromNow();
    const fullTime = dateTimeMoment.format('LLLL');

    return (
      <HQText style={style} onPress={() => Alert.alert(fullTime)}>{friendlyTime}</HQText>
    );
  }
}
