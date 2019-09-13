import React from 'react';
import { View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import hqColors from '../hq-colors';
import hqStyles from '../hq-styles';

interface Props {
  fill?: string;
}
export default class DisagreeIcon extends React.Component<Props> {

  public render() {
    const { fill = hqColors.AgreementLabelBlue } = this.props;
    const width = 14;

    // tslint:disable:max-line-length
    return (
      <View style={hqStyles.icon}>
        <Svg viewBox="0 0 357 357" width={width} height={width} fill={fill}>
          <Polygon points="357,35.7 321.3,0 178.5,142.8 35.7,0 0,35.7 142.8,178.5 0,321.3 35.7,357 178.5,214.2 321.3,357 357,321.3 214.2,178.5" />
        </Svg>
      </View>
    );
  }
}
