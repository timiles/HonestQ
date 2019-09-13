import React from 'react';
import { View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import hqColors from '../hq-colors';
import hqStyles from '../hq-styles';

interface Props {
  fill?: string;
}
export default class AgreeIcon extends React.Component<Props> {

  public render() {
    const { fill = hqColors.AgreementLabelBlue } = this.props;
    return (
      <View style={hqStyles.icon}>
        <Svg viewBox="0 0 448.8 448.8" width={21} height={16} fill={fill}>
          <Polygon points="142.8,323.85 35.7,216.75 0,252.45 142.8,395.25 448.8,89.25 413.1,53.55" />
        </Svg>
      </View>
    );
  }
}
