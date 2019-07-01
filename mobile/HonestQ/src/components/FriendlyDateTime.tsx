import moment from 'moment';
import React from 'react';
import { Alert, TextProps } from 'react-native';
import { HQText } from '../hq-components';
import { parseDateWithTimeZoneOffset } from '../utils/string-utils';

interface OwnProps {
  value: string;
}
type Props = OwnProps & TextProps;

export default class FriendlyDateTime extends React.Component<Props> {

  public render() {
    const { style, value } = this.props;
    const offsetHours = new Date().getTimezoneOffset() / -60;
    const dateTimeOffset = parseDateWithTimeZoneOffset(value, offsetHours);
    const dateTimeMoment = moment(dateTimeOffset);
    const friendlyTime = dateTimeMoment.fromNow();
    const fullTime = dateTimeMoment.format('LLLL');

    return (
      <HQText style={style} onPress={() => Alert.alert(fullTime)}>{friendlyTime}</HQText>
    );
  }
}
